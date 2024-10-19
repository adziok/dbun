import { PlanStep } from './base-plan-step.ts';
import { compare } from '../utils.ts';

export class OrderDataPlanStep extends PlanStep {
  constructor(
    public readonly options: {
      // dataPath: string;
      orderBys: {
        expr: {
          type: 'column_ref';
          table: null;
          column: string;
        };
        type: 'DESC' | 'ASC';
      }[];
    },
  ) {
    super();
  }

  describe(): string[] {
    return [
      `OrderByPlanStep:`,
      // `Columns: ${this.options.columns.map((c) => c.name).join(', ')}`,
      // `From: ${this.options.dataPath}`,
      // `Parts: (${this.options.parts.length}/${this.options.totalPartsCount})`, // ${this.options.parts.join(', ')}`,
    ];
  }

  getOrderBy(): (first: any, second: any) => boolean {
    return (first: any, second: any) =>
      this.options.orderBys.some((orderBy) => {
        return compare(
          first[orderBy.expr.column],
          (orderBy.type === 'DESC' && '<') || '>',
          second[orderBy.expr.column],
        );
      });
  }
}
