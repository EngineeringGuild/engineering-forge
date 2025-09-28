/**
 * UserProfileForm Component - Engineering Forge V1.0
 *
 * This component provides a form for editing user profile information.
 */

import React, { useEffect, useState } from 'react';
import { useFormValidation, useUser } from '../../hooks/useUser';
import { ProfileFormData, UpdateProfileRequest } from '../../types/user.types';

interface UserProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { user, updateProfile, loading, error } = useUser();
  const {
    errors,
    touched: _touched,
    validateField,
    handleBlur,
    hasError,
    clearErrors
  } = useFormValidation();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        website: user.profile.website || '',
        github: user.profile.github || '',
        linkedin: user.profile.linkedin || ''
      });
    }
  }, [user]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (hasError(name)) {
      clearErrors();
    }

    setSubmitError(null);
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate required fields
    if (!formData.firstName.trim()) {
      validateField('firstName', formData.firstName, { required: true, minLength: 2 });
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      validateField('lastName', formData.lastName, { required: true, minLength: 2 });
      isValid = false;
    }

    // Validate optional fields
    if (formData.bio && formData.bio.length > 500) {
      validateField('bio', formData.bio, { maxLength: 500 });
      isValid = false;
    }

    if (formData.website && formData.website.trim()) {
      const isValidUrl =
        /^https?:\/\/.+/.test(formData.website) ||
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.website);
      if (!isValidUrl) {
        validateField('website', formData.website, { pattern: /^https?:\/\/.+/ });
        isValid = false;
      }
    }

    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        github: formData.github.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined
      };

      const success = await updateProfile(updateData);

      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        website: user.profile.website || '',
        github: user.profile.github || '',
        linkedin: user.profile.linkedin || ''
      });
    }
    clearErrors();
    setSubmitError(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your personal information and preferences.
        </p>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            onBlur={() => handleBlur('firstName')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError('firstName') ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {hasError('firstName') && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            onBlur={() => handleBlur('lastName')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError('lastName') ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {hasError('lastName') && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleInputChange}
          onBlur={() => handleBlur('bio')}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            hasError('bio') ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Tell us about yourself..."
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-1">
          {hasError('bio') && <p className="text-red-500 text-sm">{errors.bio}</p>}
          <p className="text-gray-500 text-sm ml-auto">{formData.bio.length}/500 characters</p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="City, Country"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          onBlur={() => handleBlur('website')}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            hasError('website') ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="https://yourwebsite.com"
        />
        {hasError('website') && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub */}
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
            GitHub
          </label>
          <input
            type="text"
            id="github"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="username or https://github.com/username"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="text"
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="username or https://linkedin.com/in/username"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel || handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserProfileForm;
