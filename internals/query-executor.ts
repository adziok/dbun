import { FilterDataPlanStep } from './plan-steps/filter-data-plan-step.ts';
import { PlanStep } from './plan-steps/base-plan-step.ts';
import { LoadDataPlanStep } from './plan-steps/load-data-plan-step.ts';
import { PreWherePlanStep } from './plan-steps/prewhere-plan-step.ts';
import { Effect } from 'effect';
import pLimit from 'p-limit';
import { OrderDataPlanStep } from './plan-steps/order-data-plan-step.ts';
import { OffsetDataPlanStep } from './plan-steps/offset-data-plan-step.ts';
import { LimitDataPlanStep } from './plan-steps/limit-data-plan-step.ts';

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

    // const result2 = Effect.all(
    //   partsToLoad.map((partToLoad) => {
    //     const columnNames = Object.keys(partToLoad);
    //
    //     return Effect.tryPromise(() =>
    //       Promise.all(
    //         Object.entries(partToLoad).map(
    //           async ([columnName, path]): Promise<string[]> => {
    //             return (
    //               await Bun.file(path, {
    //                 type: 'text',
    //               }).text()
    //             ).split('\n');
    //           },
    //         ),
    //       ),
    //     ).pipe(
    //       Effect.map((data) => {
    //         const objects: Record<string, string>[] = [];
    //         data[0].forEach((_: any, rawColumnValueRowIndex: number) => {
    //           const obj: Record<string, string> = {};
    //           columnNames.forEach((columnName, columnIndex) => {
    //             obj[columnName] = data[columnIndex][rawColumnValueRowIndex];
    //           });
    //           objects.push(obj);
    //         });
    //
    //         const filters =
    //           planStep.nextStep instanceof FilterDataPlanStep
    //             ? planStep.nextStep.getFilterConditionForColumn()
    //             : null;
    //
    //         if (filters) {
    //           mutationFilter(objects, filters);
    //         }
    //         return objects;
    //       }),
    //     );
    //   }),
    //   {
    //     concurrency: 16,
    //   },
    // );
    //
    // const res = await Effect.runPromise(result2);
    //
    // return res.flat();

    // ========================================================================================================================
    const limit = pLimit(16);

    const parsePart = async (partToLoad: Record<string, string>) => {
      const columnNames = Object.keys(partToLoad);
      const rawData = await Promise.all(
        Object.entries(partToLoad).map(
          async ([columnName, path]): Promise<string[]> => {
            return (
              await Bun.file(path, {
                type: 'text',
              }).text()
            ).split('\n');
          },
        ),
      );
      const filters =
        planStep.nextStep instanceof FilterDataPlanStep
          ? planStep.nextStep.getFilterConditionForColumn()
          : null;

      const objects: Record<string, string>[] = [];
      rawData[0].forEach((_: any, rawColumnValueRowIndex: number) => {
        const obj: Record<string, string> = {};
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

    // ========================================================================================================================
    // const limit = pLimit(16);
    //
    // const parsePart = async (partToLoad: Record<string, string>) => {
    //   const rawData = await Promise.all(
    //     Object.entries(partToLoad).map(async ([columnName, path]) => {
    //       return [
    //         columnName,
    //         (
    //           await Bun.file(path, {
    //             type: 'text',
    //           }).text()
    //         ).split('\n'),
    //       ];
    //     }),
    //   );
    //   const data = Object.fromEntries(rawData);
    //   const keys = Object.keys(data);
    //   const filters =
    //     planStep.nextStep instanceof FilterDataPlanStep
    //       ? planStep.nextStep.getFilterConditionForColumn()
    //       : null;
    //
    //   const objects = data[keys[0]].map((_: any, index: number) => {
    //     const obj: Record<string, string> = {};
    //     keys.forEach((key) => {
    //       obj[key] = data[key][index];
    //     });
    //     return obj;
    //   });
    //
    //   if (filters) {
    //     return objects.filter(filters);
    //   } else {
    //     return objects;
    //   }
    // };
    //
    // let promises = partsToLoad.map((partToLoad) => {
    //   // wrap the function we are calling in the limit function we defined above
    //   return limit(() => parsePart(partToLoad));
    // });
    //
    // const result = await Promise.all(promises);
    //
    // return result.flat();

    // ========================================================================================================================

    // let result: any[] = [];
    // for await (const partToLoad of partsToLoad) {
    //   const rawData = await Promise.all(
    //     Object.entries(partToLoad).map(async ([columnName, path]) => {
    //       return [
    //         columnName,
    //         (
    //           await Bun.file(path, {
    //             type: 'text',
    //           }).text()
    //         ).split('\n'),
    //       ];
    //     }),
    //   );
    //   const data = Object.fromEntries(rawData);
    //   const keys = Object.keys(data);
    //   const filters =
    //     planStep.nextStep instanceof FilterDataPlanStep
    //       ? planStep.nextStep.getFilterConditionForColumn()
    //       : null;
    //
    //   const objects = data[keys[0]].map((_: any, index: number) => {
    //     const obj: Record<string, string> = {};
    //     keys.forEach((key) => {
    //       obj[key] = data[key][index];
    //     });
    //     return obj;
    //   });
    //
    //   if (filters) {
    //     result.push(...objects.filter(filters));
    //   } else {
    //     result.push(...objects);
    //   }
    // }
    //
    // return result;
  }

  describePlan(planStep: PlanStep): string[] {
    return [
      planStep.describe(),
      (planStep.nextStep && this.describePlan(planStep.nextStep)) || [],
    ].flat();
  }
}
