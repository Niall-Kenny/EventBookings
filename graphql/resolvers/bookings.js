const Event = require("../../server/models/event"); //constructor made from mongoose
const Booking = require("../../server/models/booking");
const { transformBooking, transformEvent } = require("./resolverUtils/utils");

module.exports = {
  // each function is a 'resolver'
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    try {
      const bookings = await Booking.find();

      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },

  bookEvent: async ({ eventId }, req) => {
    console.log(eventId);
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    const event = await Event.findOne({ _id: eventId });
    console.log(event);
    const booking = new Booking({
      user: req.userId,
      event
    });
    const result = await booking.save();

    return transformBooking(result);
  },
  cancelBooking: async ({ bookingId }, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    try {
      const booking = await Booking.findById(bookingId).populate("event");
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
