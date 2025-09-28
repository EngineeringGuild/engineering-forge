/**
 * UserService Tests - Engineering Forge V1.0
 *
 * Tests for the UserService class.
 */

import { UserService } from '../userService';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUser
        })
      } as Response);

      const result = await UserService.getUserProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/profile',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );

      expect(result).toEqual(mockUser);
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'User not found'
        })
      } as Response);

      await expect(UserService.getUserProfile()).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const updatedUser = {
        _id: '1',
        firstName: 'Jane',
        lastName: 'Smith'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedUser
        })
      } as Response);

      const result = await UserService.updateProfile(updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(updateData)
        }
      );

      expect(result).toEqual(updatedUser);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        data: { avatarUrl: 'https://example.com/avatar.jpg' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await UserService.uploadAvatar(mockFile);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/avatar',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token'
          },
          body: expect.any(FormData)
        }
      );

      expect(result).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('validateProfileData', () => {
    it('should validate valid profile data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        website: 'https://example.com'
      };

      const result = UserService.validateProfileData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate invalid profile data', () => {
      const invalidData = {
        firstName: 'J', // Too short
        lastName: 'D', // Too short
        bio: 'a'.repeat(501), // Too long
        website: 'invalid-url' // Invalid URL
      };

      const result = UserService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePreferencesData', () => {
    it('should validate valid preferences data', () => {
      const validData = {
        language: 'en' as const,
        theme: 'dark' as const
      };

      const result = UserService.validatePreferencesData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate invalid preferences data', () => {
      const invalidData = {
        language: 'invalid' as any,
        theme: 'invalid' as any
      };

      const result = UserService.validatePreferencesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('calculateUserLevel', () => {
    it('should calculate level 1 for 0 XP', () => {
      const result = UserService.calculateUserLevel(0);

      expect(result.level).toBe(1);
      expect(result.xpCurrent).toBe(0);
      expect(result.xpRequired).toBe(100);
      expect(result.xpProgress).toBe(0);
    });

    it('should calculate level 2 for 150 XP', () => {
      const result = UserService.calculateUserLevel(150);

      expect(result.level).toBe(2);
      expect(result.xpCurrent).toBe(50);
      expect(result.xpRequired).toBe(100);
      expect(result.xpProgress).toBe(50);
    });

    it('should calculate level 3 for 200 XP', () => {
      const result = UserService.calculateUserLevel(200);

      expect(result.level).toBe(3);
      expect(result.xpCurrent).toBe(0);
      expect(result.xpRequired).toBe(100);
      expect(result.xpProgress).toBe(0);
    });
  });

  describe('formatTimeSpent', () => {
    it('should format minutes correctly', () => {
      expect(UserService.formatTimeSpent(30)).toBe('30m');
      expect(UserService.formatTimeSpent(59)).toBe('59m');
    });

    it('should format hours correctly', () => {
      expect(UserService.formatTimeSpent(60)).toBe('1h');
      expect(UserService.formatTimeSpent(90)).toBe('1h 30m');
      expect(UserService.formatTimeSpent(120)).toBe('2h');
    });

    it('should format days correctly', () => {
      expect(UserService.formatTimeSpent(1440)).toBe('1d'); // 24 hours
      expect(UserService.formatTimeSpent(1500)).toBe('1d 1h'); // 25 hours
    });
  });

  describe('getAchievementRarityColor', () => {
    it('should return correct colors for each rarity', () => {
      expect(UserService.getAchievementRarityColor('common')).toBe('text-gray-500');
      expect(UserService.getAchievementRarityColor('uncommon')).toBe('text-green-500');
      expect(UserService.getAchievementRarityColor('rare')).toBe('text-blue-500');
      expect(UserService.getAchievementRarityColor('epic')).toBe('text-purple-500');
      expect(UserService.getAchievementRarityColor('legendary')).toBe('text-yellow-500');
      expect(UserService.getAchievementRarityColor('unknown')).toBe('text-gray-500');
    });
  });

  describe('getAchievementRarityBackground', () => {
    it('should return correct backgrounds for each rarity', () => {
      expect(UserService.getAchievementRarityBackground('common')).toBe('bg-gray-100 dark:bg-gray-800');
      expect(UserService.getAchievementRarityBackground('uncommon')).toBe('bg-green-100 dark:bg-green-900');
      expect(UserService.getAchievementRarityBackground('rare')).toBe('bg-blue-100 dark:bg-blue-900');
      expect(UserService.getAchievementRarityBackground('epic')).toBe('bg-purple-100 dark:bg-purple-900');
      expect(UserService.getAchievementRarityBackground('legendary')).toBe('bg-yellow-100 dark:bg-yellow-900');
      expect(UserService.getAchievementRarityBackground('unknown')).toBe('bg-gray-100 dark:bg-gray-800');
    });
  });
});
