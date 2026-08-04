function isTauriRuntime() {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
function downloadInBrowser(filename, content) {
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
export class WebPlatformAdapter {
    name = isTauriRuntime() ? 'tauri-windows' : 'web';
    async getStoragePath() {
        return isTauriRuntime() ? 'Tauri://AppData' : 'IndexedDB://cansche_db';
    }
    async saveFile(filename, content) {
        if (isTauriRuntime()) {
            try {
                const { save } = await import('@tauri-apps/plugin-dialog');
                const filePath = await save({
                    defaultPath: filename,
                    filters: [{ name: 'Cansche File', extensions: ['json', 'cansche'] }],
                });
                if (!filePath)
                    return;
                const { writeTextFile } = await import('@tauri-apps/plugin-fs');
                await writeTextFile(filePath, content);
                return;
            }
            catch (error) {
                console.error('Falha ao exportar pelo diálogo nativo:', error);
            }
        }
        const savePicker = window.showSaveFilePicker;
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
            }
            catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError')
                    return;
                console.error('Falha ao abrir o diálogo de salvamento:', error);
            }
        }
        downloadInBrowser(filename, content);
    }
    async openFile(extensions) {
        if (isTauriRuntime()) {
            try {
                const { open } = await import('@tauri-apps/plugin-dialog');
                const selected = await open({
                    multiple: false,
                    filters: [{ name: 'Cansche File', extensions }],
                });
                if (!selected || typeof selected !== 'string')
                    return null;
                const { readTextFile } = await import('@tauri-apps/plugin-fs');
                return await readTextFile(selected);
            }
            catch (error) {
                console.error('Falha ao importar pelo diálogo nativo:', error);
                return null;
            }
        }
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = extensions.map((ext) => `.${ext}`).join(',');
            input.onchange = (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (loadEvent) => resolve(loadEvent.target?.result || null);
                reader.readAsText(file);
            };
            input.click();
        });
    }
    async showNotification(title, body) {
        if (isTauriRuntime()) {
            try {
                const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
                let permissionGranted = await isPermissionGranted();
                if (!permissionGranted)
                    permissionGranted = (await requestPermission()) === 'granted';
                if (permissionGranted)
                    sendNotification({ title, body });
                return;
            }
            catch (error) {
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
