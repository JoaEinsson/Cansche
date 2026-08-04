export type CalendarDensity = 'compact' | 'comfortable';

export interface AppSettings {
  schemaVersion: 1;
  general: {
    openToToday: boolean;
    confirmDestructiveActions: boolean;
    lastViewedMonth: string | null;
  };
  calendar: {
    weekStartsOn: 0 | 1;
    showWeekends: boolean;
    showWeekNumbers: boolean;
    density: CalendarDensity;
  };
  updates: {
    autoCheckEnabled: boolean;
    dismissedVersion: string | null;
  };
}

const STORAGE_KEY = 'cansche_app_settings_v1';
const LEGACY_AUTO_CHECK_KEY = 'cansche_auto_check_updates';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  schemaVersion: 1,
  general: {
    openToToday: true,
    confirmDestructiveActions: true,
    lastViewedMonth: null,
  },
  calendar: {
    weekStartsOn: 1,
    showWeekends: true,
    showWeekNumbers: false,
    density: 'comfortable',
  },
  updates: {
    autoCheckEnabled: true,
    dismissedVersion: null,
  },
};

function cloneSettings(settings: AppSettings): AppSettings {
  return JSON.parse(JSON.stringify(settings)) as AppSettings;
}

function mergeSettings(input: Partial<AppSettings> | null | undefined): AppSettings {
  const source = input || {};
  return {
    ...cloneSettings(DEFAULT_APP_SETTINGS),
    ...source,
    general: {
      ...DEFAULT_APP_SETTINGS.general,
      ...(source.general || {}),
    },
    calendar: {
      ...DEFAULT_APP_SETTINGS.calendar,
      ...(source.calendar || {}),
    },
    updates: {
      ...DEFAULT_APP_SETTINGS.updates,
      ...(source.updates || {}),
    },
  };
}

export class AppSettingsService {
  public static load(): AppSettings {
    if (typeof localStorage === 'undefined') return cloneSettings(DEFAULT_APP_SETTINGS);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return mergeSettings(JSON.parse(raw));

      const legacyAutoCheck = localStorage.getItem(LEGACY_AUTO_CHECK_KEY);
      if (legacyAutoCheck !== null) {
        return mergeSettings({
          updates: {
            ...DEFAULT_APP_SETTINGS.updates,
            autoCheckEnabled: legacyAutoCheck === 'true',
          },
        });
      }
    } catch (error) {
      console.warn('Failed to load app settings:', error);
    }

    return cloneSettings(DEFAULT_APP_SETTINGS);
  }

  public static save(settings: AppSettings): AppSettings {
    const normalized = mergeSettings(settings);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('Failed to save app settings:', error);
    }

    return normalized;
  }

  public static update(patch: Partial<AppSettings>): AppSettings {
    return this.save(mergeSettings({ ...this.load(), ...patch }));
  }

  public static reset(): AppSettings {
    return this.save(DEFAULT_APP_SETTINGS);
  }
}
