const mongoose = require('mongoose');
const {Schema} = mongoose;

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

module.exports = mongoose.model('Brand', brandSchema);