/**
 * UserPreferences Component - Engineering Forge V1.0
 *
 * This component provides user preferences and settings management.
 */

import React, { useEffect, useState } from 'react';
import { useFormValidation, useUser } from '../../hooks/useUser';
import { PreferencesFormData, UpdatePreferencesRequest } from '../../types/user.types';

interface UserPreferencesProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { user, updatePreferences, loading, error } = useUser();
  const { errors, touched: _touched, validateField, handleBlur, hasError } = useFormValidation();

  const [formData, setFormData] = useState<PreferencesFormData>({
    language: 'en',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        language: user.preferences.language as 'en' | 'pt' | 'es' | 'fr',
        theme: user.preferences.theme as 'light' | 'dark',
        emailNotifications: user.preferences.notifications.email,
        pushNotifications: user.preferences.notifications.push,
        inAppNotifications: user.preferences.notifications.inApp
      });
    }
  }, [user]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    setSubmitError(null);
  };

  /**
   * Handle theme change with immediate preview
   */
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setFormData(prev => ({ ...prev, theme }));

    // Apply theme immediately for preview
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate language
    if (!['en', 'pt', 'es', 'fr'].includes(formData.language)) {
      validateField('language', formData.language, { required: true });
      isValid = false;
    }

    // Validate theme
    if (!['light', 'dark'].includes(formData.theme)) {
      validateField('theme', formData.theme, { required: true });
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData: UpdatePreferencesRequest = {
        language: formData.language,
        theme: formData.theme,
        notifications: {
          email: formData.emailNotifications,
          push: formData.pushNotifications,
          inApp: formData.inAppNotifications
        }
      };

      const success = await updatePreferences(updateData);

      if (success) {
        onSuccess?.();
      } else {
        setSubmitError('Failed to update preferences. Please try again.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update preferences');
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
        language: user.preferences.language as 'en' | 'pt' | 'es' | 'fr',
        theme: user.preferences.theme as 'light' | 'dark',
        emailNotifications: user.preferences.notifications.email,
        pushNotifications: user.preferences.notifications.push,
        inAppNotifications: user.preferences.notifications.inApp
      });

      // Reset theme
      if (user.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setSubmitError(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading preferences...</span>
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
            <h3 className="text-sm font-medium text-red-800">Error loading preferences</h3>
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
        <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize your experience and notification settings.
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

      {/* Appearance Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Appearance</h3>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            onBlur={() => handleBlur('language')}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError('language') ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
          {hasError('language') && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="grid grid-cols-2 gap-4">
            {/* Light Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
                formData.theme === 'light'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Light</p>
                  <p className="text-xs text-gray-500">Clean and bright</p>
                </div>
              </div>
              {formData.theme === 'light' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
                formData.theme === 'dark'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-800 border border-gray-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark</p>
                  <p className="text-xs text-gray-500">Easy on the eyes</p>
                </div>
              </div>
              {formData.theme === 'dark' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive updates via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-500">Receive browser notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="pushNotifications"
              checked={formData.pushNotifications}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">In-App Notifications</h4>
            <p className="text-sm text-gray-500">Show notifications within the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="inAppNotifications"
              checked={formData.inAppNotifications}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
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
            'Save Preferences'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserPreferences;
