import { getDayOfWeek } from '@cansche/shared';
export class ConstraintValidator {
    static validateModelApplication(model, targetDate, workspace) {
        if (!model.constraints || model.constraints.length === 0) {
            return { valid: true };
        }
        for (const constraint of model.constraints) {
            if (constraint.type === 'weekday') {
                const allowedDays = constraint.params.allowedDays || [];
                const currentDay = getDayOfWeek(targetDate);
                if (allowedDays.length > 0 && !allowedDays.includes(currentDay)) {
                    const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    const names = allowedDays.map((d) => daysMap[d]).join(', ');
                    return {
                        valid: false,
                        message: `O modelo "${model.name}" restringe aplicação para os dias: ${names}.`,
                    };
                }
            }
            else if (constraint.type === 'count') {
                const maxPerWeek = constraint.params.maxPerWeek || 7;
                let currentWeekCount = 0;
                for (const cal of Object.values(workspace.calendars || {})) {
                    if (cal.events) {
                        for (const evt of Object.values(cal.events)) {
                            if (evt.modelId === model.id) {
                                currentWeekCount++;
                            }
                        }
                    }
                }
                if (currentWeekCount >= maxPerWeek) {
                    return {
                        valid: false,
                        message: `O modelo "${model.name}" atingiu o limite máximo de ${maxPerWeek} instâncias no mês/período.`,
                    };
                }
            }
        }
        return { valid: true };
    }
}
