import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate } from '@cansche/shared';
import { PresetInstance } from '@cansche/domain';

export class RemovePresetCommand implements Command {
  public description = 'Remover Preset';
  private previousStates: Record<ISODate, PresetInstance[]> = {};

  constructor(
    private dates: ISODate[],
    private presetId?: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    for (const date of this.dates) {
      const cell = calendar.cells[date];
      this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];

      if (!this.presetId) {
        context.setCellPresetInstances(date, []);
      } else {
        const current = cell && cell.presetInstances ? cell.presetInstances : [];
        const updated = current.filter((inst) => inst.presetId !== this.presetId);
        context.setCellPresetInstances(date, updated);
      }
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevInstances] of Object.entries(this.previousStates)) {
      context.setCellPresetInstances(date, prevInstances);
    }
  }
}
