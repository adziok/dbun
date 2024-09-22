import { WhereStatement } from './sql-parser.types.ts';

const supportedOperators = ['=', '!='];

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
