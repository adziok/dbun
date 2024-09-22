import { WhereStatement } from '../sql-parser/sql-parser.types.ts';

import { PlanStep } from './base-plan-step.ts';
import { compare } from '../utils.ts';

class DynamicConditionBuilder {
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

    if (where.operator === '!=' || where.operator === '=') {
      // TODO add type checks based on table configuration
      return (filteredEntry: any) => {
        const left =
          where.left.type === 'column_ref'
            ? filteredEntry[where.left.column]
            : where.left.value;
        const right =
          where.right.type === 'column_ref'
            ? filteredEntry[where.right.column]
            : where.right.value;
        return compare(left, where.operator, right);
      };
    }

    throw new Error(`Unsupported operator: ${where}`);
  }
}

// TODO should prewhere should be calculated here or in the different plan step? I guess in other place
export class FilterDataPlanStep extends PlanStep {
  private dynamicConditionBuilder = new DynamicConditionBuilder();
  constructor(
    public readonly options: {
      filters: WhereStatement;
    },
  ) {
    super();
  }

  describe(): string[] {
    // TODO parse where statement to human readable string
    return [`FilterDataPlanStep`];
  }

  getFilterConditionForColumn(): ((filteredEntry: any) => boolean) | void {
    return this.dynamicConditionBuilder.buildCondition(this.options.filters);
  }
}
