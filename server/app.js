const express = require("express");
const app = express();
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const bcrypt = require("bcrypt");

const Event = require("./models/event"); //event constructor made from mongoose
const User = require("./models/user");

app.use(express.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`

    type User{
      _id: ID!
      email: String!
      password: String
      
    }
    input UserInput{
      email: String!
      password: String!
    }

    type Event {
      _id: ID!
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
        createUser(userInput: UserInput): User
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
    `),
    rootValue: {
      // each function is a 'resolver'
      events: () => {
        return Event.find().then(events => events.map(event => event));
      },
      createEvent: ({ eventInput: { title, description, price, date } }) => {
        const event = new Event({
          title,
          description,
          price,
          date: new Date(date),
          creator: "5d6eb48c7c23e30825a30a66"
        });
        let createdEvent;
        return event // need to return this as graphql is expecting an event to be returned
          .save()
          .then(result => {
            //response from mongoDb
            createdEvent = { ...result._doc }; // result contains meta data, spreading _doc gives info
            return User.findById("5d6eb48c7c23e30825a30a66"); // we only want e.g. title,desc,price & date.^^
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(() => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: ({ userInput: { email, password } }) => {
        return User.findOne({ email })
          .then(user => {
            if (user) {
              throw new Error("User exists already");
            }
            return bcrypt.hash(password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

module.exports = app;
