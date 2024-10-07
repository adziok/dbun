import {
  DatabaseMetadata,
  IndexMetadata,
  RootMetadata,
  TableMetadata,
} from './types.ts';

export class DatabaseManager {
  private metadata!: Record<string, DatabaseMetadata>;
  constructor(private readonly pathToData: string) {}

  getMetadataForTable(database: string, table: string): TableMetadata {
    const db = this.metadata[database];
    if (db === undefined) {
      throw new Error(`Database ${database} not found`);
    }
    const metadata = db.tables.find((t) => t.name === table);
    if (metadata === undefined) {
      throw new Error(`Table ${table} not found`);
    }
    return metadata.metadata;
  }

  async loadMetadata() {
    const core = await Bun.file(`${this.pathToData}/schema.json`, {
      type: 'application/json',
    }).json<RootMetadata>();

    const databases = await Promise.all(
      core.databases.map(async (database) => {
        const metadata = await Bun.file(`${this.pathToData}/${database.path}`, {
          type: 'application/json',
        }).json<DatabaseMetadata>();

        metadata.tables = await Promise.all(
          metadata.tables.map(async (table) => {
            const metadata = await Bun.file(
              `${this.pathToData}/${database.name}/${table.path}`,
              { type: 'application/json' },
            ).json<TableMetadata>();

            metadata.columns = Object.fromEntries(
              await Promise.all(
                Object.entries(metadata.columns).map(async ([name, column]) => {
                  if (column.indexPath) {
                    const index = await Bun.file(
                      `${this.pathToData}/${database.name}/${table.name}/${column.indexPath}`,
                      { type: 'application/json' },
                    ).json<IndexMetadata>();

                    return [
                      name,
                      {
                        ...column,
                        index,
                        pathToPartsFolder: `${this.pathToData}/${database.name}/${table.name}/${name}/`,
                      },
                    ];
                  }

                  return [
                    name,
                    {
                      ...column,
                      pathToPartsFolder: `${this.pathToData}/${database.name}/${table.name}/${name}/`,
                    },
                  ];
                }),
              ),
            );

            return {
              ...table,
              metadata,
            };
          }),
        );

        return {
          ...database,
          metadata,
        };
      }),
    );
    this.metadata = Object.fromEntries(
      databases.map((database) => [database.name, database.metadata]),
    );

    return this;
  }
}
