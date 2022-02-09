const mongoose = require('mongoose');
const {Schema} = mongoose;
const Products = require('../models/product');


const brandSchema = new Schema({
    name:{
        type:String,
        required:true,
        lowercase:true
    },
    product:[
        {
            type:Schema.Types.ObjectId,
            ref:'Products'
        }
    ]
})

brandSchema.post("findByIdAndDelete", async function (brand) {
  await Products.deleteMany({
    _id: {
      $in: brand.product,
    },
  });
});

module.exports = mongoose.model('Brand', brandSchema);