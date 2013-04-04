Entity = new Meteor.Collection("entity");

BOARDSIZE = {x: 60, y: 20};

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


  Entity.allow({
    update: function(userId, old_entity, fieldNames, mods) {
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
