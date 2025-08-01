import { useState } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "@/store/slices/authSlice";

export const useProfileImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const uploadProfileImage = async (file) => {
    if (!file) {
      setError("No file selected");
      return { success: false, error: "No file selected" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return { success: false, error: "Please select an image file" };
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return { success: false, error: "File size must be less than 10MB" };
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL from our API
      const presignedResponse = await api.post(
        "/api/profile-image/presigned-url",
        {
          file_type: file.type,
          file_size: file.size,
        }
      );

      console.log("Presigned response:", presignedResponse.data);

      const { form_data, form_url, file_key, public_url } =
        presignedResponse.data;

      // Step 2: Upload directly to S3
      const formData = new FormData();

      // Add all the form fields from the presigned POST first
      Object.keys(form_data).forEach((key) => {
        formData.append(key, form_data[key]);
      });

      // Add the file last
      formData.append("file", file);

      // Upload to S3 with progress tracking
      await axios.post(form_url, formData, {
        withCredentials: false, // ✅ Fix CORS issue
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Step 3: Update user profile with new image URL
      const updateResponse = await api.post("/api/profile-image/update", {
        image_url: public_url,
        file_key: file_key,
      });

      // Update Redux store with new user data
      dispatch(updateUser(updateResponse.data.user));

      setIsUploading(false);
      setUploadProgress(100);

      return {
        success: true,
        imageUrl: public_url,
        user: updateResponse.data.user,
      };
    } catch (error) {
      console.error("Profile image upload error:", error);

      let errorMessage = "Failed to upload profile image";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const deleteProfileImage = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await api.delete("/api/profile-image");

      // Update Redux store with updated user data
      dispatch(updateUser(response.data.user));

      setIsUploading(false);

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      console.error("Profile image delete error:", error);

      let errorMessage = "Failed to delete profile image";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      setIsUploading(false);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadProfileImage,
    deleteProfileImage,
    isUploading,
    uploadProgress,
    error,
    clearError,
  };
};
