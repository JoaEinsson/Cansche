import { IUpdaterAdapter, UpdateInfo } from './UpdaterAdapter';

export class WebNoopUpdaterAdapter implements IUpdaterAdapter {
  constructor(private readonly version = 'web') {}

  public async check(): Promise<UpdateInfo> {
    return {
      currentVersion: this.version,
      latestVersion: this.version,
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
