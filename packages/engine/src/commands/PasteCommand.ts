import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, addDays, generateId } from '@cansche/shared';
import { ClipboardData, PresetInstance } from '@cansche/domain';

export class PasteCommand implements Command {
  public description = 'Colar Células';
  private previousStates: Record<ISODate, PresetInstance[]> = {};

  constructor(
    private targetStartDate: ISODate,
    private clipboardData: ClipboardData
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    for (const item of this.clipboardData.items) {
      const targetDate = addDays(this.targetStartDate, item.relativeDayOffset);
      const cell = calendar.cells[targetDate];
      this.previousStates[targetDate] = cell && cell.presetInstances ? [...cell.presetInstances] : [];

      const newInstances: PresetInstance[] = item.presetInstances.map((inst) => ({
        id: generateId('inst'),
        presetId: inst.presetId,
        source: inst.source || 'preset',
        overrides: inst.overrides ? { ...inst.overrides } : undefined,
        checklistState: (inst.checklistState || []).map((chk) => ({
          id: generateId('chk'),
          text: chk.text,
          completed: chk.completed,
        })),
        createdAt: new Date().toISOString(),
      }));

      context.setCellPresetInstances(targetDate, newInstances);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevInstances] of Object.entries(this.previousStates)) {
      context.setCellPresetInstances(date, prevInstances);
    }
  }
}
