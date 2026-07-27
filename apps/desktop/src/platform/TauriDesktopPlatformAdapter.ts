import { PlatformAdapter } from '@cansche/platform';

export class TauriDesktopPlatformAdapter implements PlatformAdapter {
  public name: 'tauri-windows' | 'tauri-linux' = 'tauri-windows';

  public async getStoragePath(): Promise<string> {
    try {
      const { path } = await import('@tauri-apps/api');
      return await path.appDataDir();
    } catch {
      return 'C:\\Users\\Default\\AppData\\Roaming\\Cansche';
    }
  }

  public async saveFile(filename: string, content: string): Promise<void> {
    try {
      const { dialog, fs } = await import('@tauri-apps/api');
      const filePath = await dialog.save({
        defaultPath: filename,
        filters: [{ name: 'Cansche File', extensions: ['json', 'cansche'] }],
      });
      if (filePath) {
        await fs.writeTextFile(filePath, content);
      }
    } catch {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  public async openFile(extensions: string[]): Promise<string | null> {
    try {
      const { dialog, fs } = await import('@tauri-apps/api');
      const selected = await dialog.open({
        multiple: false,
        filters: [{ name: 'Cansche File', extensions }],
      });
      if (selected && typeof selected === 'string') {
        return await fs.readTextFile(selected);
      }
      return null;
    } catch {
      return null;
    }
  }

  public async showNotification(title: string, body: string): Promise<void> {
    try {
      const { notification } = await import('@tauri-apps/api');
      let permission = await notification.isPermissionGranted();
      if (!permission) {
        permission = (await notification.requestPermission()) === 'granted';
      }
      if (permission) {
        notification.sendNotification({ title, body });
      }
    } catch {
      // Fallback
    }
  }
}
