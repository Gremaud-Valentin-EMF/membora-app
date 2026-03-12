const multer = require("multer");

// Configuration de multer pour la mémoire (pas de stockage temporaire)
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées"), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Middleware pour upload d'image unique
const uploadImage = upload.single("image");

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Le fichier est trop volumineux (max 5MB)" });
    }
    return res
      .status(400)
      .json({ message: "Erreur lors de l'upload du fichier" });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  uploadImage,
  handleUploadError,
};
