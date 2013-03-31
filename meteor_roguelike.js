Entity = new Meteor.Collection("entity");

if (Meteor.isClient) {

  var KEYS_TO_XY_CHANGE = {
    37: [-1, 0], // left
    39: [1, 0], // right
    38: [0, -1], // up
    40: [0, 1], // down
  };

  $(document).keydown(function(e) {
    //console.log("lets change");
    change = KEYS_TO_XY_CHANGE[e.keyCode] || [0,0];
    Entity.update({_id: "fWmZTarmkfgxQ84b6"},
      {$inc: {position: change}}
    );
  });

  Template.world_grid.helpers({
    rowSize: function() {return [0,1,2,3,4,5,6,7,8,9];},
    colSize: function() {return [0,1,2,3,4,5,6,7,8,9];},
    value_at_cell: function(x, y) {
      var entity = Entity.findOne({position: [x, y]});
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
