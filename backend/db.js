// db.js
const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const uri = process.env.MONGODB_URL;
    if (!uri) throw new Error("MONGODB_URL not set in .env");

    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || undefined,
      
    });

    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = dbConnection;
