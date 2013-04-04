Entity = new Meteor.Collection("entity");

BOARDSIZE = {x: 40, y: 20};

var random_position = function() {
  return {
    x: Math.floor(Math.random() * BOARDSIZE.x),
    y: Math.floor(Math.random() * BOARDSIZE.y)
  }
}

if (Meteor.isClient) {

  var KEYS_TO_XY_CHANGE = {
    37: {'position.x':-1, 'position.y': 0}, // left
    39: {'position.x': 1, 'position.y': 0}, // right
    38: {'position.x': 0, 'position.y': -1}, // up
    40: {'position.x': 0, 'position.y': 1}, // down
  };

  $(document).keydown(function(e) {
    e.preventDefault();
    change = KEYS_TO_XY_CHANGE[e.keyCode] || {};
    Entity.update({_id: Meteor.user().profile.entity_id},
      {$inc: change}
    );
  });

  Template.world_grid.helpers({
    eachRow: function() {return _.range(BOARDSIZE.y);},
    eachCell: function() {
      var y = this.valueOf();
      return _.range(BOARDSIZE.x).map(function(x) {
        return {x:x, y:y};
      });
    }
  })

  Template.cell.helpers({
    renderCell: function() {
      var entity = Entity.findOne({position: {x: this.x, y: this.y}});
      if (entity) {
          return entity.display;
      } else {
        return "_";
      }
    }
  });

  Template.scoreboard.helpers({
    players_by_score: function() {
      return Entity.find({score: {$exists: true}}, {sort: ['score']}).fetch()
    }
  });


} else {
  // SERVER code, todo: move
  Accounts.onCreateUser(function(options, user) {
    var entity_id = Entity.insert({
      position: { x: 0, y: 0},
      display: options.profile.name[0],
      name: options.profile.name[0],
    });

    user.profile = options.profile;
    user.profile.entity_id = entity_id;
    // TODO add saving user profile image url to profile
    return user;
  });

  // candy game code
  (function() {
    Meteor.startup(function(){
      update_candy();
      reset_candyloop();
    });

    var update_candy = function() {
      Entity.remove({reward: {$exists: true}});
      var candy_position = random_position();
      Entity.insert({
        reward: 2, // arbitrary point value
        position: candy_position, // arbitrary point value
        display: '%' // arbitrary point value
      });

      var players_at_candy = Entity.find({
        score: {$exists: true},
        position: candy_position
      });
      if (players_at_candy.count() > 0) {
        // TODO Keep fixing from here AMK
        //update_candy(); // bad location, let's try again
      } else {
        var observer = players_at_candy.observe({
          added: function(player_got_to_candy) {
            observer.stop();
            // is the candy still there, or is this an old observer?
            if (Entity.findOne({reward: {$exists: true}, position: candy_position})) {
              Entity.update({_id: player_got_to_candy._id},
                {$inc: {score: 2}});
              reset_candyloop();
              update_candy();
            }
          }
        });
      }
    };

    var candyloop_interval_id = 0;
    var reset_candyloop = function() {
      Meteor.clearInterval(candyloop_interval_id);
      candyloop_interval_id = Meteor.setInterval(update_candy, 2000);
    };
  })(); // /candy game code



  Entity.allow({
    update: function(userId, old_entity, fieldNames, mods) {
      var changable_fieldnames = ['position'];
      if (_.difference(fieldNames, changable_fieldnames).length) {
        return false;  //we don't let you change this field from client
      }

      var new_entity = EJSON.clone(old_entity);
      LocalCollection._modify(new_entity, mods);
      if (_.contains(fieldNames, 'position')) {
        return new_entity.position.x >= 0
            && new_entity.position.y >= 0
            && new_entity.position.x < BOARDSIZE.x
            && new_entity.position.y < BOARDSIZE.y;
      }
      return true;
    }
  });
}
