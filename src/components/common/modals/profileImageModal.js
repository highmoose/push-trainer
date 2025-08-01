import React, { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  Upload,
  X,
  Camera,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useProfileImage } from "@/hooks/useProfileImage";

export default function ProfileImageModal({ isOpen, onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const { uploadProfileImage, isUploading, uploadProgress, error, clearError } =
    useProfileImage();

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    clearError();
    const result = await uploadProfileImage(selectedFile);

    if (result.success) {
      setUploadSuccess(true);

      addToast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });

      if (onUpload) {
        onUpload(selectedFile);
      }
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      addToast({
        title: "Error",
        description: result.error || "Failed to upload profile image",
        variant: "error",
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    setUploadSuccess(false);
    clearError();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-zinc-900",
        header: "",
        footer: "",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            Upload Profile Picture
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">
                  Profile image uploaded successfully!
                </span>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Uploading...</span>
                  <span className="text-zinc-400">{uploadProgress}%</span>
                </div>
                <Progress
                  value={uploadProgress}
                  className="w-full"
                  color="primary"
                  size="sm"
                />
              </div>
            )}

            {/* File Upload Area */}
            <div
              className={`border-1 border-dashed transition-all duration-200 cursor-pointer rounded-lg ${
                isDragging
                  ? "border-blue-400 bg-blue-400/10"
                  : "border-zinc-700 hover:border-zinc-500"
              } bg-zinc-800/50`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerFileInput}
            >
              <div className="py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-36 h-36 rounded-full object-cover border-4 border-zinc-600"
                      />
                      <div className="absolute -top-2 -right-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="solid"
                          color="danger"
                          aria-label="Remove selected image"
                          onPress={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center">
                      <User className="w-8 h-8 text-zinc-400" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">
                        {selectedFile
                          ? selectedFile.name
                          : "Choose a file or drag it here"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={handleClose}
            isDisabled={isUploading}
            className="text-zinc-400 hover:text-white"
          >
            {uploadSuccess ? "Close" : "Cancel"}
          </Button>
          {!uploadSuccess && (
            <Button
              color="primary"
              onPress={handleUpload}
              isDisabled={!selectedFile || isUploading}
              isLoading={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? "Uploading..." : "Upload Picture"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
