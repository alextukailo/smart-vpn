export type SupportedPlatform =
  | 'darwin'
  | 'win32';

export interface PlatformInfo {
  platform: string;
  architecture: string;
  supported: boolean;
  appVersion: string;
}
