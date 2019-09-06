const Event = require("../../server/models/event"); //constructor made from mongoose
const User = require("../../server/models/user");
const { transformEvent } = require("./resolverUtils/utils");

module.exports = {
  // each function is a 'resolver'
  events: async () => {
    const events = await Event.find();
    return events.map(event => {
      return transformEvent(event);
    });
  },
  createEvent: async (
    { eventInput: { title, description, price, date } },
    req
  ) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }

    const event = new Event({
      title,
      description,
      price,
      date: new Date(date),
      creator: req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      //response from mongoDb
      createdEvent = transformEvent(result);
      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.createdEvents.push(event);
      await user.save();
      return createdEvent;
    } catch (err) {
      throw err;
    }
  }
};
