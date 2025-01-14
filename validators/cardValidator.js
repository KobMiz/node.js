const Joi = require("joi");

const cardSchema = Joi.object({
  title: Joi.string().required(),
  subtitle: Joi.string().optional(),
  description: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().optional(),
  web: Joi.string().uri().optional(),
  image: Joi.object({
    url: Joi.string().uri().optional(),
    alt: Joi.string().optional(),
  }).optional(),
  address: Joi.object({
    country: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    houseNumber: Joi.number().required(),
    zip: Joi.number().optional(),
  }).required(),
});

module.exports = { cardSchema };
