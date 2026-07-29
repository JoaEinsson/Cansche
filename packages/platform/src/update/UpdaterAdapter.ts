export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  publishedAt?: string;
}

export interface IUpdaterAdapter {
  check(): Promise<UpdateInfo>;
  downloadAndInstall(onProgress?: (downloaded: number, total: number) => void): Promise<void>;
  isSupported(): boolean;
}
