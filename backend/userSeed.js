
require("dotenv").config();
const bcrypt = require("bcryptjs");
const dbConnection = require("./db");
const User = require("./models/userModel");

const createUser = async () => {
  try {
    await dbConnection();

    const email = "user@gmail.com";
    const password = "user@123";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return process.exit(0);
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({ email, password: hashPassword });
    await user.save();
    console.log("User created:", email);
    process.exit(0);
  } catch (err) {
    console.error("Error creating user:", err.message || err);
    process.exit(1);
  }
};

createUser();
