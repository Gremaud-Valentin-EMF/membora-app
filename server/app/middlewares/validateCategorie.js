const Joi = require("joi");

// Schéma de validation
const categorieSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  fk_tenant: Joi.string().max(100).required(),
});

const validateCategorie = (req, res, next) => {
  const { error } = categorieSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateCategorie;
