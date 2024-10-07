import { Parser, Select } from 'node-sql-parser';
import { WhereStatement } from './sql-parser.types.ts';
import {
  extractWhereColumns,
  validateWhereStatement,
} from './where-validator.ts';

export type ParsedSqlQuery = {
  database: string;
  columns: string[];
  table: string;
  where: WhereStatement;
  columnsUsedInWhere: string[];
};

export class SqlParser {
  static parse(rawSqlQuery: string, database: string): ParsedSqlQuery {
    const parser = new Parser();

    const ast = parser.parse(rawSqlQuery, {
      database: 'MySQL',
      type: 'select',
    });
    const whereStatement = (ast.ast as Select[])[0]
      .where as any as WhereStatement;
    whereStatement &&
      validateWhereStatement(
        (ast.ast as Select[])[0].where as any as WhereStatement,
      );

    return {
      // TODO
      columns: ast.columnList
        .map((c) => c.split('::')[2])
        .map((d) => {
          if (d === '(.*)') {
            return '*';
          }
          return d;
        })
        .flat(),
      table: ast.tableList[0].split('::')[2],
      where: whereStatement,
      database,
      columnsUsedInWhere:
        (whereStatement &&
          extractWhereColumns(
            (ast.ast as Select[])[0].where as any as WhereStatement,
          )) ||
        [],
    };
  }
}
