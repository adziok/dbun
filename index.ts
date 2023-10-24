import {Socket} from "bun";
import {SqlParser} from "./internals/sql-parser.ts";
import {DatabaseManager} from './internals/database-manager.ts';
import {QueryExecutor} from "./internals/query-executor.ts";

type SocketData = { sessionId: string };

const server = Bun.listen<SocketData>({
  hostname: "localhost",
  port: 8088,
  data: {sessionId: "abcd"},
  socket: {
    end(socket: Socket<SocketData>): void | Promise<void> {
      console.log("end");
    },
    close(socket: Socket<SocketData>): void | Promise<void> {
      console.log("close");
    },
    drain(socket: Socket<SocketData>): void | Promise<void> {
      console.log("drain");
    },
    timeout(socket: Socket<SocketData>): void | Promise<void> {
      console.log("timeout");
    },
    data(socket, data) {
      const query = Buffer.from(data).toString();
      const d = SqlParser.parse(query);
      console.log(d);
      socket.write(`${socket.data.sessionId}: ack`);
    },
    open(socket) {
      console.log("open");
      socket.data = { sessionId: "abcd" };
      socket.write('USERS')
    },
    handshake(socket: Socket<SocketData>, success: boolean, authorizationError: Error | null) {
      console.log("handshake", success, authorizationError);
    },
    connectError(socket: Socket<SocketData>, error: Error): void | Promise<void> {
      console.log("connectError", error);
    },
    error(socket: Socket<SocketData>, error: Error): void | Promise<void> {
      console.log("error", error);
    }
  },
});

const databaseManager = new DatabaseManager("./data");
setTimeout(() => {
    console.log(databaseManager);
    const queryExecutor = new QueryExecutor(databaseManager);
    const plan = queryExecutor.plan('default', {
        columns: ['id', 'name'],
        table: 'users',
        where: {
          company: '1'
        }
    });

    console.log(plan);
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