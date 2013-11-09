Entity = new Meteor.Collection("entity");

BOARDSIZE = {x: 40, y: 20};

var random_empty_position = function() {
  var guess = {
    x: Math.floor(Math.random() * BOARDSIZE.x),
    y: Math.floor(Math.random() * BOARDSIZE.y)
  };

  if (!Entity.findOne({position: guess})) {
    return guess;
  } else {
    return random_empty_position();  // try again
  }
}

if (Meteor.isClient) {

  var KEYS_TO_XY_CHANGE = {
    37: {'position.x':-1, 'position.y': 0}, // left
    39: {'position.x': 1, 'position.y': 0}, // right
    38: {'position.x': 0, 'position.y': -1}, // up
    40: {'position.x': 0, 'position.y': 1}, // down
  };

  $(window.document).keydown(function(e) {
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
    cell_contents: function() {
      var entity = Entity.findOne({position: {x: this.x, y: this.y}});
      return entity || {display: "_"};
    },
    get_body: function() {
      if (this.display_photourl) {
        return "<img class='fb_profilephoto' src='"+this.display_photourl+"'></img>";
      } else {
        return this.display;
      }
    },
    get_color: function() {
      if (Meteor.user() && Meteor.user().profile.entity_id == this._id) {
        return "rgb(0,255,0)";  // you are green
      }

      return this.display_color || "rgb(0,0,0)";  // default color is black
    }
  });

  Template.scoreboard.helpers({
    players_by_score: function() {
      return Entity.find({score: {$exists: true, $gt: 0}}, {sort: [['score', 'desc']]}).fetch()
    }
  });


} else {
  // SERVER code, todo: move
  Accounts.onCreateUser(function(options, user) {
    var entity_id = Entity.insert({
      position: random_empty_position(),
      display: options.profile.name[0],
      display_color: "rgb(0,0,255)",
      display_photourl:
        "http://graph.facebook.com/" + user.services.facebook.id + "/picture",
      name: options.profile.name,
      score: 0
    });

    user.profile = options.profile;
    user.profile.entity_id = entity_id;
    // TODO add saving user profile image url to profile
    return user;
  });

  // candy game code
  (function() {
    var CANDY_DURATION_MS = 4000, CANDY_REWARD = 2, timeout_id = 0, observer;

    Meteor.startup(function(){
      new_candy_location();
    });

    var new_candy_location = function() {
      // out with the old
      Meteor.clearTimeout(timeout_id);
      timeout_id = Meteor.setTimeout(new_candy_location, CANDY_DURATION_MS);
      Entity.remove({type: 'candy'});
      if (observer) {
        observer.stop();  // stop listening for players arriving at old candy
      }

      // in with the new
      var candy_position = random_empty_position();
      Entity.insert({
        type: 'candy',
        position: candy_position,
        display: '%', // arbitrary
        display_color: 'rgb(255,0,0)'
      });

      var players_at_candy = Entity.find({
        score: {$exists: true},
        position: candy_position
      });

      observer = players_at_candy.observe({
        added: function(point_winner) {
          Entity.update({_id: point_winner._id},
            {$inc: {score: CANDY_REWARD}});
          new_candy_location();
        }
      });
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
