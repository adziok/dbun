import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { DatabaseManager } from '../internals/database-manager/database-manager.ts';
import { QueryPlanner } from '../internals/query-planner.ts';
import { QueryExecutor } from '../internals/query-executor.ts';
import { SqlParser } from '../internals/sql-parser/sql-parser.ts';
import { join } from 'path/posix';

describe('ORDER BY', () => {
  let databaseManager: DatabaseManager;
  let queryExecutor: QueryExecutor;

  beforeAll(async () => {
    databaseManager = await new DatabaseManager(
      join(import.meta.dir, './test_data'),
    ).loadMetadata();
    queryExecutor = new QueryExecutor();
  });

  let queryPlanner: QueryPlanner;
  beforeEach(() => {
    queryPlanner = new QueryPlanner(databaseManager);
  });

  it('should order by name', async () => {
    const parsedQuery = SqlParser.parse(
      `SELECT name FROM users ORDER BY name ASC;`,
      'default',
    );

    const plan = queryPlanner.planQuery(parsedQuery, {
      enablePreWhereStep: false,
    });

    const res = await queryExecutor.execute(plan);

    expect(res).toEqual([
      { name: '2Adi' },
      { name: '2Dadi' },
      { name: '2Koeman' },
      { name: '2Kosti' },
      { name: '2Kutor' },
      { name: '2Mosti' },
      { name: '2Piet' },
      { name: '2Rutok' },
      { name: '2Wieman' },
      { name: '2Wzium' },
      { name: 'Adi' },
      { name: 'Dadi' },
      { name: 'Koeman' },
      { name: 'Kosti' },
      { name: 'Kutor' },
      { name: 'Mosti' },
      { name: 'Piet' },
      { name: 'Rutok' },
      { name: 'Wieman' },
      { name: 'Wzium' },
    ]);
  });

  it('should order by company and id', async () => {
    const parsedQuery = SqlParser.parse(
      `SELECT company, id FROM users ORDER BY company ASC, id DESC;`,
      'default',
    );

    const plan = queryPlanner.planQuery(parsedQuery, {
      enablePreWhereStep: false,
    });

    const res = await queryExecutor.execute(plan);

    expect(res).toEqual([
      {
        company: '1',
        id: '5',
      },
      {
        company: '1',
        id: '4',
      },
      {
        company: '1',
        id: '2',
      },
      {
        company: '1',
        id: '1',
      },
      {
        company: '2',
        id: '9',
      },
      {
        company: '2',
        id: '8',
      },
      {
        company: '2',
        id: '7',
      },
      {
        company: '2',
        id: '6',
      },
      {
        company: '2',
        id: '3',
      },
      {
        company: '3',
        id: '15',
      },
      {
        company: '3',
        id: '14',
      },
      {
        company: '3',
        id: '13',
      },
      {
        company: '3',
        id: '12',
      },
      {
        company: '3',
        id: '11',
      },
      {
        company: '3',
        id: '10',
      },
      {
        company: '4',
        id: '20',
      },
      {
        company: '4',
        id: '19',
      },
      {
        company: '4',
        id: '18',
      },
      {
        company: '4',
        id: '17',
      },
      {
        company: '4',
        id: '16',
      },
    ]);
  });
});
