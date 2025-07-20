const membreService = require("./membreService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authService = {
  async register({ email, nom, password, role, tenant_id }) {
    const existing = await membreService.findByEmail(email);
    if (existing) throw new Error("Email déjà utilisé");
    const password_hash = await bcrypt.hash(password, 10);
    const membre = await membreService.create({
      email,
      nom,
      password_hash,
      role,
      tenant_id,
    });
    return membre;
  },
  async login({ email, password }) {
    const membre = await membreService.findByEmail(email);
    if (!membre) throw new Error("Email ou mot de passe incorrect");
    const valid = await bcrypt.compare(password, membre.password_hash);
    if (!valid) throw new Error("Email ou mot de passe incorrect");
    const token = jwt.sign(
      { id: membre.id, role: membre.role, tenant_id: membre.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    return { membre, token };
  },
};

module.exports = authService;
