const Joi = require("joi");

module.exports.productSchema = Joi.object({
  name: Joi.string().required(),
  brand: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required().min(1),
});
