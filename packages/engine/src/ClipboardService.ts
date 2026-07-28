import { ClipboardData, ClipboardItem } from '@cansche/domain';
import { ISODate, diffInDays } from '@cansche/shared';
import { EngineContext } from './EngineContext';

export class ClipboardService {
  public copy(dates: ISODate[], context: EngineContext): ClipboardData {
    console.log('[CANSCHE DIAG] 1. ClipboardService.copy chamando para datas:', dates);
    if (dates.length === 0) {
      const empty: ClipboardData = { items: [] };
      context.setClipboard(empty);
      console.log('[CANSCHE DIAG] 1a. Nenhuma data selecionada. Clipboard vazio salvo no engine.');
      return empty;
    }

    const sortedDates = [...dates].sort();
    const originDate = sortedDates[0];
    const calendar = context.getActiveCalendar();

    console.log('[CANSCHE DIAG] 1b. Calendário ativo:', calendar.name, 'Total eventos no cal:', Object.keys(calendar.events || {}).length);

    const items: ClipboardItem[] = sortedDates
      .map((d) => {
        const dayEvents = Object.values(calendar.events || {}).filter((e) => e.date === d);
        console.log(`[CANSCHE DIAG] 1c. Dia ${d}: encontrados ${dayEvents.length} eventos`);
        return {
          relativeDayOffset: diffInDays(originDate, d),
          events: JSON.parse(JSON.stringify(dayEvents)),
        };
      })
      .filter((item) => item.events.length > 0);

    const clipboardData: ClipboardData = {
      items,
      originDate,
    };

    context.setClipboard(clipboardData);
    console.log('[CANSCHE DIAG] 1d. Clipboard gravado com sucesso no Engine:', clipboardData);
    return clipboardData;
  }

  public getClipboard(context: EngineContext): ClipboardData | null {
    return context.getClipboard();
  }
}
