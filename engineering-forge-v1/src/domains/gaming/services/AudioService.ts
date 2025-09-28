export interface AudioSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  uiVolume: number; // 0-1
  muted: boolean;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  type: 'music' | 'sfx' | 'ui';
  loop: boolean;
  volume: number; // 0-1
  duration?: number;
}

export interface AudioInstance {
  id: string;
  track: AudioTrack;
  audio: HTMLAudioElement;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  volume: number;
}

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private audioInstances: Map<string, AudioInstance> = new Map();
  private settings: AudioSettings;
  private audioTracks: Map<string, AudioTrack> = new Map();

  private constructor() {
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      uiVolume: 0.7,
      muted: false
    };

    this.initializeAudioContext();
    this.loadDefaultTracks();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private loadDefaultTracks(): void {
    // Default audio tracks - in a real implementation, these would be actual audio files
    const defaultTracks: AudioTrack[] = [
      {
        id: 'bg-music-main',
        name: 'Main Theme',
        url: '/audio/music/main-theme.mp3',
        type: 'music',
        loop: true,
        volume: 0.6
      },
      {
        id: 'bg-music-building',
        name: 'Building Mode',
        url: '/audio/music/building-mode.mp3',
        type: 'music',
        loop: true,
        volume: 0.5
      },
      {
        id: 'sfx-component-place',
        name: 'Component Place',
        url: '/audio/sfx/component-place.wav',
        type: 'sfx',
        loop: false,
        volume: 0.8
      },
      {
        id: 'sfx-component-select',
        name: 'Component Select',
        url: '/audio/sfx/component-select.wav',
        type: 'sfx',
        loop: false,
        volume: 0.7
      },
      {
        id: 'sfx-test-complete',
        name: 'Test Complete',
        url: '/audio/sfx/test-complete.wav',
        type: 'sfx',
        loop: false,
        volume: 0.9
      },
      {
        id: 'sfx-achievement',
        name: 'Achievement Unlock',
        url: '/audio/sfx/achievement.wav',
        type: 'sfx',
        loop: false,
        volume: 1.0
      },
      {
        id: 'ui-button-click',
        name: 'Button Click',
        url: '/audio/ui/button-click.wav',
        type: 'ui',
        loop: false,
        volume: 0.6
      },
      {
        id: 'ui-button-hover',
        name: 'Button Hover',
        url: '/audio/ui/button-hover.wav',
        type: 'ui',
        loop: false,
        volume: 0.4
      },
      {
        id: 'ui-tab-switch',
        name: 'Tab Switch',
        url: '/audio/ui/tab-switch.wav',
        type: 'ui',
        loop: false,
        volume: 0.5
      },
      {
        id: 'ui-save-game',
        name: 'Save Game',
        url: '/audio/ui/save-game.wav',
        type: 'ui',
        loop: false,
        volume: 0.7
      }
    ];

    defaultTracks.forEach(track => {
      this.audioTracks.set(track.id, track);
    });
  }

  public async playSound(
    trackId: string,
    options?: {
      volume?: number;
      loop?: boolean;
      fadeIn?: boolean;
      fadeInDuration?: number;
    }
  ): Promise<string | null> {
    const track = this.audioTracks.get(trackId);
    if (!track) {
      console.warn(`Audio track not found: ${trackId}`);
      return null;
    }

    if (this.settings.muted) {
      return null;
    }

    try {
      const audio = new Audio(track.url);
      const instanceId = `${trackId}-${Date.now()}`;

      // Set audio properties
      audio.volume = this.calculateVolume(track, options?.volume);
      audio.loop = options?.loop ?? track.loop;

      // Handle audio loading
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener(
          'error',
          () => reject(new Error(`Failed to load audio: ${trackId}`)),
          { once: true }
        );
        audio.load();
      });

      // Create audio instance
      const instance: AudioInstance = {
        id: instanceId,
        track,
        audio,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        volume: audio.volume
      };

      this.audioInstances.set(instanceId, instance);

      // Play the audio
      await audio.play();
      instance.isPlaying = true;

      // Handle audio end
      audio.addEventListener(
        'ended',
        () => {
          this.audioInstances.delete(instanceId);
        },
        { once: true }
      );

      // Handle fade in
      if (options?.fadeIn) {
        this.fadeIn(instanceId, options.fadeInDuration || 1000);
      }

      return instanceId;
    } catch (error) {
      console.warn(`Failed to play audio: ${trackId}`, error);
      return null;
    }
  }

  public stopSound(instanceId: string, fadeOut?: boolean, fadeOutDuration?: number): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    if (fadeOut) {
      this.fadeOut(instanceId, fadeOutDuration || 1000);
    } else {
      instance.audio.pause();
      instance.audio.currentTime = 0;
      instance.isPlaying = false;
      instance.isPaused = true;
      this.audioInstances.delete(instanceId);
    }
  }

  public pauseSound(instanceId: string): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    instance.audio.pause();
    instance.isPlaying = false;
    instance.isPaused = true;
  }

  public resumeSound(instanceId: string): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    instance.audio.play();
    instance.isPlaying = true;
    instance.isPaused = false;
  }

  public setVolume(instanceId: string, volume: number): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    instance.audio.volume = this.calculateVolume(instance.track, clampedVolume);
    instance.volume = clampedVolume;
  }

  public stopAllSounds(type?: 'music' | 'sfx' | 'ui'): void {
    this.audioInstances.forEach((instance, instanceId) => {
      if (!type || instance.track.type === type) {
        this.stopSound(instanceId);
      }
    });
  }

  public pauseAllSounds(type?: 'music' | 'sfx' | 'ui'): void {
    this.audioInstances.forEach(instance => {
      if (!type || instance.track.type === type) {
        this.pauseSound(instance.id);
      }
    });
  }

  public resumeAllSounds(type?: 'music' | 'sfx' | 'ui'): void {
    this.audioInstances.forEach(instance => {
      if (!type || instance.track.type === type) {
        this.resumeSound(instance.id);
      }
    });
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // Update all playing audio instances
    this.audioInstances.forEach(instance => {
      instance.audio.volume = this.calculateVolume(instance.track, instance.volume);
    });

    // Handle mute/unmute
    if (newSettings.muted !== undefined) {
      if (newSettings.muted) {
        this.pauseAllSounds();
      } else {
        this.resumeAllSounds();
      }
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public getAudioTracks(): AudioTrack[] {
    return Array.from(this.audioTracks.values());
  }

  public getPlayingSounds(): AudioInstance[] {
    return Array.from(this.audioInstances.values());
  }

  private calculateVolume(track: AudioTrack, customVolume?: number): number {
    if (this.settings.muted) return 0;

    const baseVolume = customVolume ?? track.volume;
    const typeVolume = this.getTypeVolume(track.type);

    return baseVolume * typeVolume * this.settings.masterVolume;
  }

  private getTypeVolume(type: 'music' | 'sfx' | 'ui'): number {
    switch (type) {
      case 'music':
        return this.settings.musicVolume;
      case 'sfx':
        return this.settings.sfxVolume;
      case 'ui':
        return this.settings.uiVolume;
      default:
        return 1;
    }
  }

  private fadeIn(instanceId: string, duration: number): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    const startVolume = 0;
    const targetVolume = instance.volume;
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentVolume = startVolume + (targetVolume - startVolume) * progress;
      instance.audio.volume = this.calculateVolume(instance.track, currentVolume);

      if (progress >= 1) {
        clearInterval(fadeInterval);
      }
    }, 16); // ~60fps
  }

  private fadeOut(instanceId: string, duration: number): void {
    const instance = this.audioInstances.get(instanceId);
    if (!instance) return;

    const startVolume = instance.audio.volume;
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentVolume = startVolume * (1 - progress);
      instance.audio.volume = this.calculateVolume(instance.track, currentVolume);

      if (progress >= 1) {
        clearInterval(fadeInterval);
        this.stopSound(instanceId);
      }
    }, 16); // ~60fps
  }

  public async preloadAudio(trackIds: string[]): Promise<void> {
    const promises = trackIds.map(async trackId => {
      const track = this.audioTracks.get(trackId);
      if (!track) return;

      try {
        const audio = new Audio(track.url);
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener(
            'error',
            () => reject(new Error(`Failed to preload: ${trackId}`)),
            { once: true }
          );
          audio.load();
        });
      } catch (error) {
        console.warn(`Failed to preload audio: ${trackId}`, error);
      }
    });

    await Promise.all(promises);
  }

  public destroy(): void {
    this.stopAllSounds();
    this.audioInstances.clear();
    this.audioTracks.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
