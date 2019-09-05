const Event = require("../../../server/models/event");
const User = require("../../../server/models/user");
const { dateToString } = require("../../../utils/date");

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
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
      password: null,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const getSingleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    user: getUser(booking._doc.user),
    event: getSingleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: getUser(event._doc.creator)
  };
};
module.exports = {
  transformBooking,
  transformEvent
};
