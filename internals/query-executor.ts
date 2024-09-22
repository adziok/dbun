import { FilterDataPlanStep } from './plan-steps/filter-data-plan-step.ts';
import { PlanStep } from './plan-steps/base-plan-step.ts';
import { LoadDataPlanStep } from './plan-steps/load-data-plan-step.ts';

export class QueryExecutor {
  async execute(planStep: PlanStep) {
    if (!(planStep instanceof LoadDataPlanStep)) {
      throw new Error('Invalid plan step');
    }

    const partsToLoad = planStep.getPartsPathsGrouped();

    let result: any[] = [];
    for await (const partToLoad of partsToLoad) {
      const rawData = await Promise.all(
        Object.entries(partToLoad).map(async ([columnName, path]) => {
          return [
            columnName,
            (
              await Bun.file(path, {
                type: 'text',
              }).text()
            ).split('\n'),
          ];
        }),
      );
      const data = Object.fromEntries(rawData);
      const keys = Object.keys(data);
      const filters =
        planStep.nextStep instanceof FilterDataPlanStep
          ? planStep.nextStep.getFilterConditionForColumn()
          : null;

      const objects = data[keys[0]].map((_: any, index: number) => {
        const obj: Record<string, string> = {};
        keys.forEach((key) => {
          obj[key] = data[key][index];
        });
        return obj;
      });

      if (filters) {
        result = result.concat(objects.filter(filters));
      } else {
        result = result.concat(objects);
      }
    }
    return result;
  }

  describePlan(planStep: PlanStep): string[] {
    return [
      planStep.describe(),
      (planStep.nextStep && this.describePlan(planStep.nextStep)) || [],
    ].flat();
  }
}
