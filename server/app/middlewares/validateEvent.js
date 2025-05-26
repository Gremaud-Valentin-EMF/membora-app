const Joi = require("joi");

// Schéma de validation
const eventSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  date: Joi.date().required(),
  fk_categories: Joi.number().integer().required(),
  fk_users: Joi.number().integer().required(),
  fk_tenant: Joi.string().max(100).required(),
});

const validateEvent = (req, res, next) => {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateEvent;
