const Joi = require("joi");

// Schéma de validation
const permissionSchema = Joi.object({
  fk_categories: Joi.number().integer().required(),
  fk_users: Joi.number().integer().required(),
  fk_tenant: Joi.string().max(100).required(),
});

const validatePermission = (req, res, next) => {
  const { error } = permissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validatePermission;
