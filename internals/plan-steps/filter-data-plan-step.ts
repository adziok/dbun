import {
  EqWhereStatement,
  NotEqWhereStatement,
  WhereReference,
  WhereStatement,
} from '../sql-parser/sql-parser.types.ts';

import { PlanStep } from './base-plan-step.ts';
import { compareInt, getCompareFunction } from '../utils.ts';
import { DatabaseManager } from '../database-manager/database-manager.ts';
import { getDateTypeClass } from '../data-types/get-date-type-class.ts';

class DynamicConditionBuilder {
  constructor(private databaseManager: DatabaseManager) {}

  buildCondition(where: WhereStatement): (columnValue: unknown) => boolean {
    if (where.operator === 'AND') {
      const left = this.buildCondition(where.left);
      const right = this.buildCondition(where.right);

      return (filteredEntry: unknown) => {
        return left(filteredEntry) && right(filteredEntry);
      };
    }

    if (where.operator === 'OR') {
      const left = this.buildCondition(where.left);
      const right = this.buildCondition(where.right);

      return (filteredEntry: unknown) => {
        return left(filteredEntry) || right(filteredEntry);
      };
    }

    const leftType = this.getTypeFromWhereReference(where.left);
    const rightType = this.getTypeFromWhereReference(where.right);
    if (
      !getDateTypeClass(leftType).canBeComparedWith(getDateTypeClass(rightType))
    ) {
      throw new Error(
        `Cannot compare these types: [${leftType}] and [${rightType}]`,
      );
    }
    // TODO add type checks based on table configuration

    return (filteredEntry: any) => {
      const left = this.extractValueToCompare(where.left, filteredEntry);
      const right = this.extractValueToCompare(where.right, filteredEntry);
      //   where.left.type === 'column_ref'
      //     ? filteredEntry[where.left.column]
      //     : where.left.value;
      // const right =
      //   where.right.type === 'column_ref'
      //     ? filteredEntry[where.right.column]
      //     : where.right.value;

      const compareFn = getCompareFunction(leftType);
      return compareFn(left, where.operator, right);
    };
  }

  private extractValueToCompare(
    whereReference: WhereReference,
    filteredEntry: any,
  ): any {
    if (whereReference.type === 'column_ref') {
      return filteredEntry[whereReference.column];
    }
    if (whereReference.type === 'function') {
      // TODO add factory
      return new Date(whereReference.args.value[0].value);
    }
    return whereReference.value;
  }

  private getTypeFromWhereReference(whereReference: any): string {
    if (whereReference.type === 'column_ref') {
      return this.databaseManager.getMetadataForTable(
        'default',
        whereReference.table,
      ).columns[whereReference.column].type;
    }
    if (whereReference.type === 'number') {
      return 'number';
    }
    if (whereReference.type === 'string') {
      return 'string';
    }
    if (whereReference.type === 'bool') {
      return 'boolean';
    }
    if (whereReference.type === 'single_quote_string') {
      return 'string';
    }
    if (whereReference.type === 'function') {
      return 'timestamp';
    }
    throw new Error(`Unsupported type: ${whereReference.type}`);
  }
}

// TODO should prewhere should be calculated here or in the different plan step? I guess in other place
export class FilterDataPlanStep extends PlanStep {
  private dynamicConditionBuilder: DynamicConditionBuilder;
  constructor(
    public readonly options: {
      filters: WhereStatement;
    },
    public readonly databaseManager: DatabaseManager,
  ) {
    super();
    this.dynamicConditionBuilder = new DynamicConditionBuilder(databaseManager);
  }

  describe(): string[] {
    // TODO parse where statement to human readable string
    return [`FilterDataPlanStep`];
  }

  getFilterConditionForColumn(): ((filteredEntry: any) => boolean) | void {
    return this.dynamicConditionBuilder.buildCondition(this.options.filters);
  }
}
