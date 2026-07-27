import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate } from '@cansche/shared';
import { PresetInstance } from '@cansche/domain';

export class ClearCellsCommand implements Command {
  public description = 'Limpar Células';
  private previousStates: Record<ISODate, PresetInstance[]> = {};

  constructor(private dates: ISODate[]) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    for (const date of this.dates) {
      const cell = calendar.cells[date];
      this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
      context.setCellPresetInstances(date, []);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevInstances] of Object.entries(this.previousStates)) {
      context.setCellPresetInstances(date, prevInstances);
    }
  }
}
