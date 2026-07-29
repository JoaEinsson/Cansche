export class WebPlatformAdapter {
    name = 'web';
    async getStoragePath() {
        return 'IndexedDB://cansche_db';
    }
    async saveFile(filename, content) {
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
    async openFile(extensions) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = extensions.map((ext) => `.${ext}`).join(',');
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target?.result || null);
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }
    async showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }
}
export { WebPlatformAdapter as DesktopPlatformAdapter };
export * from './update/UpdaterAdapter';
export * from './update/WebNoopUpdaterAdapter';
