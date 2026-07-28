import { Command } from '../Command';
import { EngineContext } from '../EngineContext';

export class ToggleFavoriteCommand implements Command {
  public description = 'Favoritar / Desfavoritar Modelo';

  constructor(private modelId: string) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    if (calendar.models && calendar.models[this.modelId]) {
      const model = calendar.models[this.modelId];
      model.favorite = !model.favorite;
    }
  }

  public undo(context: EngineContext): void {
    this.execute(context);
  }
}
