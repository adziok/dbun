export abstract class PlanStep {
  abstract describe(): string[];

  nextStep?: PlanStep;

  private setNextStep(step: PlanStep): PlanStep {
    this.nextStep = step;
    return this;
  }

  pushStep(step: PlanStep): PlanStep {
    if (this.nextStep) {
      this.nextStep.pushStep(step);
    } else {
      this.setNextStep(step);
    }

    return this;
  }
}
