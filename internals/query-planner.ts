import { ParsedSqlQuery } from './sql-parser/sql-parser.ts';
import { DatabaseManager } from './database-manager/database-manager.ts';
import { PlanStep } from './plan-steps/base-plan-step.ts';
import { LoadDataPlanStep } from './plan-steps/load-data-plan-step.ts';
import { PreWherePlanStep } from './plan-steps/prewhere-plan-step.ts';
import { FilterDataPlanStep } from './plan-steps/filter-data-plan-step.ts';
import { OrderDataPlanStep } from './plan-steps/order-data-plan-step.ts';
import { LimitDataPlanStep } from './plan-steps/limit-data-plan-step.ts';
import { OffsetDataPlanStep } from './plan-steps/offset-data-plan-step.ts';

export class QueryPlanner {
  constructor(private readonly databaseManager: DatabaseManager) {}

  planQuery(
    query: ParsedSqlQuery,
    options: { enablePreWhereStep: boolean } = { enablePreWhereStep: true },
  ): PlanStep {
    let planStep = this._planQuery(query, options);

    if (query?.where) {
      planStep.pushStep(
        new FilterDataPlanStep({
          filters: query.where,
        }),
      );
    }

    if (query?.orderBys) {
      planStep?.pushStep(
        new OrderDataPlanStep({
          orderBys: query.orderBys,
        }),
      );
    }

    if (query?.limit) {
      planStep?.pushStep(
        new LimitDataPlanStep({
          limit: query.limit,
        }),
      );
    }

    if (query?.offset) {
      planStep?.pushStep(
        new OffsetDataPlanStep({
          offset: query.offset,
        }),
      );
    }

    return planStep;
  }

  private _planQuery(
    query: ParsedSqlQuery,
    options: { enablePreWhereStep: boolean } = { enablePreWhereStep: true },
  ): PlanStep {
    const table = this.databaseManager.getMetadataForTable(
      query.database,
      query.table,
    );

    const loadColumns = query.columns
      .map((d) => {
        if (d === '*') {
          return Object.keys(table.columns);
        }
        return d;
      })
      .flat();

    const indexedColumnsUsedInWhere = Object.entries(table.columns).filter(
      ([name, column]) => {
        return (
          column.index !== undefined && query.columnsUsedInWhere.includes(name)
        );
      },
    );

    const shouldPreWhereColumn =
      Object.keys(indexedColumnsUsedInWhere).length > 0 &&
      options.enablePreWhereStep;

    if (shouldPreWhereColumn) {
      const preWherePlanStep = new PreWherePlanStep({
        filters: query.where,
        indexes: Object.fromEntries(indexedColumnsUsedInWhere),
        allParts: table.parts,
      });
      const partsToLoad = preWherePlanStep.getParts();

      return preWherePlanStep.pushStep(
        new LoadDataPlanStep({
          parts: partsToLoad,
          totalPartsCount: table.parts.length,
          dataPath: table.tableName,
          columns: loadColumns.map((column) => {
            const pathToPartsFolder = table.columns[column].pathToPartsFolder;
            const type = table.columns[column].type;

            return {
              name: column,
              pathToPartsFolder,
              type,
            };
          }),
        }),
      );
    }

    return new LoadDataPlanStep({
      parts: table.parts,
      totalPartsCount: table.parts.length,
      dataPath: table.tableName,
      columns: loadColumns.map((column) => {
        const pathToPartsFolder = table.columns[column].pathToPartsFolder;
        const type = table.columns[column].type;

        return {
          name: column,
          pathToPartsFolder,
          type,
        };
      }),
    });
  }
}
