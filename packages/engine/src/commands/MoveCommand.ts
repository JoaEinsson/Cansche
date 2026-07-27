import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, diffInDays, addDays } from '@cansche/shared';
import { PresetInstance } from '@cansche/domain';

export class MoveCommand implements Command {
  public description = 'Mover Células';
  private affectedPreviousStates: Record<ISODate, PresetInstance[]> = {};

  constructor(
    private sourceDates: ISODate[],
    private targetStartDate: ISODate
  ) {}

  public execute(context: EngineContext): void {
    if (this.sourceDates.length === 0) return;

    const calendar = context.getActiveCalendar();
    const sortedSources = [...this.sourceDates].sort();
    const originDate = sortedSources[0];

    const moves: Array<{ targetDate: ISODate; instances: PresetInstance[] }> = [];

    for (const srcDate of sortedSources) {
      const offset = diffInDays(originDate, srcDate);
      const targetDate = addDays(this.targetStartDate, offset);
      const cell = calendar.cells[srcDate];
      moves.push({
        targetDate,
        instances: cell && cell.presetInstances ? [...cell.presetInstances] : [],
      });
    }

    this.affectedPreviousStates = {};
    const allAffected = new Set([...this.sourceDates, ...moves.map((m) => m.targetDate)]);

    for (const date of allAffected) {
      const cell = calendar.cells[date];
      this.affectedPreviousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
    }

    for (const srcDate of this.sourceDates) {
      context.setCellPresetInstances(srcDate, []);
    }

    for (const move of moves) {
      context.setCellPresetInstances(move.targetDate, move.instances);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevInstances] of Object.entries(this.affectedPreviousStates)) {
      context.setCellPresetInstances(date, prevInstances);
    }
  }
}
