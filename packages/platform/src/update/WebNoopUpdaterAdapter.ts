import { IUpdaterAdapter, UpdateInfo } from './UpdaterAdapter';

export class WebNoopUpdaterAdapter implements IUpdaterAdapter {
  public async check(): Promise<UpdateInfo> {
    return {
      currentVersion: '1.0.0',
      latestVersion: '1.0.0',
      hasUpdate: false,
      releaseNotes: '',
    };
  }

  public async downloadAndInstall(): Promise<void> {
    // No-op for web browser execution
  }

  public isSupported(): boolean {
    return false;
  }
}
