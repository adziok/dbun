import { PlanStep } from './base-plan-step.ts';

export class OffsetDataPlanStep extends PlanStep {
  constructor(
    public readonly options: {
      offset: number;
    },
  ) {
    super();
  }

  describe(): string[] {
    return [
      `OffsetDataPlanStep:`,
      // `Columns: ${this.options.columns.map((c) => c.name).join(', ')}`,
      // `From: ${this.options.dataPath}`,
      // `Parts: (${this.options.parts.length}/${this.options.totalPartsCount})`, // ${this.options.parts.join(', ')}`,
    ];
  }
}
