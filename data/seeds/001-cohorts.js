exports.seed = function(knex, Promise) {
    return knex("cohorts")
      .truncate()
      .then(function() {
        return knex("cohorts").insert([
          { name: "Web16" },
          { name: "Web17" },
          { name: "Web18" }
        ]);
      });
  };