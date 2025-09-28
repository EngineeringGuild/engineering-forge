/**
 * useUser Hook Tests - Engineering Forge V1.0
 *
 * Tests for the useUser custom hook.
 */

import { act, renderHook } from '@testing-library/react';
import { UserService } from '../../services/userService';
import { useUser, useUserLevel, useUserStatistics } from '../useUser';

// Mock the UserService
jest.mock('../../services/userService');
const mockUserService = UserService as jest.Mocked<typeof UserService>;

describe('useUser', () => {
  const mockUser = {
    _id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student' as const,
    isActive: true,
    isEmailVerified: true,
    preferences: {
      language: 'en' as const,
      theme: 'dark' as const,
      notifications: {
        email: true,
        push: true,
        inApp: true
      }
    },
    profile: {},
    statistics: {
      totalXP: 100,
      level: 2,
      projectsCompleted: 5,
      lessonsCompleted: 10,
      achievementsUnlocked: 3,
      timeSpent: 120
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user data on mount', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    mockUserService.getUserProfile.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe('Fetch failed');
  });

  it('should update profile successfully', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);
    mockUserService.updateProfile.mockResolvedValue({ ...mockUser, firstName: 'Jane' });
    mockUserService.validateProfileData.mockReturnValue({ isValid: true, errors: [] });

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let updateResult: boolean;
    await act(async () => {
      updateResult = await result.current.updateProfile({ firstName: 'Jane' });
    });

    expect(updateResult!).toBe(true);
    expect(mockUserService.updateProfile).toHaveBeenCalledWith({ firstName: 'Jane' });
  });

  it('should handle profile update error', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);
    mockUserService.updateProfile.mockRejectedValue(new Error('Update failed'));
    mockUserService.validateProfileData.mockReturnValue({ isValid: true, errors: [] });

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let updateResult: boolean;
    await act(async () => {
      updateResult = await result.current.updateProfile({ firstName: 'Jane' });
    });

    expect(updateResult!).toBe(false);
    expect(result.current.error).toBe('Update failed');
  });

  it('should validate profile data before update', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);
    mockUserService.validateProfileData.mockReturnValue({
      isValid: false,
      errors: ['First name is too short']
    });

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let updateResult: boolean;
    await act(async () => {
      updateResult = await result.current.updateProfile({ firstName: 'J' });
    });

    expect(updateResult!).toBe(false);
    expect(result.current.error).toBe('First name is too short');
    expect(mockUserService.updateProfile).not.toHaveBeenCalled();
  });

  it('should upload avatar successfully', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);
    mockUserService.uploadAvatar.mockResolvedValue('https://example.com/avatar.jpg');

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadAvatar(mockFile);
    });

    expect(uploadResult!).toBe(true);
    expect(mockUserService.uploadAvatar).toHaveBeenCalledWith(mockFile);
  });

  it('should handle avatar upload error', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);
    mockUserService.uploadAvatar.mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadAvatar(mockFile);
    });

    expect(uploadResult!).toBe(false);
    expect(result.current.error).toBe('Upload failed');
  });

  it('should validate file type for avatar upload', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadAvatar(invalidFile);
    });

    expect(uploadResult!).toBe(false);
    expect(result.current.error).toBe('Please select a valid image file');
    expect(mockUserService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('should validate file size for avatar upload', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Create a large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadAvatar(largeFile);
    });

    expect(uploadResult!).toBe(false);
    expect(result.current.error).toBe('Image file size must be less than 5MB');
    expect(mockUserService.uploadAvatar).not.toHaveBeenCalled();
  });
});

describe('useUserStatistics', () => {
  const mockStatistics = {
    totalXP: 100,
    level: 2,
    projectsCompleted: 5,
    lessonsCompleted: 10,
    achievementsUnlocked: 3,
    timeSpent: 120
  };

  const mockAchievements = [
    {
      _id: '1',
      name: 'First Project',
      description: 'Complete your first project',
      icon: '🏆',
      category: 'project' as const,
      rarity: 'common' as const,
      unlockedAt: new Date(),
      progress: 100
    }
  ];

  const mockFavoriteComponents = [
    {
      _id: '1',
      name: 'Turbo Engine',
      type: 'engine',
      category: 'performance',
      rarity: 'uncommon',
      cost: 2500,
      isUnlocked: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch statistics data on mount', async () => {
    mockUserService.getUserStatistics.mockResolvedValue(mockStatistics);
    mockUserService.getUserAchievements.mockResolvedValue(mockAchievements);
    mockUserService.getFavoriteComponents.mockResolvedValue(mockFavoriteComponents);

    const { result } = renderHook(() => useUserStatistics());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.statistics).toEqual(mockStatistics);
    expect(result.current.achievements).toEqual(mockAchievements);
    expect(result.current.favoriteComponents).toEqual(mockFavoriteComponents);
  });

  it('should handle fetch error', async () => {
    mockUserService.getUserStatistics.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useUserStatistics());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Fetch failed');
  });
});

describe('useUserLevel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate level data correctly', () => {
    mockUserService.calculateUserLevel.mockReturnValue({
      level: 2,
      xpCurrent: 50,
      xpRequired: 100,
      xpProgress: 50,
      nextLevelXp: 200
    });

    const { result } = renderHook(() => useUserLevel(150));

    expect(result.current.level).toBe(2);
    expect(result.current.xpCurrent).toBe(50);
    expect(result.current.xpRequired).toBe(100);
    expect(result.current.xpProgress).toBe(50);
    expect(result.current.nextLevelXp).toBe(200);
  });

  it('should recalculate when XP changes', () => {
    const { result: _result, rerender } = renderHook(({ xp }) => useUserLevel(xp), {
      initialProps: { xp: 100 }
    });

    expect(mockUserService.calculateUserLevel).toHaveBeenCalledWith(100);

    rerender({ xp: 200 });

    expect(mockUserService.calculateUserLevel).toHaveBeenCalledWith(200);
  });
});
