const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  stockSymbol: String,
  quantity: Number,
  price: Number,
  mode: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = { OrdersSchema };
