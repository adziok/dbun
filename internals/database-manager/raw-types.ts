export type RawRootMetadata = {
  databases: {
    name: string;
    path: string;
  }[];
};

export type RawIndexMetadata = {
  type: string;
  parts: Record<string, (number | string)[]>;
};

type RawColumnMetadata = {
  name: string;
  type: 'string' | 'int';
  indexPath?: string;
  primary?: boolean;
  pathToPartsFolder: string;
};

export type RawTableMetadata = {
  tableName: string;
  parts: string[];
};

export type RawDatabaseMetadata = {
  name: string;
  tables: {
    name: string;
    path: string;
  }[];
};
