/**
 * AvatarUpload Component - Engineering Forge V1.0
 *
 * This component provides avatar upload functionality with preview and validation.
 */

import React, { useRef, useState } from "react";
import { UserService } from "../../domains/gaming/domain/services/userService";
import { useAvatarUpload } from "../../hooks/useUser";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  className = "",
  size = "lg",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploading,
    progress,
    error,
    preview,
    handleFileSelect,
    clearPreview,
    setUploading,
    setProgress,
    setError,
  } = useAvatarUpload();

  const [dragActive, setDragActive] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-16 h-16", icon: "w-6 h-6", text: "text-xs" },
    md: { container: "w-24 h-24", icon: "w-8 h-8", text: "text-sm" },
    lg: { container: "w-32 h-32", icon: "w-10 h-10", text: "text-base" },
    xl: { container: "w-40 h-40", icon: "w-12 h-12", text: "text-lg" },
  };

  const config = sizeConfig[size];

  /**
   * Handle file upload
   */
  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
      const avatarUrl = await UserService.uploadAvatar(file);

      clearInterval(progressInterval);
      setProgress(100);

      // Update avatar
      onAvatarChange?.(avatarUrl);

      // Clear preview after successful upload
      setTimeout(() => {
        clearPreview();
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelection = (file: File) => {
    handleFileSelect(file);
    handleFileUpload(file);
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Handle click to select file
   */
  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handle remove avatar
   */
  const handleRemoveAvatar = async () => {
    try {
      await UserService.deleteAvatar();
      onAvatarChange?.("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    }
  };

  // Determine avatar source
  const avatarSrc = preview || currentAvatar;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <div
          className={`${
            config.container
          } rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 cursor-pointer transition-all duration-200 hover:border-blue-300 ${
            dragActive ? "border-blue-400 scale-105" : ""
          } ${uploading ? "opacity-75" : ""}`}
          onClick={handleClick}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg
                className={`${config.icon} text-gray-400`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">{progress}%</p>
              </div>
            </div>
          )}

          {/* Edit Overlay */}
          {!uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <svg
                className={`${config.icon} text-white opacity-0 hover:opacity-100 transition-opacity duration-200`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {avatarSrc && !uploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
            title="Remove avatar"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-center">
        <button
          onClick={handleClick}
          disabled={uploading}
          className={`${config.text} text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading
            ? "Uploading..."
            : avatarSrc
            ? "Change Avatar"
            : "Upload Avatar"}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
