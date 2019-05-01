const router = require("express").Router();
const knex = require("knex");

const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: "./data/lambda.sqlite3"
  },
  useNullAsDefault: true,
  debug: true
};

const db = knex(knexConfig);

router
  .route("/")
  .get(async (req, res) => {
    try {
      const cohorts = await db("cohorts");
      res.status(200).json(cohorts);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong retrieving the cohorts." });
    }
  })
  .post(async (req, res) => {
    if (!req.body.name) {
      res
        .status(400)
        .json({ message: "Please provide a name for your cohort." });
    }
    try {
      const [cohort_id] = await db("cohorts").insert(req.body);
      const newCohort = await db("cohorts")
        .where({ cohort_id })
        .first();
      res.status(201).json(newCohort);
    } catch (error) {
      res
        .status(500)
        .json({ message: "There was an error adding the cohort." });
    }
  });

router
  .route("/:cohort_id")
  .get(async (req, res) => {
    const { cohort_id } = req.params;
    try {
      const cohort = await db("cohorts")
        .where({ cohort_id })
        .first();
      if (cohort) {
        console.log("cohort is truthy");
        res.status(200).json(cohort);
      } else {
        console.log("cohort is falsey");
        res.status(404).json({ message: "The cohort could not be located." });
      }
    } catch (error) {
      console.log("uh oh error");
      res
        .status(500)
        .json({ message: "Something went wrong looking up the cohort." });
    }
  })
  .put(async (req, res) => {
    const { cohort_id } = req.params;
    if (!req.body.name) {
      res
        .status(400)
        .json({ message: "Please provide an updated name for the cohort." });
    }
    try {
      const count = await db("cohorts")
        .where({ cohort_id })
        .update(req.body);
      if (count) {
        const updatedCohort = await db("cohorts")
          .where({ cohort_id })
          .first();
        res.status(200).json(updatedCohort);
      } else {
        res.status(404).json({ message: "The cohort could not be located." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong trying to update the cohort." });
    }
  })
  .delete(async (req, res) => {
    const { cohort_id } = req.params;
    try {
      const count = await db("cohorts")
        .where({ cohort_id })
        .del();
      if (count) {
        res.status(200).end();
      } else {
        res.status(404).json({ message: "The cohort could not be located." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong trying to delete the cohort." });
    }
  });

router.route("/:cohort_id/students").get(async (req, res) => {
  const { cohort_id } = req.params;
  try {
    const students = await db("students")
      .innerJoin("cohorts", "cohorts.cohort_id", "students.cohort_id")
      .select({
        studentName: "students.name",
        cohort: "cohorts.name"
      })
      .where({ "cohorts.cohort_id": cohort_id });
    if (students) {
      res.status(200).json(students);
    } else {
      res
        .status(404)
        .json({ message: "There are no students in the specified cohort." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong retrieving the students for that cohort."
    });
  }
});

module.exports = router;