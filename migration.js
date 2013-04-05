// database migrations
Migrations = new Meteor.Collection('migrations');

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Migrations.findOne({name: "addscore"})) {
      Meteor.users.find().forEach(function (user) {
        Entity.update(user.profile.entity_id, {$set: {
          name: user.profile.name,
          score: 0
        }});
      });
      Migrations.insert({name: "addscore"});
    }
    if (!Migrations.findOne({name: "addscore4"})) {
      Entity.update({name: {$exists: true}, score: {$exists: false}},
        {$set: {score: 0}}, {multi: true}
      );
      Migrations.insert({name: "addscore4"});
    }

    if (!Migrations.findOne({name: "players_back_to_range"})) {
      Entity.find({$or: [{'position.x': {$gte: BOARDSIZE.x}},
                         {'position.y': {$gte: BOARDSIZE.y}}]
      }).forEach(function (entity) {
        Entity.update({_id: entity._id}, {$set: {
          position: random_empty_position(),
        }});
      });
      Migrations.insert({name: "players_back_to_range"});
    }
    if (!Migrations.findOne({name: "kill_rewards"})) {
      Entity.remove({reward: {$exists: true}});
      Migrations.insert({name: "kill_rewards"});
    }
    if (!Migrations.findOne({name: "add_photos2"})) {
      Meteor.users.find({}, { fields: { services: 1, profile:1 } }
      ).forEach(function (user) {
        console.log("updating photos for ", user);
        Entity.update({_id: user.profile.entity_id}, {
          $set: {display_photourl:
            "http://graph.facebook.com/" + user.services.facebook.id + "/picture"
        }});
      });
      Migrations.insert({name: "add_photos2"});
    }
  });
}
