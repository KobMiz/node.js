const Joi = require("joi");

const userSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().required().messages({
      "string.empty": "First name is required and cannot be empty.",
    }),
    middle: Joi.string().allow("").optional(),
    last: Joi.string().required().messages({
      "string.empty": "Last name is required and cannot be empty.",
    }),
  }).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password length must be at least 8 characters long.",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
    }),
  address: Joi.object({
    country: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    houseNumber: Joi.number().required(),
  }).required(),
  isAdmin: Joi.boolean().optional(),
  isBusiness: Joi.boolean().optional(),
});

module.exports = { userSchema };
