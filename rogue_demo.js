var BOARDSIZE = {x: 60, y: 15};

BoardObject = new Meteor.Collection("entity");

var random_empty_position = function() {
  var guess = {
    x: Math.floor(Math.random() * BOARDSIZE.x),
    y: Math.floor(Math.random() * BOARDSIZE.y)
  };

  if (!BoardObject.findOne({position: guess})) {
    return guess;
  } else {
    return random_empty_position();  // try again
  }
}

if (Meteor.isClient) {
  Template.grid_world.helpers({
    row: function() { return _.range(BOARDSIZE.y);},
    cell: function() { return _.range(BOARDSIZE.x);},
    player_at_cell: function(position) {
      var player = BoardObject.findOne({position: position.hash});
      if (player) {
        return player.display;
      }
      return "_";
    }
  });

  var KEYS_TO_XY_CHANGE = {
    37: {'position.x':-1, 'position.y': 0}, // left
    39: {'position.x': 1, 'position.y': 0}, // right
    38: {'position.x': 0, 'position.y': -1}, // up
    40: {'position.x': 0, 'position.y': 1}, // down
  };

  $(document).keydown(function(e) {
    e.preventDefault();
    change = KEYS_TO_XY_CHANGE[e.keyCode] || {};
    if (Meteor.userId()) {
      BoardObject.update({_id: Meteor.user().profile.board_object},
        {$inc: change}
      );
    }
  });
}

if (Meteor.isServer) {
 Accounts.onCreateUser(function(options, user) {
    var entity_id = BoardObject.insert({
      position: random_empty_position(),
      display: options.profile.name[0],
      display_color: "rgb(0,0,255)",
      display_photourl:
        "http://graph.facebook.com/" + user.services.facebook.id + "/picture",
      name: options.profile.name,
      score: 0
    });

    user.profile = options.profile;
    user.profile.board_object = entity_id;
    return user;
  });
}
