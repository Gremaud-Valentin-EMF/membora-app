const Joi = require("joi");

// Schéma de validation
const presenceSchema = Joi.object({
  fk_events: Joi.number().integer().required(),
  fk_users: Joi.number().integer().required(),
  fk_tenant: Joi.string().max(100).required(),
});

const validatePresence = (req, res, next) => {
  const { error } = presenceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validatePresence;
