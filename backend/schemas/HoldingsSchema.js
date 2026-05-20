const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  stockSymbol: String,
  quantity: Number,
  averagePrice: Number,
  price: Number,
  net: String,
  day: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = { HoldingsSchema };
