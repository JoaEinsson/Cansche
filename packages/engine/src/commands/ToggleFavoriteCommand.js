export class ToggleFavoriteCommand {
    modelId;
    description = 'Favoritar / Desfavoritar Modelo';
    constructor(modelId) {
        this.modelId = modelId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        if (calendar.models && calendar.models[this.modelId]) {
            const model = calendar.models[this.modelId];
            model.favorite = !model.favorite;
        }
    }
    undo(context) {
        this.execute(context);
    }
}
