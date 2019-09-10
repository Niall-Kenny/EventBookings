const express = require("express");
const app = express();
const graphqlHttp = require("express-graphql");
const cors = require("cors");

const isAuthenticated = require("./middleware/auth");

const graphqlSchema = require("../graphql/schema/index");
const resolvers = require("../graphql/resolvers/index");

app.use(express.json());

app.use(cors());

app.use(isAuthenticated);

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: resolvers,
    graphiql: true
  })
);

module.exports = app;
