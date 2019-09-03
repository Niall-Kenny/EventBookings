const mongoose = require("mongoose");
const app = require("./server/app");

mongoose
  .connect(
    `
    mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventsbookingsdb-abaev.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
    `,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(4000);
    console.log("Heads up on 9090");
  })
  .catch(err => {
    console.log(err);
  });
