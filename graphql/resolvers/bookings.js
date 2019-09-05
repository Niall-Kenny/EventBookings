const Event = require("../../server/models/event"); //constructor made from mongoose
const Booking = require("../../server/models/booking");
const { transformBooking, transformEvent } = require("./resolverUtils/utils");

module.exports = {
  // each function is a 'resolver'
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },

  bookEvent: async ({ eventId }) => {
    const event = await Event.findOne({ _id: eventId });
    const booking = new Booking({
      user: "5d70002d628e1f14e240134c",
      event
    });
    const result = await booking.save();

    return transformBooking(result);
  },
  cancelBooking: async ({ bookingId }) => {
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
