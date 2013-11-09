BOARDSIZE = {x: 40, y: 30};
var MapObject = new Meteor.Collection("entities");

if (Meteor.isClient) {
  var KEYS_TO_XY_CHANGE = {
    37: {'x':-1, 'y': 0}, // left
    39: {'x': 1, 'y': 0}, // right
    38: {'x': 0, 'y': -1}, // up
    40: {'x': 0, 'y': 1}, // down
  };

  Meteor.startup(function() {
    var grid_div = $(window.document);
    console.log(grid_div);
    grid_div.keydown(function(e) {
      console.log("keydown!");
      var change = KEYS_TO_XY_CHANGE[e.keyCode] || {};
      e.preventDefault();
      console.log("still here!");
      var map_id = Meteor.user().profile.entity_id;
      MapObject.update(map_id, {$inc: change});
    });
  });

  window.MapObject = MapObject;
  Template.grid.helpers({
   "eachRow": function() {
      return _.range(BOARDSIZE.y);
   },
   "eachCell": function() {
      var y = this.valueOf();
      return _.range(BOARDSIZE.x).map(function(x) {
         return {x:x, y:y};
      });
    }
  });

  Template.cell.helpers({
    "render_player": function() {
      // there is a player at my XY {
      var at_location = MapObject.findOne({x: this.x, y: this.y});
      if (at_location) {
        return at_location.display_character;
      } else {
        return "_";
      }
    }
  });
}

if (Meteor.isServer) {
  Accounts.onCreateUser(function(options, user) {
    console.log(user);
    var entity_id = MapObject.insert({
      x: 10,
      y: 20,
      display_character: user.services.facebook.name[0],
      //display_color: "rgb(0,0,255)",
      //display_photourl:
      //  "http://graph.facebook.com/" + user.services.facebook.id + "/picture",
      score: 0
    });

    user.profile = options.profile || {};
    user.profile.entity_id = entity_id;
    // TODO add saving user profile image url to profile
    return user;
  });
}
