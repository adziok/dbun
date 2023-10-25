type RootMetadata = {
  databases: {
    name: string;
    path: string;
    metadata: DatabaseMetadata;
  }[]
}

type IndexMetadata = {
  "type": string,
  "parts": Record<string, number>
}

type ColumnMetadata = {
  type: 'string' | 'int';
  indexPath?: string;
  index?: IndexMetadata
  primary?: boolean;
}

type TableMetadata = {
  "tableName": string,
  indexes: Record<string,IndexMetadata>
  "columns": ColumnMetadata[]
}

type DatabaseMetadata = {
  name: string;
  tables: {
    name: string;
    path: string;
    metadata: TableMetadata;
  }[]
}
export class DatabaseManager {
  private metadata!: Record<string, DatabaseMetadata>;
  constructor(private readonly pathToData: string) {
    this.loadMetadata();
  }

  getMetadataForTable(database: string, table: string): TableMetadata {
    const db= this.metadata[database];
    if (db === undefined) {
      throw new Error(`Database ${database} not found`);
    }
    const metadata = db.tables.find((t) => t.name === table);
    if (metadata === undefined) {
      throw new Error(`Table ${table} not found`);
    }
    return metadata.metadata;
  }

  private async loadMetadata() {
    const core = await Bun.file(this.pathToData+"/schema.json", { type: "application/json" }).json() as unknown as RootMetadata;
    const databases = await this.paresDatabases()
    this.metadata = Object.fromEntries(databases.map((database) => [database.name,database.metadata]));
  }

  private async paresDatabases(core: RootMetadata): Promise<DatabaseMetadata[]> {
    return Promise.all(core.databases.map(async (database) => {
      const metadata = await Bun.file(this.pathToData + '/' +database.path, { type: "application/json" }).json() as unknown as DatabaseMetadata;
      metadata.tables = await Promise.all(metadata.tables.map(async (table) => {
        const metadata = await Bun.file(this.pathToData +'/'+ database.name +'/' +table.path, { type: "application/json" }).json() as unknown as TableMetadata;
        metadata.columns = Object.fromEntries(await Promise.all(Object.entries(metadata.columns).map(async ([name,column]) => {
          if (column.indexPath) {
            const index = await Bun.file(this.pathToData +'/'+ database.name +'/'+ table.name +'/' +column.indexPath, { type: "application/json" }).json() as unknown as IndexMetadata
            return [name,{
              ...column,
              index
            }];
          }
          return [name,column];
        })))
        return {
          ...table,
          metadata
        };
      }))
      return {
        ...database,
        metadata
      };
    }))

  }
}