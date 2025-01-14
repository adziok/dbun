import { PlanStep } from './base-plan-step.ts';

export class LoadDataPlanStep extends PlanStep {
  constructor(
    public readonly options: {
      dataPath: string;
      columns: { name: string; pathToPartsFolder: string; type: string }[];
      parts: string[];
      totalPartsCount: number;
    },
  ) {
    super();
  }

  describe(): string[] {
    return [
      `LoadDataPlanStep:`,
      `Columns: ${this.options.columns.map((c) => c.name).join(', ')}`,
      `From: ${this.options.dataPath}`,
      `Parts: (${this.options.parts.length}/${this.options.totalPartsCount})`,
    ];
  }

  getPartsPathsGrouped(): Record<string, { path: string; type: string }>[] {
    return this.options.parts.map((part) =>
      Object.fromEntries(
        this.options.columns.map((c) => [
          c.name,
          { path: `${c.pathToPartsFolder}${part}.txt`, type: c.type },
        ]),
      ),
    );
  }
}
