import { IUpdaterAdapter, UpdateInfo, WebNoopUpdaterAdapter } from '@cansche/platform';

export interface UpdatePreferencesStore {
  isAutoCheckEnabled(): boolean;
  setAutoCheckEnabled(enabled: boolean): void;
  getDismissedVersion(): string | null;
  dismissVersion(version: string): void;
}

class BrowserUpdatePreferencesStore implements UpdatePreferencesStore {
  private static readonly AUTO_CHECK_KEY = 'cansche_auto_check_updates';
  private static readonly DISMISSED_VERSION_KEY = 'cansche_update_dismissed_version';

  public isAutoCheckEnabled(): boolean {
    try {
      const value = localStorage.getItem(BrowserUpdatePreferencesStore.AUTO_CHECK_KEY);
      return value === null ? true : value === 'true';
    } catch {
      return true;
    }
  }

  public setAutoCheckEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(BrowserUpdatePreferencesStore.AUTO_CHECK_KEY, String(enabled));
    } catch (error) {
      console.error('Failed to save auto-update preference:', error);
    }
  }

  public getDismissedVersion(): string | null {
    try {
      return localStorage.getItem(BrowserUpdatePreferencesStore.DISMISSED_VERSION_KEY);
    } catch {
      return null;
    }
  }

  public dismissVersion(version: string): void {
    try {
      localStorage.setItem(BrowserUpdatePreferencesStore.DISMISSED_VERSION_KEY, version);
    } catch (error) {
      console.error('Failed to save dismissed update version:', error);
    }
  }
}

export class UpdateService {
  private adapter: IUpdaterAdapter;
  private preferences: UpdatePreferencesStore;
  private currentVersionProvider: () => Promise<string>;

  constructor(
    adapter?: IUpdaterAdapter,
    preferences?: UpdatePreferencesStore,
    currentVersionProvider?: () => Promise<string>,
  ) {
    this.adapter = adapter || new WebNoopUpdaterAdapter();
    this.preferences = preferences || new BrowserUpdatePreferencesStore();
    this.currentVersionProvider = currentVersionProvider || (async () => 'unknown');
  }

  public isAutoCheckEnabled(): boolean {
    return this.preferences.isAutoCheckEnabled();
  }

  public setAutoCheckEnabled(enabled: boolean): void {
    this.preferences.setAutoCheckEnabled(enabled);
  }

  public getDismissedVersion(): string | null {
    return this.preferences.getDismissedVersion();
  }

  public dismissVersion(version: string): void {
    this.preferences.dismissVersion(version);
  }

  public async checkForUpdates(isManualCheck = false): Promise<UpdateInfo> {
    const currentVersion = await this.currentVersionProvider();

    if (!isManualCheck && !this.isAutoCheckEnabled()) {
      return { currentVersion, latestVersion: currentVersion, hasUpdate: false };
    }

    const info = await this.adapter.check();
    const normalizedInfo: UpdateInfo = {
      ...info,
      currentVersion: info.currentVersion || currentVersion,
      latestVersion: info.latestVersion || info.currentVersion || currentVersion,
    };

    if (!isManualCheck && normalizedInfo.hasUpdate && normalizedInfo.latestVersion) {
      const dismissed = this.getDismissedVersion();
      if (dismissed === normalizedInfo.latestVersion) {
        return { ...normalizedInfo, hasUpdate: false };
      }
    }

    return normalizedInfo;
  }

  public async downloadAndInstall(onProgress?: (downloaded: number, total: number) => void): Promise<void> {
    await this.adapter.downloadAndInstall(onProgress);
  }
}
