export type RootMetadata = {
  databases: {
    name: string;
    path: string;
    metadata: DatabaseMetadata;
  }[];
};

export type IndexMetadata = {
  type: string;
  parts: Record<string, (number | string)[]>;
};

export type ColumnMetadata = {
  name: string;
  type: 'string' | 'int';
  indexPath?: string;
  index?: IndexMetadata;
  primary?: boolean;
  pathToPartsFolder: string;
};

export type TableMetadata = {
  tableName: string;
  columns: Record<string, ColumnMetadata>;
  parts: string[];
};

export type DatabaseMetadata = {
  name: string;
  tables: {
    name: string;
    path: string;
    metadata: TableMetadata;
  }[];
};
