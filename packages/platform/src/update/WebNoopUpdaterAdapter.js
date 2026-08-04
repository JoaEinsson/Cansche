export class WebNoopUpdaterAdapter {
    version;
    constructor(version = 'web') {
        this.version = version;
    }
    async check() {
        return {
            currentVersion: this.version,
            latestVersion: this.version,
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
