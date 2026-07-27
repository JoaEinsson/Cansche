export class HistoryService {
    undoStack = [];
    redoStack = [];
    maxHistorySize;
    constructor(maxHistorySize = 100) {
        this.maxHistorySize = maxHistorySize;
    }
    executeCommand(command, context) {
        command.execute(context);
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }
    undo(context) {
        const command = this.undoStack.pop();
        if (!command)
            return null;
        command.undo(context);
        this.redoStack.push(command);
        return command;
    }
    redo(context) {
        const command = this.redoStack.pop();
        if (!command)
            return null;
        command.execute(context);
        this.undoStack.push(command);
        return command;
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
