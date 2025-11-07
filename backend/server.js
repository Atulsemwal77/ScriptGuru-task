// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConnection = require("./db");
const user_Route = require("./routes/userRoute");
const board_Route = require("./routes/boardsRoute")

const app = express();

const PORT = process.env.PORT || 3434;

app.use(cors());
app.use(express.json());

app.use("/api/user", user_Route);
app.use("/api", board_Route);


app.get("/", (req, res) => {
  res.json("Welcome to backend");
});

dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
