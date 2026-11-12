/**
 * Minimaltypen für die offizielle Twitch Embedded Player API
 * (https://player.twitch.tv/js/embed/v1.js).
 *
 * Twitch liefert keine eigenen Typdefinitionen. Hier sind nur die Teile
 * deklariert, die die Anwendung tatsächlich nutzt.
 */

export interface TwitchPlayerOptions {
  channel?: string;
  video?: string;
  collection?: string;
  parent?: string[];
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsinline?: boolean;
  time?: string;
  quality?: string;
}

export interface TwitchPlayerInstance {
  play(): void;
  pause(): void;
  setChannel(channel: string): void;
  getChannel(): string;
  setQuality(quality: string): void;
  getQuality(): string;
  getQualities(): Array<{ group: string; name: string; bitrate?: number }>;
  setMuted(muted: boolean): void;
  getMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getPlayerState(): { playback?: string } | null;
  getEnded(): boolean;
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
  destroy(): void;
}

export interface TwitchPlayerConstructor {
  new (
    target: string | HTMLElement,
    options: TwitchPlayerOptions,
  ): TwitchPlayerInstance;
  READY: string;
  PLAY: string;
  PLAYING: string;
  PAUSE: string;
  ENDED: string;
  ONLINE: string;
  OFFLINE: string;
  SEEK: string;
  PLAYBACK_BLOCKED: string;
}

declare global {
  interface Window {
    Twitch?: {
      Player: TwitchPlayerConstructor;
    };
  }
}
