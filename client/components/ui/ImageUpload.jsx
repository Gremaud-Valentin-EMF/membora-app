"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const ImageUpload = ({
  onImageChange,
  currentImage = null,
  className = "",
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image doit faire moins de 5MB");
      return;
    }

    // Créer l'URL de prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Appeler la fonction de callback
    onImageChange(file, previewUrl);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={preview}
                alt="Aperçu"
                width={200}
                height={150}
                className="rounded-lg object-cover w-48 h-36"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">Image sélectionnée</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📷</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Glissez-déposez une image ici
              </p>
              <p className="text-sm text-gray-500">
                ou cliquez pour sélectionner
              </p>
            </div>
            <div className="text-xs text-gray-400">
              PNG, JPG, GIF jusqu'à 5MB
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {!preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sélectionner une image
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
