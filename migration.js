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
  });
}
