import { faker } from '@faker-js/faker/locale/en';
import { RawDatabaseMetadata } from '../internals/database-manager/raw-types.ts';
import { onlyUnique } from '../internals/utils.ts';

const configuration = {
  parts: 20000,
  recordsPerPart: 1000,
  db: 'default',
  tables: [
    {
      tableName: 'firmy',
      columns: {
        id: {
          type: 'int',
          // primary: true,
          factory: (index: number) => index + 1,
        },
        name: {
          type: 'string',
          primary: true,
          factory: (index: number) => faker.company.name(),
        },
        numberOfEmployers: {
          type: 'int',
          factory: (index: number) =>
            faker.number.int({
              min: 50,
              max: 1000,
            }),
        },
        revenue: {
          type: 'int',
          factory: (index: number) =>
            faker.number.int({
              min: 1000000,
              max: 1000000000,
            }),
        },
        city: {
          type: 'string',
          primary: true,
          factory: (index: number) => faker.location.city(),
        },
      },
    },
  ],
};

const generateDBWithData = async () => {
  const basePath = `./data/${configuration.db}`;

  const existingRawDB: RawDatabaseMetadata | undefined = JSON.parse(
    await Bun.file(`${basePath}/schema.json`).text(),
  );

  if (!existingRawDB) {
    const rawDB: RawDatabaseMetadata = {
      name: configuration.db,
      tables: configuration.tables.map((table) => {
        return {
          name: table.tableName,
          path: `./${table.tableName}/schema.json`,
        };
      }),
    };

    await Bun.write(
      `${basePath}/schema.json`,
      JSON.stringify(rawDB, null, 2),
    ).then(() => console.log('DB schema generated'));
  } else {
    const overridesTables = existingRawDB.tables.filter((table) => {
      return !configuration.tables.some((t) => t.tableName === table.name);
    });
    overridesTables.push(
      ...configuration.tables.map((table) => {
        return {
          name: table.tableName,
          path: `./${table.tableName}/schema.json`,
        };
      }),
    );
    const rawDB: RawDatabaseMetadata = {
      name: configuration.db,
      tables: overridesTables,
    };

    await Bun.write(
      `${basePath}/schema.json`,
      JSON.stringify(rawDB, null, 2),
    ).then(() => console.log('DB schema generated'));
  }

  const partsIds = new Array(configuration.parts)
    .fill(0)
    .map((_, index) => index + 1);

  const tables = configuration.tables.map((table) => {
    return {
      tableName: table.tableName,
      columns: Object.fromEntries(
        Object.entries(table.columns).map(([columnName, column]) => {
          if (column?.primary) {
            return [
              columnName,
              {
                type: column.type,
                primary: true,
                indexPath: `./${columnName}/index.json`,
              },
            ];
          }
          return [
            columnName,
            {
              name: columnName,
              type: column.type,
            },
          ];
        }),
      ),
      parts: partsIds,
    };
  });

  await Promise.all(
    tables.map((table) =>
      Bun.write(
        `${basePath}/${table.tableName}/schema.json`,
        JSON.stringify(table, null, 2),
      ),
    ),
  );

  // // TODO sort generated values based on values
  // // TODO generate indexes for each part
  for await (const table of configuration.tables) {
    let generatedParts = 1;
    let generatedData: [number, Record<string, any[]>][] = [];
    while (generatedParts <= configuration.parts) {
      const partData = Object.fromEntries(
        Object.entries(table.columns).map(([columnName, column]) => {
          return [
            columnName,
            new Array(configuration.recordsPerPart).fill(0).map((_, index) => {
              return column.factory(index);
            }),
          ];
        }),
      );
      generatedData.push([generatedParts, partData]);
      generatedParts++;
    }

    const indexes: Record<string, Record<string, any[]>> = {};

    await Promise.all(
      generatedData.map(async ([part, data]) => {
        const columnsNames = Object.keys(data);

        await Promise.all(
          columnsNames.map(async (columnName: any) => {
            const columnData = data[columnName];
            if ((table.columns as any)[columnName]!.primary) {
              if (!indexes[columnName]) {
                indexes[columnName] = {};
              }
              indexes[columnName][part] = columnData.filter(onlyUnique);
            }
            // const sortedData = columnData.sort();

            await Bun.write(
              `${basePath}/${table.tableName}/${columnName}/${part}.txt`,
              columnData.join('\n'),
            );
            // if ((table.columns as any)[columnName].primary) {
            //   const sortedData = columnData.sort();
            //   const data =
            //   await Bun.write(
            //     `${basePath}/${table.tableName}/${columnName}/index.json`,
            //     JSON.stringify(sortedData, null, 2),
            //   );
            // }
          }),
        );
      }),
    );

    await Promise.all(
      Object.keys(indexes).map(async (columnName) => {
        const parts = indexes[columnName];
        const dataToSave = {
          type: 'int',
          parts: parts,
        };
        await Bun.write(
          `${basePath}/${table.tableName}/${columnName}/index.json`,
          JSON.stringify(dataToSave, null, 2),
        );
      }),
    );
  }

  // const indexes = configuration.tables.map((table) => {
  //   return {
  //     tableName: table.tableName,
  //     columns: Object.fromEntries(
  //       Object.entries(table.columns).map(([columnName, column]) => {
  //         if (column?.primary) {
  //           return [
  //             columnName,
  //             {
  //               type: column.type,
  //               primary: true,
  //               indexPath: `./${columnName}/index.json`,
  //             },
  //           ];
  //         }
  //         return [
  //           columnName,
  //           {
  //             name: columnName,
  //             type: column.type,
  //           },
  //         ];
  //       }),
  //     ),
  //     parts: new Array(
  //       Math.floor(
  //         configuration.numberOfRecords / configuration.recordsPerPart,
  //       ),
  //     )
  //       .fill(0)
  //       .map((_, index) => index),
  //   };
  // });
};

generateDBWithData()
  .then(() => {
    console.log('Done');
  })
  .catch((error) => {
    console.error(error);
  });
