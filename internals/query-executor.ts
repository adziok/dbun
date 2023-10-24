import {DatabaseManager} from "./database-manager.ts";
import {ParsedSqlQuery} from "./sql-parser.ts";

export class QueryExecutor {
  constructor(
    private readonly databaseManager: DatabaseManager,
  ) {}

  plan(database: string, query: ParsedSqlQuery) {
    const table = this.databaseManager.getMetadataForTable(database, query.table);
    console.log(table);
    // const columns = table.metadata.columns.filter((column) => query.columns.includes(column.name));
    // const where = Object.entries(query.where).map(([key, value]) => {
    //   const column = table.metadata.columns.find((column) => column.name === key);
    //   if (column === undefined) {
    //     throw new Error(`Invalid column ${key}`);
    //   }
    //   return {
    //     column,
    //     value,
    //   };
    // });

    return {
      table,
      // columns,
      // where,
    };
  }
}