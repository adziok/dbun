import { WhereStatement } from '../sql-parser/sql-parser.types.ts';

import { PlanStep } from './base-plan-step.ts';
import { ColumnMetadata } from '../database-manager/types.ts';

class LoadAllPartsException {}

function extractConditions(
  json: WhereStatement,
  primaryKeyColumns: string[],
): { include: Record<string, any[]> } | LoadAllPartsException {
  let valuesToInclude: Record<string, any[]> = {};
  primaryKeyColumns.forEach((column) => {
    valuesToInclude[column] = [];
  });
  // let valuesToExclude: any[] = [];

  function parseExpression(expr: WhereStatement) {
    if (expr.operator === 'OR') {
      valuesToInclude = {};
      return;
    }
    if (expr.operator === 'AND') {
      // Rekurencyjnie analizujemy lewe i prawe wyrażenia
      parseExpression(expr.left);
      parseExpression(expr.right);
    } else if (
      expr.operator === '=' &&
      primaryKeyColumns.includes(expr.left.column)
    ) {
      // Jeśli operator to '=' to dodajemy wartość do uwzględnienia
      valuesToInclude[expr.left.column].push(expr.right.value);
    } else if (
      expr.operator === '=' &&
      primaryKeyColumns.includes(expr.right.column)
    ) {
      // Jeśli operator to '=' to dodajemy wartość do uwzględnienia
      valuesToInclude[expr.left.column].push(expr.left.value);
    }
    // else if (expr.operator === '!=') {
    //   // Jeśli operator to '!=' to dodajemy wartość do wykluczenia
    //   valuesToExclude.push(expr.right.value);
    // }
  }

  parseExpression(json);

  if (Object.keys(valuesToInclude).length === 0) {
    return new LoadAllPartsException();
  }
  return {
    include: valuesToInclude,
    // exclude: valuesToExclude,
  };
}

export class PreWherePlanStep extends PlanStep {
  constructor(
    public readonly options: {
      filters: WhereStatement;
      indexes: Record<string, ColumnMetadata>;
      allParts: string[];
    },
  ) {
    super();
  }

  describe(): string[] {
    let result: string[] = [];

    const conditions = extractConditions(
      this.options.filters,
      Object.keys(this.options.indexes),
    );

    if (conditions instanceof LoadAllPartsException) {
      result = ['Prewhere not applied', 'All parts will be loaded'];
    } else {
      result = Object.entries(conditions.include).map(([name, values]) => {
        return `[${name}] will be loaded with values (${values.join(', ')})`;
      });
    }

    return [`PreWherePlanStep`, ...result];
  }

  getParts(): string[] {
    const conditions = extractConditions(
      this.options.filters,
      Object.keys(this.options.indexes),
    );

    if (conditions instanceof LoadAllPartsException) {
      return this.options.allParts;
    }

    const partsToLoad: any[][] = Object.entries(conditions.include).map(
      ([name, values]) => {
        if (values.length === 0) {
          // TODO probably need to return none parts
          throw new Error(`No values for column ${name}`);
        }
        const partsToLoad: string[] = [];
        for (const partName in this.options.indexes[name].index!.parts) {
          const exists = this.options.indexes[name].index!.parts[partName].find(
            (v) => {
              return values.includes(v);
            },
          );
          if (exists) {
            partsToLoad.push(partName);
          }
        }
        return partsToLoad;
      },
    );

    const result = partsToLoad.reduce((a, b) => a.filter((c) => b.includes(c)));
    return [...new Set(result)];
  }
}
