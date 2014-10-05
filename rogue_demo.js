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

Meteor.startup(function() {
  if (BoardObject.find().count() == 0) {
    var entity_id = BoardObject.insert({
        position: {x: 2, y:2},
        display: 'A',
        display_color: "rgb(0,0,255)",
        name: 'Alexey',
        score: 0
      });
  }
});

if (Meteor.isClient) {
  Template.grid_world.helpers({
    row: function() { return _.range(BOARDSIZE.y);},
    cell: function() { return _.range(BOARDSIZE.x);},
    player_at_cell: function(x) {
      var player = BoardObject.findOne({position: {x: x, y: 2}});
      if (player) {
        return "A"; // player.display;
      }
      return "_";
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
