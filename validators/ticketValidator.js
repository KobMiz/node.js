const Joi = require("joi");

const ticketSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string()
    .min(5)
    .max(1000)
    .regex(/^[^<>]+$/)
    .required(),
  status: Joi.string().valid("פתוח", "בטיפול", "סגור"),
});

module.exports = { ticketSchema };
