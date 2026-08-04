export async function getAppVersion(): Promise<string> {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { getVersion } = await import('@tauri-apps/api/app');
    return getVersion();
  }

  return __CANSCHE_APP_VERSION__;
}

export function getBundledAppVersion(): string {
  return __CANSCHE_APP_VERSION__;
}

