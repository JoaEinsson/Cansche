import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, generateId } from '@cansche/shared';
import { PresetInstance, ChecklistItem } from '@cansche/domain';

export class ApplyPresetCommand implements Command {
  public description = 'Aplicar Preset';
  private previousStates: Record<ISODate, PresetInstance[]> = {};

  constructor(
    private dates: ISODate[],
    private presetId: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    const parentPreset = calendar.presets[this.presetId];
    this.previousStates = {};

    for (const date of this.dates) {
      const cell = calendar.cells[date];
      this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];

      const currentInstances = cell && cell.presetInstances ? [...cell.presetInstances] : [];
      
      const alreadyHas = currentInstances.some((inst) => inst.presetId === this.presetId);
      if (!alreadyHas) {
        // Instantiate checklist items from template
        const initialChecklist: ChecklistItem[] = (
          parentPreset?.content?.checklistTemplate || []
        ).map((text) => ({
          id: generateId('chk'),
          text,
          completed: false,
        }));

        currentInstances.push({
          id: generateId('inst'),
          presetId: this.presetId,
          source: 'preset',
          checklistState: initialChecklist,
          createdAt: new Date().toISOString(),
        });
      }

      context.setCellPresetInstances(date, currentInstances);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevInstances] of Object.entries(this.previousStates)) {
      context.setCellPresetInstances(date, prevInstances);
    }
  }
}
