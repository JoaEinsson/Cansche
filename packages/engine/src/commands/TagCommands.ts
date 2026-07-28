import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { Tag } from '@cansche/domain';

export class CreateTagCommand implements Command {
  public description = 'Criar Tag';

  constructor(private tag: Tag) {}

  public execute(context: EngineContext): void {
    const ws = context.getWorkspace();
    if (!ws.tagLibrary) ws.tagLibrary = {};
    ws.tagLibrary[this.tag.id] = this.tag;
  }

  public undo(context: EngineContext): void {
    const ws = context.getWorkspace();
    if (ws.tagLibrary) {
      delete ws.tagLibrary[this.tag.id];
    }
  }
}

export class AssignTagCommand implements Command {
  public description = 'Atribuir Tag ao Modelo';

  constructor(
    private modelId: string,
    private tagId: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    const model = calendar.models ? calendar.models[this.modelId] : undefined;
    if (model) {
      if (!model.tags) model.tags = [];
      if (!model.tags.includes(this.tagId)) {
        model.tags.push(this.tagId);
      }
    }
  }

  public undo(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    const model = calendar.models ? calendar.models[this.modelId] : undefined;
    if (model && model.tags) {
      model.tags = model.tags.filter((t) => t !== this.tagId);
    }
  }
}
