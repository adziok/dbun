export abstract class PlanStep {
  abstract describe(): string[];

  nextStep?: PlanStep;

  setNextStep(step: PlanStep): PlanStep {
    this.nextStep = step;
    return this;
  }
}
