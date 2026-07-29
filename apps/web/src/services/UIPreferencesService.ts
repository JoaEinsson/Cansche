export class UIPreferencesService {
  private static readonly COLLAPSED_CATEGORIES_KEY = 'cansche_collapsed_categories';

  public static getCollapsedCategories(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.COLLAPSED_CATEGORIES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static setCategoryCollapsed(categoryName: string, collapsed: boolean): void {
    try {
      const state = this.getCollapsedCategories();
      state[categoryName] = collapsed;
      localStorage.setItem(this.COLLAPSED_CATEGORIES_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save UI preferences:', e);
    }
  }
}
