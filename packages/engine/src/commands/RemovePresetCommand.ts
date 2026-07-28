import { Command } from '../Command';
import { EngineContext } from '../EngineContext';

export class RemovePresetCommand implements Command {
  public description = 'Remover Modelo da Data';

  constructor(
    private dates: string[],
    private modelId: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    if (calendar.events) {
      for (const [id, evt] of Object.entries(calendar.events)) {
        if (this.dates.includes(evt.date) && evt.modelId === this.modelId) {
          delete calendar.events[id];
        }
      }
    }
  }

  public undo(context: EngineContext): void {
    // Undo helper
  }
}
