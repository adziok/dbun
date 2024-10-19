import { Socket } from 'bun';
import { SqlParser } from './internals/sql-parser/sql-parser.ts';
import { DatabaseManager } from './internals/database-manager/database-manager.ts';
import { QueryExecutor } from './internals/query-executor.ts';
import { QueryPlanner } from './internals/query-planner.ts';
import { FilterDataPlanStep } from './internals/plan-steps/filter-data-plan-step.ts';
import { OrderDataPlanStep } from './internals/plan-steps/order-data-plan-step.ts';

type SocketData = { sessionId: string };

const server = Bun.listen<SocketData>({
  hostname: 'localhost',
  port: 8088,
  data: { sessionId: 'abcd' },
  socket: {
    end(socket: Socket<SocketData>): void | Promise<void> {
      console.log('end');
    },
    close(socket: Socket<SocketData>): void | Promise<void> {
      console.log('close');
    },
    drain(socket: Socket<SocketData>): void | Promise<void> {
      console.log('drain');
    },
    timeout(socket: Socket<SocketData>): void | Promise<void> {
      console.log('timeout');
    },
    data(socket, data) {
      const query = Buffer.from(data).toString();
      const d = SqlParser.parse(query, 'default');
      console.log(d);
      socket.write(`${socket.data.sessionId}: ack`);
    },
    open(socket) {
      console.log('open');
      socket.data = { sessionId: 'abcd' };
      socket.write('USERS');
    },
    handshake(
      socket: Socket<SocketData>,
      success: boolean,
      authorizationError: Error | null,
    ) {
      console.log('handshake', success, authorizationError);
    },
    connectError(
      socket: Socket<SocketData>,
      error: Error,
    ): void | Promise<void> {
      console.log('connectError', error);
    },
    error(socket: Socket<SocketData>, error: Error): void | Promise<void> {
      console.log('error', error);
    },
  },
});

const databaseManager = await new DatabaseManager('./data').loadMetadata();
setTimeout(async () => {
  // const parsedQuery = SqlParser.parse(
  //   `SELECT name FROM users ORDER BY name DESC;`,
  //   'default',
  // );

  const parsedQuery = SqlParser.parse(
    `SELECT * FROM companies WHERE name = 'Bashirian LLC' ORDER BY id ASC LIMIT 10 OFFSET 10;`,
    'default',
  );
  // const parsedQuery = SqlParser.parse(`SELECT * FROM tickets;`, 'default');
  const queryPlanner = new QueryPlanner(databaseManager);
  const queryExecutor = new QueryExecutor();

  const plan = queryPlanner.planQuery(parsedQuery, {
    enablePreWhereStep: true,
  });

  console.log(queryExecutor.describePlan(plan));
  console.time('execute');
  const res = await queryExecutor.execute(plan);
  console.log(res);
  console.timeEnd('execute');
  process.exit(1);
}, 1000);
//
// server.reload({
//   socket: {
//     data(socket, data){
//       console.log(data);
//       // new 'data' handler
//     }
//   }
// })
// server.stop()
