const express = require("express");
const app = express();
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/events"); //event constructor made from mongoose

app.use(express.json());

app.use(
  "/api",
  graphqlHttp({
    schema: buildSchema(`

    type Event {
      id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float! 
      date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation{
        createEvent(eventInput: EventInput): Event
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
    `),
    rootValue: {
      // each function is a 'resolver'
      events: () => {
        return Event.find().then(events => {
          console.log(events);
          return events.map(event => event);
        });
      },
      createEvent: ({ eventInput: { title, description, price, date } }) => {
        const event = new Event({
          title,
          description,
          price,
          date: new Date(date)
        });
        return event // need to return this as graphql is expecting an event to be returned
          .save()
          .then(
            result => {
              //response from mongoDb
              return { ...result._doc }; // result contains meta data, spreading _doc gives info
            } // we want e.g. title,desc,price & date.
          )
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `
    mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventsbookingsdb-abaev.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
    `,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Heads up on 9090");
    app.listen(9090);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;
