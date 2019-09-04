const bcrypt = require("bcrypt");
const Event = require("../../server/models/event"); //event constructor made from mongoose
const User = require("../../server/models/user");

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser(event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

// .bind & the double arrow function are two ways of achieving the same goal.
// .bind just creates another function which calls what .bind is attached to
// which is why to arrow functions also work - both methods stop the latter function
// from resolving on the file read and throwing an error.
// These functions were built to create more flexibility as mongodb alone wont allow you to
// access `events=>creator=>createdEvents=>creator` - this is effectively an infinite loop.
// mongodb stops after 1depth, creating theses functions allow for infinite depth.
const getUser = userId => async () => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};
module.exports = {
  // each function is a 'resolver'
  events: async () => {
    const events = await Event.find();
    return events.map(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser(event.creator) //creator is a User Object ~ defined in schema
      };
    });
  },
  createEvent: async ({ eventInput: { title, description, price, date } }) => {
    const event = new Event({
      title,
      description,
      price,
      date: new Date(date),
      creator: "5d70002d628e1f14e240134c"
    });
    let createdEvent;
    try {
      const result = await event.save();
      //response from mongoDb
      createdEvent = {
        ...result._doc,
        date: new Date(result._doc.date).toISOString(),
        creator: getUser(result._doc.creator)
      }; // result contains meta data, spreading _doc gives info
      const user = await User.findById("5d70002d628e1f14e240134c");
      if (!user) {
        throw new Error("User not found");
      }
      user.createdEvents.push(event);
      await user.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async ({ userInput: { email, password } }) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("User exists already");
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user_1 = new User({
        email,
        password: hashedPassword
      });
      const result = await user_1.save();
      return { ...result._doc, password: null };
    } catch (err) {
      throw err;
    }
  }
};
