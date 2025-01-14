const socket = await Bun.connect({
  port: 8088,
  hostname: 'localhost',
  socket: {
    data(socket, data) {
      const res = Buffer.from(data).toString();
      const parsedRes = JSON.parse(res);
      console.log(parsedRes);

      process.exit(1);
    },
    open(socket) {
      console.log('open');
      socket.write(`
        -- Comment
        SELECT * FROM rezerwacje WHERE origin = 'CDG' AND oneWay = true LIMIT 10 OFFSET 10 ORDER BY price;
      `);
    },
    close(socket) {
      console.log('close');
    },
    drain(socket) {
      console.log('drain');
    },
    error(socket, error) {
      console.log(error);
    },

    // client-specific handlers
    connectError(socket, error) {
      console.log(error);
    }, // connection failed
    end(socket) {
      console.log('end');
    }, // connection closed by server
    timeout(socket) {
      console.log('timeout');
    }, // connection timed out
  },
});
