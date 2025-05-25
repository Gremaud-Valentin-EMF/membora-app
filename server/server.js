require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const apiRouter = require("./app/routes/apiRouter");
const port = process.env.PORT;

app.use(cors());
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
