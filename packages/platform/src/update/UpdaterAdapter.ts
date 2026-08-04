export interface UpdateInfo {
  currentVersion: string;
  latestVersion?: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  publishedAt?: string;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'installing'
  | 'error'
  | 'unsupported';

export interface IUpdaterAdapter {
  check(): Promise<UpdateInfo>;
  downloadAndInstall(onProgress?: (downloaded: number, total: number) => void): Promise<void>;
  isSupported(): boolean;
}
