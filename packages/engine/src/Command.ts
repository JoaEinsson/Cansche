import { EngineContext } from './EngineContext';

export interface Command {
  id?: string;
  description: string;
  execute(context: EngineContext): void;
  undo(context: EngineContext): void;
}
