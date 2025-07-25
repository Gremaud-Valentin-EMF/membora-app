"use client";

import { useState, useRef } from "react";
import Button from "./Button";

export default function ImageUpload({
  label = "Image",
  value = "",
  onChange,
  required = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB par défaut
  className = "",
  previewClassName = "w-full h-48 object-cover rounded-lg",
}) {
  const [preview, setPreview] = useState(value);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError("");

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide");
      return false;
    }

    // Vérifier la taille
    if (file.size > maxSize) {
      setError(
        `L'image ne doit pas dépasser ${Math.round(maxSize / 1024 / 1024)}MB`
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    // Créer l'URL de prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Appeler la fonction onChange avec le fichier
    if (onChange) {
      onChange(file, previewUrl);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange(null, "");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-green-400 bg-green-50"
            : preview
            ? "border-gray-300 bg-gray-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          required={required && !preview}
        />

        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Aperçu" className={previewClassName} />
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Changer l'image
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Glissez-déposez une image ici, ou{" "}
                <button
                  type="button"
                  className="text-green-600 hover:text-green-500 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  cliquez pour sélectionner
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF jusqu'à {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
