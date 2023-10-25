const socket = await Bun.connect({
  port: 8088,
  hostname: 'localhost',
  socket: {
    data(socket, data) {
      console.log(data);
    },
    open(socket) {},
    close(socket) {},
    drain(socket) {},
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

socket.write(`
-- Comment
SELECT *, id AS user_id
FROM users
WHERE id = 1 AND name = 'John Doe';
`);
