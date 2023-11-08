const { Schema, model } = require("mongoose");

const usreSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  links: [
    {
      type: Schema.Types.ObjectId,
      ref: "Link",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports.User = model("User", usreSchema);
