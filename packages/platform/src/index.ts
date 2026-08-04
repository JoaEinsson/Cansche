export interface PlatformAdapter {
  name: 'web' | 'tauri-windows' | 'tauri-linux' | 'tauri-android';
  getStoragePath(): Promise<string>;
  saveFile(filename: string, content: string): Promise<void>;
  openFile(extensions: string[]): Promise<string | null>;
  showNotification(title: string, body: string): Promise<void>;
}

interface SaveFilePickerWindow extends Window {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (content: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
}

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function downloadInBrowser(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export class WebPlatformAdapter implements PlatformAdapter {
  public name: PlatformAdapter['name'] = isTauriRuntime() ? 'tauri-windows' : 'web';

  public async getStoragePath(): Promise<string> {
    return isTauriRuntime() ? 'Tauri://AppData' : 'IndexedDB://cansche_db';
  }

  public async saveFile(filename: string, content: string): Promise<void> {
    if (isTauriRuntime()) {
      try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const filePath = await save({
          defaultPath: filename,
          filters: [{ name: 'Cansche File', extensions: ['json', 'cansche'] }],
        });
        if (!filePath) return;

        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        await writeTextFile(filePath, content);
        return;
      } catch (error) {
        console.error('Falha ao exportar pelo diálogo nativo:', error);
      }
    }

    const savePicker = (window as SaveFilePickerWindow).showSaveFilePicker;
    if (savePicker) {
      try {
        const handle = await savePicker({
          suggestedName: filename,
          types: [{ description: 'Arquivo Cansche', accept: { 'application/json': ['.cansche.json', '.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Falha ao abrir o diálogo de salvamento:', error);
      }
    }

    downloadInBrowser(filename, content);
  }

  public async openFile(extensions: string[]): Promise<string | null> {
    if (isTauriRuntime()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          multiple: false,
          filters: [{ name: 'Cansche File', extensions }],
        });
        if (!selected || typeof selected !== 'string') return null;

        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        return await readTextFile(selected);
      } catch (error) {
        console.error('Falha ao importar pelo diálogo nativo:', error);
        return null;
      }
    }

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = extensions.map((ext) => `.${ext}`).join(',');
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (loadEvent) => resolve((loadEvent.target?.result as string) || null);
        reader.readAsText(file);
      };
      input.click();
    });
  }

  public async showNotification(title: string, body: string): Promise<void> {
    if (isTauriRuntime()) {
      try {
        const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) permissionGranted = (await requestPermission()) === 'granted';
        if (permissionGranted) sendNotification({ title, body });
        return;
      } catch (error) {
        console.error('Falha ao enviar notificação nativa:', error);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}

export { WebPlatformAdapter as DesktopPlatformAdapter };

export * from './update/UpdaterAdapter';
export * from './update/WebNoopUpdaterAdapter';
