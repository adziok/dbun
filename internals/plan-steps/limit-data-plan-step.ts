import { PlanStep } from './base-plan-step.ts';

export class LimitDataPlanStep extends PlanStep {
  constructor(
    public readonly options: {
      limit: number;
    },
  ) {
    super();
  }

  describe(): string[] {
    return [
      `OrderByPlanStep:`,
      // `Columns: ${this.options.columns.map((c) => c.name).join(', ')}`,
      // `From: ${this.options.dataPath}`,
      // `Parts: (${this.options.parts.length}/${this.options.totalPartsCount})`, // ${this.options.parts.join(', ')}`,
    ];
  }
}
