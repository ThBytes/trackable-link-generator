const { Schema, model } = require("mongoose");

const linkSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  views: {
    type: Number,
    default: 0,
  },
  uuid: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports.Link = model("Link", linkSchema);
