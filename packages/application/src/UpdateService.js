import { WebNoopUpdaterAdapter } from '@cansche/platform';
export class UpdateService {
    adapter;
    static DISMISSED_VERSION_KEY = 'cansche_update_dismissed_version';
    static AUTO_CHECK_KEY = 'cansche_auto_check_updates';
    constructor(adapter) {
        this.adapter = adapter || new WebNoopUpdaterAdapter();
    }
    isAutoCheckEnabled() {
        try {
            const val = localStorage.getItem(UpdateService.AUTO_CHECK_KEY);
            return val === null ? true : val === 'true';
        }
        catch {
            return true;
        }
    }
    setAutoCheckEnabled(enabled) {
        try {
            localStorage.setItem(UpdateService.AUTO_CHECK_KEY, String(enabled));
        }
        catch (e) {
            console.error('Failed to set auto check preference:', e);
        }
    }
    getDismissedVersion() {
        try {
            return localStorage.getItem(UpdateService.DISMISSED_VERSION_KEY);
        }
        catch {
            return null;
        }
    }
    dismissVersion(version) {
        try {
            localStorage.setItem(UpdateService.DISMISSED_VERSION_KEY, version);
        }
        catch (e) {
            console.error('Failed to save dismissed version:', e);
        }
    }
    async checkForUpdates(isManualCheck = false) {
        if (!isManualCheck && !this.isAutoCheckEnabled()) {
            return { currentVersion: '1.0.0', latestVersion: '1.0.0', hasUpdate: false };
        }
        try {
            const info = await this.adapter.check();
            if (!isManualCheck && info.hasUpdate) {
                const dismissed = this.getDismissedVersion();
                if (dismissed === info.latestVersion) {
                    return { ...info, hasUpdate: false };
                }
            }
            return info;
        }
        catch (err) {
            console.warn('Update check failed silently:', err);
            return { currentVersion: '1.0.0', latestVersion: '1.0.0', hasUpdate: false };
        }
    }
    async downloadAndInstall(onProgress) {
        await this.adapter.downloadAndInstall(onProgress);
    }
}
