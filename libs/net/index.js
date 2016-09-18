import net from 'net';

export default class PortManager {
    port;
    constructor(port) {
        this.port = port;
    }

    isInUse(cb) {
        var server = net.createServer(function(socket) {
            socket.write('Echo server\r\n');
            socket.pipe(socket);
        });

        server.listen(this.port, '127.0.0.1');
        server.on('error', function (e) {
            cb(true);
        });
        server.on('listening', function (e) {
            server.close();
            cb(false);
        });
    }
}
