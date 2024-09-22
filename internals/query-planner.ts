import { ParsedSqlQuery } from './sql-parser/sql-parser.ts';
import { DatabaseManager } from './database-manager.ts';
import { onlyUnique } from './utils.ts';
import { PlanStep } from './plan-steps/base-plan-step.ts';
import { LoadDataPlanStep } from './plan-steps/load-data-plan-step.ts';

export class QueryPlanner {
  constructor(private readonly databaseManager: DatabaseManager) {}
  planQuery(query: ParsedSqlQuery): PlanStep {
    const table = this.databaseManager.getMetadataForTable(
      query.database,
      query.table,
    );

    const loadColumns = [...query.columns];

    const partsToLoad = Object.entries(table.columns)
      .map(([name, column]) => {
        // TODO - implement prewhere
        const shouldPreWhere = false; //query.where[name] !== undefined;

        // if (shouldPreWhere && column.index) {
        //   return Object.entries(column.index.parts)
        //     .filter(([key, values]) =>
        //       values.includes(typeTransformers[column.type](query.where[name])),
        //     )
        //     .map(([key]) => key);
        // }
        return table.parts;
      })
      .flat()
      .filter(onlyUnique)
      .filter((d) => d !== undefined) as string[];

    return new LoadDataPlanStep({
      parts: partsToLoad,
      dataPath: 'aaa', // TODO - implement data path
      columns: loadColumns.map((column) => {
        const pathToPartsFolder = table.columns[column].pathToPartsFolder;

        return {
          name: column,
          pathToPartsFolder,
        };
      }),
    });
  }
}
