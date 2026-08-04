import { IUpdaterAdapter, UpdateInfo } from '@cansche/platform';

export class TauriUpdaterAdapter implements IUpdaterAdapter {
  private activeUpdate: any = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  private async getCurrentVersion(): Promise<string> {
    if (!this.isSupported()) return 'web';

    const { getVersion } = await import('@tauri-apps/api/app');
    return getVersion();
  }

  public async check(): Promise<UpdateInfo> {
    const currentVersion = await this.getCurrentVersion();

    if (!this.isSupported()) {
      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
      };
    }

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        this.activeUpdate = update;
        return {
          currentVersion: update.currentVersion || currentVersion,
          latestVersion: update.version,
          hasUpdate: true,
          releaseNotes: update.body || 'Nova versão do Cansche disponível!',
          publishedAt: update.date,
        };
      }

      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
      };
    } catch (error) {
      console.warn('TauriUpdaterAdapter check failed:', error);
      throw error;
    }
  }

  public async downloadAndInstall(onProgress?: (downloaded: number, total: number) => void): Promise<void> {
    if (!this.activeUpdate) {
      const { check } = await import('@tauri-apps/plugin-updater');
      this.activeUpdate = await check();
    }

    if (!this.activeUpdate) {
      throw new Error('Nenhuma atualização ativa encontrada para instalar.');
    }

    let downloaded = 0;
    let contentLength = 0;

    await this.activeUpdate.downloadAndInstall((event: any) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          onProgress?.(downloaded, contentLength);
          break;
        case 'Finished':
          break;
      }
    });

    try {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (error) {
      console.warn('Relaunch invoke failed:', error);
      throw error;
    }
  }
}
