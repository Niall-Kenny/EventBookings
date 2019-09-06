const bcrypt = require("bcrypt");
const User = require("../../server/models/user");
const jwt = require("jsonwebtoken");

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
  },
  login: async ({ email, password }) => {
    // find user by email
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email does not exist");

    // check if password is correct
    const passwordComparison = await bcrypt.compare(password, user.password);
    if (!passwordComparison) throw new Error("Password is Incorrect");

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "superSecretKey",
      {
        expiresIn: "1h"
      }
    );
    return { userId: user._id, token, tokenExpiration: 1 };
  }
};
