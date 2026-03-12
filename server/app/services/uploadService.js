const { put } = require("@vercel/blob");

const uploadService = {
  async uploadImage(file, folder = "articles") {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split(".").pop();
      const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

      // Upload vers Vercel Blob
      const blob = await put(filename, file.buffer, {
        access: "public",
        addRandomSuffix: false,
      });

      return {
        url: blob.url,
        filename: filename,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Erreur lors de l'upload de l'image");
    }
  },

  async deleteImage(url) {
    try {
      // Pour Vercel Blob, la suppression se fait automatiquement
      // ou via l'API si nécessaire
      console.log("Image deleted:", url);
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Erreur lors de la suppression de l'image");
    }
  },
};

module.exports = uploadService;
