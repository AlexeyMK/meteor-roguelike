var BOARDSIZE = {x: 60, y: 15};

if (Meteor.isClient) {
  Template.grid_world.helpers({
    row: function() { return _.range(BOARDSIZE.y);},
    cell: function() { return _.range(BOARDSIZE.x);},
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
