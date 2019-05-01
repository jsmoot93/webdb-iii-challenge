    
const express = require("express");
const helmet = require("helmet");

const cohortsRouter = require("./routes/cohorts-route.js");

const server = express();

//Middleware
server.use(express.json());
server.use(helmet());

//Routes Middleware
server.use("/api/cohorts", cohortsRouter);

module.exports = server;