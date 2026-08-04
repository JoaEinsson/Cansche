import { describe, expect, it, vi } from 'vitest';
import { UpdateService, UpdatePreferencesStore } from '../src/UpdateService';
import { UpdateInfo } from '@cansche/platform';

class FakePreferences implements UpdatePreferencesStore {
  public autoCheckEnabled = true;
  public dismissedVersion: string | null = null;

  public isAutoCheckEnabled(): boolean {
    return this.autoCheckEnabled;
  }

  public setAutoCheckEnabled(enabled: boolean): void {
    this.autoCheckEnabled = enabled;
  }

  public getDismissedVersion(): string | null {
    return this.dismissedVersion;
  }

  public dismissVersion(version: string): void {
    this.dismissedVersion = version;
  }
}

function createAdapter(result: UpdateInfo) {
  const check = vi.fn(async () => result);
  return {
    check,
    downloadAndInstall: vi.fn(async () => undefined),
    isSupported: () => true,
  };
}

describe('UpdateService', () => {
  it('does not check automatically when disabled, but allows manual checks', async () => {
    const preferences = new FakePreferences();
    preferences.autoCheckEnabled = false;
    const adapter = createAdapter({ currentVersion: '1.2.0', latestVersion: '1.3.0', hasUpdate: true });
    const service = new UpdateService(adapter, preferences, async () => '1.2.0');

    const automatic = await service.checkForUpdates(false);
    expect(automatic.hasUpdate).toBe(false);
    expect(automatic.currentVersion).toBe('1.2.0');
    expect(adapter.check).not.toHaveBeenCalled();

    const manual = await service.checkForUpdates(true);
    expect(manual.hasUpdate).toBe(true);
    expect(manual.latestVersion).toBe('1.3.0');
    expect(adapter.check).toHaveBeenCalledTimes(1);
  });

  it('suppresses a dismissed version only for automatic checks', async () => {
    const preferences = new FakePreferences();
    preferences.dismissedVersion = '1.3.0';
    const adapter = createAdapter({ currentVersion: '1.2.0', latestVersion: '1.3.0', hasUpdate: true });
    const service = new UpdateService(adapter, preferences, async () => '1.2.0');

    expect((await service.checkForUpdates(false)).hasUpdate).toBe(false);
    expect((await service.checkForUpdates(true)).hasUpdate).toBe(true);
  });

  it('propagates adapter errors instead of reporting a false up-to-date result', async () => {
    const preferences = new FakePreferences();
    const adapter = createAdapter({ currentVersion: '1.2.0', latestVersion: '1.2.0', hasUpdate: false });
    adapter.check.mockRejectedValueOnce(new Error('network unavailable'));
    const service = new UpdateService(adapter, preferences, async () => '1.2.0');

    await expect(service.checkForUpdates(true)).rejects.toThrow('network unavailable');
  });
});
