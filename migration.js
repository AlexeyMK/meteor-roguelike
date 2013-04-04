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
  });
}
