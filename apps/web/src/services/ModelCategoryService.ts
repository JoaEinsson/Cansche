import { reactive } from 'vue';
import { Model } from '@cansche/domain';
import { UIPreferencesService } from './UIPreferencesService';

export interface GroupedCategory {
  name: string;
  models: Model[];
  collapsed: boolean;
  count: number;
}

class ModelCategoryServiceImpl {
  public collapsedMap = reactive<Record<string, boolean>>(UIPreferencesService.getCollapsedCategories());

  public toggleCategory(categoryName: string): void {
    const isCurrentlyCollapsed = !!this.collapsedMap[categoryName];
    this.collapsedMap[categoryName] = !isCurrentlyCollapsed;
    UIPreferencesService.setCategoryCollapsed(categoryName, !isCurrentlyCollapsed);
  }

  public expandCategory(categoryName: string): void {
    this.collapsedMap[categoryName] = false;
    UIPreferencesService.setCategoryCollapsed(categoryName, false);
  }

  public getGroupedCategories(models: Model[]): GroupedCategory[] {
    const groups: Record<string, Model[]> = {};

    for (const model of models) {
      const catName = model.metadata?.category || (model as any).category || 'Geral';
      if (!groups[catName]) {
        groups[catName] = [];
      }
      groups[catName].push(model);
    }

    const sortedCategoryNames = Object.keys(groups).sort((a, b) => {
      if (a === 'Geral') return 1;
      if (b === 'Geral') return -1;
      return a.localeCompare(b);
    });

    return sortedCategoryNames.map((catName) => {
      const categoryModels = [...groups[catName]].sort((a, b) => {
        // 1. Favorites first
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;

        // 2. Manual order property if available
        const orderA = (a as any).order ?? 999;
        const orderB = (b as any).order ?? 999;
        if (orderA !== orderB) return orderA - orderB;

        // 3. Usage count
        const usageA = a.usageCount || 0;
        const usageB = b.usageCount || 0;
        if (usageA !== usageB) return usageB - usageA;

        // 4. Alphabetical by name
        return a.name.localeCompare(b.name);
      });

      return {
        name: catName,
        models: categoryModels,
        collapsed: !!this.collapsedMap[catName],
        count: categoryModels.length,
      };
    });
  }
}

export const ModelCategoryService = new ModelCategoryServiceImpl();
