const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  product: String,
  stockSymbol: String,
  quantity: Number,
  averagePrice: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
});

module.exports = { PositionsSchema };
