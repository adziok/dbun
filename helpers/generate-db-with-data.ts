import { faker } from '@faker-js/faker/locale/en';
import { RawDatabaseMetadata } from '../internals/database-manager/raw-types.ts';
import { onlyUnique } from '../internals/utils.ts';

// const originIataCode = ['LHR', 'CDG', 'ABV', 'JHS'];
// const destinationIataCode = ['JFK', 'LAX', 'AEG', 'FGA'];
const originIataCode = [
  'ATL',
  'PEK',
  'LHR',
  'ORD',
  'HND',
  'LAX',
  'CDG',
  'DFW',
  'AMS',
  'FRA',
  'CAN',
  'DEL',
  'IST',
  'JFK',
  'SIN',
  'DEN',
  'BKK',
  'SFO',
  'KUL',
  'LAS',
  'BCN',
  'MUC',
  'MEX',
  'SYD',
  'ICN',
  'YYZ',
  'GRU',
  'MAD',
  'CGK',
  'SVO',
  'FCO',
  'EZE',
  'ZRH',
  'BOM',
  'SEA',
  'MNL',
  'DME',
  'DOH',
  'OSL',
  'LIS',
  'ARN',
  'HKG',
  'VIE',
  'BOS',
  'GVA',
  'CPH',
  'HEL',
  'BRU',
  'STN',
  'LGW',
  'LTN',
  'LGA',
  'PHX',
  'IAD',
  'DCA',
  'SAN',
  'TPA',
  'CLT',
  'MIA',
  'MCO',
  'MSP',
  'DTW',
  'SLC',
  'PDX',
  'HNL',
  'AUS',
  'ATL2',
  'RDU',
  'PHL',
  'BWI',
  'OAK',
  'MDW',
  'DAL',
  'HOU',
  'SAT',
  'IND',
  'CMH',
  'CVG',
  'PIT',
  'BNA',
  'STL',
  'MKE',
  'JAX',
  'RSW',
  'BUF',
  'RNO',
  'ONT',
  'SJC',
  'SMF',
  'TUS',
  'OKC',
  'OMA',
  'CHS',
  'RIC',
  'PBI',
  'BOI',
  'ABQ',
  'MEM',
  'ANC',
  'DAY',
  'GSO',
  'LIT',
  'SDF',
  'MSY',
  'TUL',
  'BUR',
  'SNA',
  'KOA',
  'LIH',
  'OGG',
  'BZN',
  'GJT',
  'EUG',
  'GEG',
  'PSC',
  'FAT',
  'BOZ',
  'SAV',
  'HSV',
  'GPT',
  'XNA',
  'FNT',
  'MLI',
  'CID',
  'EVV',
  'MOB',
  'LBB',
  'AMA',
  'ELP',
  'FAR',
  'BIS',
  'GRR',
  'TVC',
  'MSN',
  'FWA',
  'GSP',
  'AVL',
  'MYR',
  'ECP',
  'TLH',
  'BHM',
  'MGM',
  'CSG',
  'LFT',
  'SGF',
  'ROA',
  'TRI',
  'BTV',
  'PWM',
  'ALB',
  'SYR',
  'ROC',
  'ISP',
  'BDL',
  'PVD',
  'JAC',
  'YVR',
  'YYC',
  'YEG',
  'YUL',
  'YOW',
  'YHZ',
  'YQR',
  'YXE',
  'YWG',
  'YQB',
  'YLW',
  'YXX',
  'YYJ',
  'YZF',
  'YYT',
  'ZIH',
  'ACA',
  'CUN',
  'GDL',
  'MTY',
  'QRO',
  'SJD',
  'TIJ',
  'VER',
  'ZLO',
];

const destinationIataCode = [
  'GIG',
  'BSB',
  'CWB',
  'POA',
  'SSA',
  'REC',
  'FOR',
  'BEL',
  'CNF',
  'VCP',
  'MAO',
  'NAT',
  'MCZ',
  'SDU',
  'CGB',
  'IGU',
  'FLN',
  'GYN',
  'CGH',
  'AJU',
  'CXJ',
  'JPA',
  'MCP',
  'JOI',
  'PFB',
  'THE',
  'UBT',
  'XAP',
  'PPB',
  'VDC',
  'MAB',
  'BVB',
  'JJD',
  'UNA',
  'IZA',
  'TFF',
  'PPG',
  'SBF',
  'TUC',
  'USH',
  'AEP',
  'ROS',
  'MDZ',
  'COR',
  'SLA',
  'BRC',
  'NQN',
  'TUC2',
  'ASU',
  'SCL',
  'CCP',
  'PUQ',
  'IPC',
  'IQQ',
  'CJC',
  'ZCO',
  'PMC',
  'BBA',
  'MVD',
  'PDP',
  'BOG',
  'MDE',
  'CLO',
  'BAQ',
  'CTG',
  'PEI',
  'BGA',
  'CUC',
  'SMR',
  'VVC',
  'LET',
  'EYP',
  'PVA',
  'UIB',
  'LPB',
  'VVI',
  'CBB',
  'SRE',
  'TJA',
  'ORU',
  'POI',
  'CIJ',
  'GYA',
  'RIB',
  'TDD',
  'PCL',
  'CUZ',
  'AQP',
  'TCQ',
  'IQT',
  'JUL',
  'PIU',
  'TBP',
  'TRU',
  'HUU',
  'CHM',
  'CIX',
  'PPE',
  'AZP',
  'BJX',
  'CUU',
  'HMO',
  'LAP',
  'MID',
  'MLM',
  'NLD',
  'OAX',
  'PAZ',
  'PBC',
  'PXM',
  'QRO2',
  'REX',
  'SLP',
  'TAM',
  'UPN',
  'ZCL',
  'MZT',
  'ACA2',
  'LMM',
  'CSL',
  'HUX',
  'GUA',
  'SAP',
  'RTB',
  'BZE',
  'TGU',
  'XPL',
  'MGA',
  'SAL',
  'TIK',
  'PTY',
  'PAC',
  'DAV',
  'BOC',
  'CTD',
  'FON',
  'LIO',
  'PMZ',
  'TNO',
  'XQP',
  'BQN',
  'SJU',
  'PSE',
  'MAZ',
  'STT',
  'STX',
  'EIS',
  'ANU',
  'BGI',
  'POS',
  'TAB',
  'UVF',
  'SLU',
  'SXM',
  'SAB',
  'EUX',
  'BON',
  'CUR',
  'AUA',
  'PBM',
  'GND',
  'GEO',
  'SDQ',
  'PUJ',
  'STI',
  'POP',
  'AZS',
  'CAP',
  'BVC',
  'RAI',
];

