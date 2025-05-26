const Joi = require("joi");

// Schéma de validation
const memberSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(320).required(),
  password: Joi.string().min(6).max(255).required(),
  role: Joi.string().valid("membre", "responsable").required(),
  status: Joi.string().valid("pending", "active", "rejected").required(),
  fk_tenant: Joi.string().max(100).required(),
});

const validateMember = (req, res, next) => {
  const { error } = memberSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateMember;
