export class WebNoopUpdaterAdapter {
    async check() {
        return {
            currentVersion: '1.0.0',
            latestVersion: '1.0.0',
            hasUpdate: false,
            releaseNotes: '',
        };
    }
    async downloadAndInstall() {
        // No-op for web browser execution
    }
    isSupported() {
        return false;
    }
}
