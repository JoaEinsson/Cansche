import { IUpdaterAdapter, UpdateInfo, WebNoopUpdaterAdapter } from '@cansche/platform';

export class UpdateService {
  private adapter: IUpdaterAdapter;
  private static readonly DISMISSED_VERSION_KEY = 'cansche_update_dismissed_version';
  private static readonly AUTO_CHECK_KEY = 'cansche_auto_check_updates';

  constructor(adapter?: IUpdaterAdapter) {
    this.adapter = adapter || new WebNoopUpdaterAdapter();
  }

  public isAutoCheckEnabled(): boolean {
    try {
      const val = localStorage.getItem(UpdateService.AUTO_CHECK_KEY);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  }

  public setAutoCheckEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(UpdateService.AUTO_CHECK_KEY, String(enabled));
    } catch (e) {
      console.error('Failed to set auto check preference:', e);
    }
  }

  public getDismissedVersion(): string | null {
    try {
      return localStorage.getItem(UpdateService.DISMISSED_VERSION_KEY);
    } catch {
      return null;
    }
  }

  public dismissVersion(version: string): void {
    try {
      localStorage.setItem(UpdateService.DISMISSED_VERSION_KEY, version);
    } catch (e) {
      console.error('Failed to save dismissed version:', e);
    }
  }

  public async checkForUpdates(isManualCheck = false): Promise<UpdateInfo> {
    if (!isManualCheck && !this.isAutoCheckEnabled()) {
      return { currentVersion: '1.0.0', latestVersion: '1.0.0', hasUpdate: false };
    }

    try {
      const info = await this.adapter.check();

      if (!isManualCheck && info.hasUpdate) {
        const dismissed = this.getDismissedVersion();
        if (dismissed === info.latestVersion) {
          return { ...info, hasUpdate: false };
        }
      }

      return info;
    } catch (err) {
      console.warn('Update check failed silently:', err);
      return { currentVersion: '1.0.0', latestVersion: '1.0.0', hasUpdate: false };
    }
  }

  public async downloadAndInstall(onProgress?: (downloaded: number, total: number) => void): Promise<void> {
    await this.adapter.downloadAndInstall(onProgress);
  }
}
