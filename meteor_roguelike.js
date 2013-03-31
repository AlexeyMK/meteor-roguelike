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
    change = KEYS_TO_XY_CHANGE[e.keyCode] || {};
    Entity.update({_id: "fWmZTarmkfgxQ84b6"},
      {$inc: change}
    );
  });

  Template.world_grid.helpers({
    rows: function() {return _.range(BOARDSIZE.y);},
    innerLoop: function() {
      var row = this.valueOf();
      return _.range(BOARDSIZE.x).map(function(col) {
        return [col, row]; // x, y
      });
    }
  })

  Template.cell.helpers({
    renderCell: function() {
      var x = this[0], y = this[1];
      var entity = Entity.findOne({position: {x: x, y: y}});
      if (entity) {
          return entity.display;
      } else {
        return "_";
      }
    }
  });
}



/* The idea
 * Entity, Component, System
 * Players moving around on grid
 *
 *
 */
