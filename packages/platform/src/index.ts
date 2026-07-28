export interface PlatformAdapter {
  name: 'web' | 'tauri-windows' | 'tauri-linux' | 'tauri-android';
  getStoragePath(): Promise<string>;
  saveFile(filename: string, content: string): Promise<void>;
  openFile(extensions: string[]): Promise<string | null>;
  showNotification(title: string, body: string): Promise<void>;
}

export class WebPlatformAdapter implements PlatformAdapter {
  public name: 'web' = 'web';

  public async getStoragePath(): Promise<string> {
    return 'IndexedDB://cansche_db';
  }

  public async saveFile(filename: string, content: string): Promise<void> {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async openFile(extensions: string[]): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = extensions.map((ext) => `.${ext}`).join(',');
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve((event.target?.result as string) || null);
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  public async showNotification(title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}

export { WebPlatformAdapter as DesktopPlatformAdapter };
