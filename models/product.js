const mongoose = require('mongoose');
const {Schema} = mongoose;
const Brand = require('./brand');
const user = require('./user');
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, "name cannot be blank"],
  },
  brand: {
    type: String,
    required: [true, "brand cannot be blank"],
    lowercase: true,
  },
  price: {
    type: Number,
    required: [true, "price must be a number and cannot be blank"],
  },
  quantity: {
    type: Number,
    required: [true, "quantity must be a number and cannot be blank"],
    min: 0,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});



module.exports = mongoose.model('Products', ProductSchema)