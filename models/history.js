const mongoose = require('mongoose');
const {Schema} = mongoose;
ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity:{
      type: Number,
    required: true,
  }
});

const historySchema = new Schema({
  cartTotal: {
    type: Number,
    required: true,
  },
  product: [ProductSchema],
  time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema)