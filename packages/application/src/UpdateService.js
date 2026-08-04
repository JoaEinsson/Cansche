import { WebNoopUpdaterAdapter } from '@cansche/platform';
class BrowserUpdatePreferencesStore {
    static AUTO_CHECK_KEY = 'cansche_auto_check_updates';
    static DISMISSED_VERSION_KEY = 'cansche_update_dismissed_version';
    isAutoCheckEnabled() {
        try {
            const value = localStorage.getItem(BrowserUpdatePreferencesStore.AUTO_CHECK_KEY);
            return value === null ? true : value === 'true';
        }
        catch {
            return true;
        }
    }
    setAutoCheckEnabled(enabled) {
        try {
            localStorage.setItem(BrowserUpdatePreferencesStore.AUTO_CHECK_KEY, String(enabled));
        }
        catch (error) {
            console.error('Failed to save auto-update preference:', error);
        }
    }
    getDismissedVersion() {
        try {
            return localStorage.getItem(BrowserUpdatePreferencesStore.DISMISSED_VERSION_KEY);
        }
        catch {
            return null;
        }
    }
    dismissVersion(version) {
        try {
            localStorage.setItem(BrowserUpdatePreferencesStore.DISMISSED_VERSION_KEY, version);
        }
        catch (error) {
            console.error('Failed to save dismissed update version:', error);
        }
    }
}
export class UpdateService {
    adapter;
    preferences;
    currentVersionProvider;
    constructor(adapter, preferences, currentVersionProvider) {
        this.adapter = adapter || new WebNoopUpdaterAdapter();
        this.preferences = preferences || new BrowserUpdatePreferencesStore();
        this.currentVersionProvider = currentVersionProvider || (async () => 'unknown');
    }
    isAutoCheckEnabled() {
        return this.preferences.isAutoCheckEnabled();
    }
    setAutoCheckEnabled(enabled) {
        this.preferences.setAutoCheckEnabled(enabled);
    }
    getDismissedVersion() {
        return this.preferences.getDismissedVersion();
    }
    dismissVersion(version) {
        this.preferences.dismissVersion(version);
    }
    async checkForUpdates(isManualCheck = false) {
        const currentVersion = await this.currentVersionProvider();
        if (!isManualCheck && !this.isAutoCheckEnabled()) {
            return { currentVersion, latestVersion: currentVersion, hasUpdate: false };
        }
        const info = await this.adapter.check();
        const normalizedInfo = {
            ...info,
            currentVersion: info.currentVersion || currentVersion,
            latestVersion: info.latestVersion || info.currentVersion || currentVersion,
        };
        if (!isManualCheck && normalizedInfo.hasUpdate && normalizedInfo.latestVersion) {
            const dismissed = this.getDismissedVersion();
            if (dismissed === normalizedInfo.latestVersion) {
                return { ...normalizedInfo, hasUpdate: false };
            }
        }
        return normalizedInfo;
    }
    async downloadAndInstall(onProgress) {
        await this.adapter.downloadAndInstall(onProgress);
    }
}
