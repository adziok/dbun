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
    return [`OffsetDataPlanStep:`];
  }
}
