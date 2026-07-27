import { Command } from './Command';
import { EngineContext } from './EngineContext';

export class HistoryService {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  public executeCommand(command: Command, context: EngineContext): void {
    command.execute(context);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  public undo(context: EngineContext): Command | null {
    const command = this.undoStack.pop();
    if (!command) return null;

    command.undo(context);
    this.redoStack.push(command);
    return command;
  }

  public redo(context: EngineContext): Command | null {
    const command = this.redoStack.pop();
    if (!command) return null;

    command.execute(context);
    this.undoStack.push(command);
    return command;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
