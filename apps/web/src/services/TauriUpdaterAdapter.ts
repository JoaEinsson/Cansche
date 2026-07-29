import { IUpdaterAdapter, UpdateInfo } from '@cansche/platform';

export class TauriUpdaterAdapter implements IUpdaterAdapter {
  private activeUpdate: any = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  public async check(): Promise<UpdateInfo> {
    if (!this.isSupported()) {
      return {
        currentVersion: '1.0.0',
        latestVersion: '1.0.0',
        hasUpdate: false,
      };
    }

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update && update.available) {
        this.activeUpdate = update;
        return {
          currentVersion: update.currentVersion,
          latestVersion: update.version,
          hasUpdate: true,
          releaseNotes: update.body || 'Nova versão do Cansche disponível!',
          publishedAt: update.date,
        };
      }
    } catch (err) {
      console.warn('TauriUpdaterAdapter check failed silently:', err);
    }

    return {
      currentVersion: '1.0.0',
      latestVersion: '1.0.0',
      hasUpdate: false,
    };
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
          if (onProgress) {
            onProgress(downloaded, contentLength);
          }
          break;
        case 'Finished':
          break;
      }
    });

    try {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (e) {
      console.warn('Relaunch invoke failed:', e);
    }
  }
}
