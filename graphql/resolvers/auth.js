const bcrypt = require("bcrypt");
const User = require("../../server/models/user");

module.exports = {
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
