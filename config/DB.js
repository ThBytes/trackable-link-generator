const mongoose = require("mongoose");

module.exports.connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`connected to ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
