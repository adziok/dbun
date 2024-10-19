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

  it('should match string', async () => {
    const parsedQuery = SqlParser.parse(
      `SELECT name FROM users ORDER BY name ASC LIMIT 10 OFFSET 5;`,
      'default',
    );

    const plan = queryPlanner.planQuery(parsedQuery, {
      enablePreWhereStep: false,
    });

    const res = await queryExecutor.execute(plan);

    expect(res).toEqual([
      // { name: '2Adi' },
      // { name: '2Dadi' },
      // { name: '2Koeman' },
      // { name: '2Kosti' },
      // { name: '2Kutor' },
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
      // { name: 'Mosti' },
      // { name: 'Piet' },
      // { name: 'Rutok' },
      // { name: 'Wieman' },
      // { name: 'Wzium' },
    ]);
  });
});
