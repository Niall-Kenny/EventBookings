const app = require("./server/app");
const http = require("http");
const mongoose = require("mongoose");

const PORT = 9090;

// mongoose
//   .connect(
//     `
//     mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster-grapghql-abaev.azure.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
//     `,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const listen = http.createServer(app);
//     app.listen(PORT, () => {
//       console.log(`Heads up on port: ${PORT}!`);
//     });
//   })
//   .catch(err => {
//     console.log(err);
//     console.log(process.env.MONGO_USER);
//   });
