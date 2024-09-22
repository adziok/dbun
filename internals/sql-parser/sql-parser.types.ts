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
  type: 'column_ref';
  table: string;
  column: string;
};

export type WhereReference =
  | NumberValueReference
  | StringValueReference
  | ColumnReference;

export type ExecutableWhereStatement = EqWhereStatement | NotEqWhereStatement;

export type WhereStatement =
  | AndWhereStatement
  | OrWhereStatement
  | EqWhereStatement
  | NotEqWhereStatement;
