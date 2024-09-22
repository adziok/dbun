import { Socket } from 'bun';
import { SqlParser } from './internals/sql-parser/sql-parser.ts';
import { DatabaseManager } from './internals/database-manager.ts';
import { QueryExecutor } from './internals/query-executor.ts';
import { QueryPlanner } from './internals/query-planner.ts';
import { FilterDataPlanStep } from './internals/plan-steps/filter-data-plan-step.ts';

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

const databaseManager = new DatabaseManager('./data');
setTimeout(async () => {
  const parsedQuery = SqlParser.parse(
    `SELECT name, id FROM users WHERE company = 1 AND (name = "Adi" OR name = "Mosti");`,
    'default',
  );
  const queryPlanner = new QueryPlanner(databaseManager);
  const queryExecutor = new QueryExecutor();

  const plan = queryPlanner.planQuery(parsedQuery);
  plan.setNextStep(
    new FilterDataPlanStep({
      filters: parsedQuery.where,
    }),
  );

  console.log(queryExecutor.describePlan(plan));
  const res = await queryExecutor.execute(plan);
  console.log(res);
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
