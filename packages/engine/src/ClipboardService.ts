import { ClipboardData, ClipboardItem } from '@cansche/domain';
import { ISODate, diffInDays } from '@cansche/shared';
import { EngineContext } from './EngineContext';

export class ClipboardService {
  public copy(dates: ISODate[], context: EngineContext): ClipboardData {
    if (dates.length === 0) {
      const empty: ClipboardData = { items: [] };
      context.setClipboard(empty);
      return empty;
    }

    const sortedDates = [...dates].sort();
    const originDate = sortedDates[0];
    const calendar = context.getActiveCalendar();

    const items: ClipboardItem[] = sortedDates.map((d) => {
      const dayEvents = Object.values(calendar.events || {}).filter(e => e.date === d);
      return {
        relativeDayOffset: diffInDays(originDate, d),
        events: [...dayEvents],
      };
    });

    const clipboardData: ClipboardData = {
      items,
      originDate,
    };

    context.setClipboard(clipboardData);
    return clipboardData;
  }

  public getClipboard(context: EngineContext): ClipboardData | null {
    return context.getClipboard();
  }
}
