import { FilterDataPlanStep } from './plan-steps/filter-data-plan-step.ts';
import { PlanStep } from './plan-steps/base-plan-step.ts';
import { LoadDataPlanStep } from './plan-steps/load-data-plan-step.ts';
import { PreWherePlanStep } from './plan-steps/prewhere-plan-step.ts';
import pLimit from 'p-limit';
import { OrderDataPlanStep } from './plan-steps/order-data-plan-step.ts';
import { OffsetDataPlanStep } from './plan-steps/offset-data-plan-step.ts';
import { LimitDataPlanStep } from './plan-steps/limit-data-plan-step.ts';
import { getDateTypeClass } from './data-types/get-date-type-class.ts';

function mutationFilter(arr: any[], cb: (a: any) => boolean) {
  for (let l = arr.length - 1; l >= 0; l -= 1) {
    if (!cb(arr[l])) arr.splice(l, 1);
  }
}

export class QueryExecutor {
  async execute(planStep: PlanStep): Promise<any[]> {
    if (planStep instanceof PreWherePlanStep) {
      return await this.execute(planStep.nextStep!);
    }

    if (!(planStep instanceof LoadDataPlanStep)) {
      throw new Error('Invalid plan step');
    }

    const partsToLoad = planStep.getPartsPathsGrouped();

    const limit = pLimit(16);

    const parsePart = async (
      partToLoad: Record<string, { path: string; type: string }>,
    ) => {
      const columnNames = Object.keys(partToLoad);
      const rawData = await Promise.all(
        Object.entries(partToLoad).map(
          async ([columnName, { path, type }]): Promise<
            (string | number)[]
          > => {
            const raw = (
              await Bun.file(path, {
                type: 'text',
              }).text()
            ).split('\n');

            // To avoid parsing the data if it is a string
            if (type === 'string') {
              return raw;
            }

            const dataType = getDateTypeClass(type);

            return raw.map((r) => dataType.fromString(r));
          },
        ),
      );
      const filters =
        planStep.nextStep instanceof FilterDataPlanStep
          ? planStep.nextStep.getFilterConditionForColumn()
          : null;

      const objects: Record<string, string | number>[] = [];
      rawData[0].forEach((_: any, rawColumnValueRowIndex: number) => {
        const obj: Record<string, string | number> = {};
        columnNames.forEach((columnName, columnIndex) => {
          obj[columnName] = rawData[columnIndex][rawColumnValueRowIndex];
        });
        objects.push(obj);
      });

      if (filters) {
        mutationFilter(objects, filters);
      }

      return objects;
    };

    let promises = partsToLoad.map((partToLoad) => {
      // wrap the function we are calling in the limit function we defined above
      return limit(() => parsePart(partToLoad));
    });

    const result = (await Promise.all(promises)).flat();

    const orderByStep = planStep.findStep<OrderDataPlanStep>(OrderDataPlanStep);

    if (orderByStep) {
      const sortCB = orderByStep.getOrderBy();
      result.sort((a, b) => {
        return sortCB(a, b) ? 1 : -1;
      });
    }

    const limitStep = planStep.findStep<LimitDataPlanStep>(LimitDataPlanStep);

    if (limitStep) {
      const offsetStep =
        planStep.findStep<OffsetDataPlanStep>(OffsetDataPlanStep);

      const offset = offsetStep?.options.offset ?? 0;

      return result.slice(offset, limitStep?.options.limit + offset);
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
