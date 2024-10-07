import { WhereStatement } from './sql-parser.types.ts';

const supportedOperators = ['=', '!=', '>', '<', '>=', '<='];

export const validateWhereStatement = (where: WhereStatement): void => {
  if (where.operator === 'AND' || where.operator === 'OR') {
    validateWhereStatement(where.left);
    validateWhereStatement(where.right);
  } else {
    if (!supportedOperators.includes(where.operator)) {
      throw new Error(`[${where.operator}] Unsupported operator`);
    }
  }
};

export const extractWhereColumns = (
  where: WhereStatement,
  providedColumns: string[] = [],
): string[] => {
  if (where.operator === 'AND' || where.operator === 'OR') {
    extractWhereColumns(where.left, providedColumns);
    extractWhereColumns(where.right, providedColumns);
  } else {
    if (where.left.type === 'column_ref') {
      providedColumns.push(where.left.column);
    }
    if (where.right.type === 'column_ref') {
      providedColumns.push(where.right.column);
    }
  }
  return [...new Set(providedColumns)];
};
