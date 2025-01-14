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
    return [`OrderByPlanStep:`];
  }
}
