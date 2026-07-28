export class CreateTagCommand {
    tag;
    description = 'Criar Tag';
    constructor(tag) {
        this.tag = tag;
    }
    execute(context) {
        const ws = context.getWorkspace();
        if (!ws.tagLibrary)
            ws.tagLibrary = {};
        ws.tagLibrary[this.tag.id] = this.tag;
    }
    undo(context) {
        const ws = context.getWorkspace();
        if (ws.tagLibrary) {
            delete ws.tagLibrary[this.tag.id];
        }
    }
}
export class AssignTagCommand {
    modelId;
    tagId;
    description = 'Atribuir Tag ao Modelo';
    constructor(modelId, tagId) {
        this.modelId = modelId;
        this.tagId = tagId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        const model = calendar.models ? calendar.models[this.modelId] : undefined;
        if (model) {
            if (!model.tags)
                model.tags = [];
            if (!model.tags.includes(this.tagId)) {
                model.tags.push(this.tagId);
            }
        }
    }
    undo(context) {
        const calendar = context.getActiveCalendar();
        const model = calendar.models ? calendar.models[this.modelId] : undefined;
        if (model && model.tags) {
            model.tags = model.tags.filter((t) => t !== this.tagId);
        }
    }
}
