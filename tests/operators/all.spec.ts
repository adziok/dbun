import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { DatabaseManager } from '../../internals/database-manager/database-manager.ts';
import { QueryPlanner } from '../../internals/query-planner.ts';
import { QueryExecutor } from '../../internals/query-executor.ts';
import { SqlParser } from '../../internals/sql-parser/sql-parser.ts';
import { join } from 'path/posix';

// All operators test, in feature should be split into smaller ones
describe('Operators', () => {
  let databaseManager: DatabaseManager;
  let queryExecutor: QueryExecutor;
  beforeAll(async () => {
    databaseManager = await new DatabaseManager(
      join(import.meta.dir, '../test_data'),
    ).loadMetadata();
    queryExecutor = new QueryExecutor();
  });

  let queryPlanner: QueryPlanner;
  beforeEach(() => {
    queryPlanner = new QueryPlanner(databaseManager);
  });

  describe('equal (=)', () => {
    it('should match string', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE name = 'Adi';`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([{ name: 'Adi' }]);
    });

    it('should match int', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company = 1;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([
        // TODO should be a number
        { name: 'Adi', company: '1' },
        { name: 'Dadi', company: '1' },
        { name: 'Mosti', company: '1' },
        { name: 'Kutor', company: '1' },
      ]);
    });

    it('should match int and string combined', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company = 1 AND name = "Adi";`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([
        // TODO should be a number
        { name: 'Adi', company: '1' },
      ]);
    });
  });

  describe('not equal (!=)', () => {
    it('should match string different than', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE name != 'Adi';`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).not.toContain({ name: 'Adi' });
    });

    it('should match int different than', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company = 1;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).not.toContain([
        // TODO should be a number
        { name: 'Adi', company: '1' },
        { name: 'Dadi', company: '1' },
        { name: 'Mosti', company: '1' },
        { name: 'Kutor', company: '1' },
      ]);
    });
  });

  describe('greater (>)', () => {
    it('should match int greater than 3', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company > 3;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([
        {
          name: '2Rutok',
          company: '4',
        },
        {
          name: '2Wieman',
          company: '4',
        },
        {
          name: '2Koeman',
          company: '4',
        },
        {
          name: '2Piet',
          company: '4',
        },
        {
          name: '2Wzium',
          company: '4',
        },
      ]);
    });

    it.each([['String', 'company']])(
      'should throw when trying to compare type: %s',
      async (type, column) => {
        const parsedQuery = SqlParser.parse(
          `SELECT name FROM users WHERE ${column} > 1;`,
          'default',
        );

        const plan = queryPlanner.planQuery(parsedQuery, {
          enablePreWhereStep: false,
        });

        expect(() => queryExecutor.execute(plan)).rejects.toThrow();
      },
    );
  });

  describe('greater or equal (>=)', () => {
    it('should match int greater or equal than 3', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company >= 3;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).not.toContain([
        {
          name: 'Wzium',
          company: '3',
        },
        {
          name: '2Adi',
          company: '3',
        },
        {
          name: '2Dadi',
          company: '3',
        },
        {
          name: '2Kosti',
          company: '3',
        },
        {
          name: '2Mosti',
          company: '3',
        },
        {
          name: '2Kutor',
          company: '3',
        },
        {
          name: '2Rutok',
          company: '4',
        },
        {
          name: '2Wieman',
          company: '4',
        },
        {
          name: '2Koeman',
          company: '4',
        },
        {
          name: '2Piet',
          company: '4',
        },
        {
          name: '2Wzium',
          company: '4',
        },
      ]);
    });

    it.each([['String', 'company']])(
      'should throw when trying to compare type: %s',
      async (type, column) => {
        const parsedQuery = SqlParser.parse(
          `SELECT name FROM users WHERE ${column} >= 1;`,
          'default',
        );

        const plan = queryPlanner.planQuery(parsedQuery, {
          enablePreWhereStep: false,
        });

        expect(() => queryExecutor.execute(plan)).rejects.toThrow();
      },
    );
  });

  describe('smaller (<)', () => {
    it('should match int smaller than 2', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company < 2;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([
        {
          name: 'Adi',
          company: '1',
        },
        {
          name: 'Dadi',
          company: '1',
        },
        {
          name: 'Mosti',
          company: '1',
        },
        {
          name: 'Kutor',
          company: '1',
        },
      ]);
    });

    it.each([['String', 'company']])(
      'should throw when trying to compare type: %s',
      async (type, column) => {
        const parsedQuery = SqlParser.parse(
          `SELECT name FROM users WHERE ${column} < 1;`,
          'default',
        );

        const plan = queryPlanner.planQuery(parsedQuery, {
          enablePreWhereStep: false,
        });

        expect(() => queryExecutor.execute(plan)).rejects.toThrow();
      },
    );
  });

  describe('smaller or equal (>=)', () => {
    it('should match int smaller or equal than 2', async () => {
      const parsedQuery = SqlParser.parse(
        `SELECT name FROM users WHERE company <= 2;`,
        'default',
      );

      const plan = queryPlanner.planQuery(parsedQuery, {
        enablePreWhereStep: false,
      });

      const res = await queryExecutor.execute(plan);

      expect(res).toEqual([
        {
          name: 'Adi',
          company: '1',
        },
        {
          name: 'Dadi',
          company: '1',
        },
        {
          name: 'Kosti',
          company: '2',
        },
        {
          name: 'Mosti',
          company: '1',
        },
        {
          name: 'Kutor',
          company: '1',
        },
        {
          name: 'Rutok',
          company: '2',
        },
        {
          name: 'Wieman',
          company: '2',
        },
        {
          name: 'Koeman',
          company: '2',
        },
        {
          name: 'Piet',
          company: '2',
        },
      ]);
    });

    it.each([['String', 'company']])(
      'should throw when trying to compare type: %s',
      async (type, column) => {
        const parsedQuery = SqlParser.parse(
          `SELECT name FROM users WHERE ${column} >= 1;`,
          'default',
        );

        const plan = queryPlanner.planQuery(parsedQuery, {
          enablePreWhereStep: false,
        });

        await expect(() => queryExecutor.execute(plan)).rejects.toThrow();
      },
    );
  });
});
