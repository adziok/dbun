export type AndWhereStatement = {
  operator: 'AND';
  left: WhereStatement;
  right: WhereStatement;
};

export type OrWhereStatement = {
  operator: 'OR';
  left: WhereStatement;
  right: WhereStatement;
};

export type EqWhereStatement = {
  operator: '=';
  left: WhereReference;
  right: WhereReference;
};

export type NotEqWhereStatement = {
  operator: '!=';
  left: WhereReference;
  right: WhereReference;
};

export type NumberValueReference = {
  type: 'number';
  value: number;
};

export type StringValueReference = {
  type: 'string';
  value: string;
};

export type ColumnReference = {
  columnType: string;
  type: 'column_ref';
  table: string;
  column: string;
};

export type FunctionReference = {
  type: 'function';
  name: {
    name: [
      {
        type: 'default';
        value: string;
      },
    ];
  };
  args: {
    type: 'expr_list';
    value: [
      {
        type: string;
        value: string;
      },
    ];
  };
  over: null;
};

export type WhereReference =
  | NumberValueReference
  | StringValueReference
  | ColumnReference
  | FunctionReference;

export type ExecutableWhereStatement = EqWhereStatement | NotEqWhereStatement;

export type WhereStatement =
  | AndWhereStatement
  | OrWhereStatement
  | EqWhereStatement
  | NotEqWhereStatement;