const configuration = {
  parts: 20000,
  recordsPerPart: 500,
  db: 'default',
  tables: [
    {
      tableName: 'rezerwacje2',
      columns: {
        origin: {
          type: 'string',
          primary: true,
          factory: () => faker.helpers.arrayElement(originIataCode),
        },
        destination: {
          type: 'string',
          primary: true,
          factory: () => faker.helpers.arrayElement(destinationIataCode),
        },
        price: {
          type: 'int',
          factory: () =>
            faker.number.int({
              min: 500,
              max: 1000,
            }),
        },
        pax: {
          type: 'int',
          factory: () => faker.helpers.arrayElement([1, 2, 3, 1, 1]),
        },
        departureDate: {
          type: 'timestamp',
          factory: () =>
            faker.date.soon({
              days: 30,
            }),
        },
        issueDate: {
          type: 'timestamp',
          factory: () =>
            faker.date.recent({
              days: 60,
            }),
        },
        oneWay: {
          type: 'boolean',
          factory: () => faker.number.int({ min: 0, max: 1 }),
        },
        discount: {
          type: 'int',
          factory: () =>
            faker.number.int({
              min: 50,
              max: 150,
            }),
        },
        bookingClass: {
          type: 'string',
          factory: () => faker.helpers.arrayElement(['A', 'B', 'C', 'E']),
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

    let generatedDataObj: Record<string, any>[] = [];
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
      const columns = Object.keys(partData);
      generatedDataObj.push([
        Object.values(partData[columns[0]]).map((_, index) => {
          return columns.reduce((acc, columnName) => {
            acc[columnName] = partData[columnName][index];
            return acc;
          }, {});
        }),
      ]);
      generatedParts++;
    }
    // console.log(generatedDataObj.flat().flat());
    const sorted = generatedDataObj
      .flat()
      .flat()
      .sort(
        (a, b) =>
          a.origin.localeCompare(b.origin) ||
          a.destination.localeCompare(b.destination) ||
          a.bookingClass.localeCompare(b.bookingClass),
      );
    // console.log(sorted);

    const indexes: Record<string, Record<string, any[]>> = {};

    await Promise.all(
      partition(sorted, configuration.recordsPerPart).map(
        async (data, part) => {
          const columnsNames = Object.keys(data[0]);
          const groupedData = columnsNames.reduce((acc, columnName) => {
            acc[columnName] = data.map((d) => d[columnName]);
            return acc;
          }, {});

          await Promise.all(
            columnsNames.map(async (columnName: any) => {
              const columnData = groupedData[columnName];
              if ((table.columns as any)[columnName]!.primary) {
                if (!indexes[columnName]) {
                  indexes[columnName] = {};
                }
                indexes[columnName][part + 1] = columnData.filter(onlyUnique);
              }

              await Bun.write(
                `${basePath}/${table.tableName}/${columnName}/${part + 1}.txt`,
                columnData.join('\n'),
              );
            }),
          );
        },
      ),
    );

    // await Promise.all(
    //   generatedData.map(async ([part, data]) => {
    //     const columnsNames = Object.keys(data);
    //
    //     await Promise.all(
    //       columnsNames.map(async (columnName: any) => {
    //         const columnData = data[columnName];
    //         if ((table.columns as any)[columnName]!.primary) {
    //           if (!indexes[columnName]) {
    //             indexes[columnName] = {};
    //           }
    //           indexes[columnName][part] = columnData.filter(onlyUnique);
    //         }
    //
    //         await Bun.write(
    //           `${basePath}/${table.tableName}/${columnName}/${part}.txt`,
    //           columnData.join('\n'),
    //         );
    //       }),
    //     );
    //   }),
    // );

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
};

generateDBWithData()
  .then(() => {
    console.log('Done');
  })
  .catch((error) => {
    console.error(error);
  });

function partition<Y extends any>(array: Y[], n: number): Y[][] {
  return array.length ? [array.splice(0, n)].concat(partition(array, n)) : [];
}
