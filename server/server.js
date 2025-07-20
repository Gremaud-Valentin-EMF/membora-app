require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const apiRouter = require("./app/routes/apiRouter");
const port = process.env.PORT;

const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Membora API",
    version: "1.0.0",
    description: "Documentation interactive de l'API Membora",
  },
  servers: [
    {
      url: "https://valentingremaud.emf-informatique.ch/api",
      description: "Serveur de production",
    },
    {
      url: `http://localhost:${process.env.PORT || 3001}/api`,
      description: "Serveur de développement local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./app/routes/*.js"], // Ajoute des JSDoc dans les routes pour la doc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configuration CORS simplifiée et permissive
const corsOptions = {
  origin: true, // Autoriser toutes les origines
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  if (err && err.error && err.type === "validation") {
    return res.status(400).json({
      message: "Erreur de validation",
      details: err.error.details.map((d) => d.message),
    });
  }
  return res.status(500).json({ message: "Erreur serveur" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
