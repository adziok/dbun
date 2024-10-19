import { Parser, Select } from 'node-sql-parser';
import { WhereStatement } from './sql-parser.types.ts';
import {
  extractWhereColumns,
  validateWhereStatement,
} from './where-validator.ts';
import { DatabaseManager } from '../database-manager/database-manager.ts';

export type ParsedSqlQuery = {
  database: string;
  columns: string[];
  table: string;
  where: WhereStatement;
  columnsUsedInWhere: string[];
  orderBys?: {
    expr: {
      type: 'column_ref';
      table: null;
      column: string;
    };
    type: 'DESC' | 'ASC';
  }[];
  limit?: number;
  offset?: number;
};

export class SqlParser {
  static parse(rawSqlQuery: string, database: string): ParsedSqlQuery {
    const parser = new Parser();

    const ast = parser.parse(rawSqlQuery, {
      database: 'MySQL',
      type: 'select',
    });
    const selectAst = (ast.ast as Select[])[0];

    const whereStatement = selectAst.where as any as WhereStatement;
    whereStatement &&
      validateWhereStatement(selectAst.where as any as WhereStatement);

    // console.log(JSON.stringify(selectAst, null, 2));

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
          extractWhereColumns(selectAst.where as any as WhereStatement)) ||
        [],
      orderBys: selectAst.orderby as any,
      limit: selectAst.limit?.value?.[0]?.value,
      offset: selectAst.limit?.value?.[1]?.value,
    };
  }
}
