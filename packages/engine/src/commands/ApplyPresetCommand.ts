import { ApplyModelCommand } from './ApplyModelCommand';

export class ApplyPresetCommand extends ApplyModelCommand {
  constructor(dates: string[], presetId: string) {
    super(dates, presetId);
  }
}
