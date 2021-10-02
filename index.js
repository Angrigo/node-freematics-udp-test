const dgram = require('dgram');
const fs = require('fs');
const { nth_index_of, handleLogin } = require('./utils');

const server = dgram.createSocket('udp4');

let requests = 0;

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {

    requests++; // global counter of requests
    console.log(`\n\nserver got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const EV = msg.toString().substring(msg.indexOf("=") + 1, msg.indexOf(","));
    const TS = msg.toString().substring(msg.indexOf("TS=") + 3, nth_index_of(msg, ",", 2));
    if (EV == "1") { // login
        const stringtoSend = handleLogin({ TS, requests });
        server.send(stringtoSend, rinfo.port, rinfo.address)
        return;
    }

    const device = msg.toString().split("#")[0]; // normal authed requests (after login) have device
    if (msg.toString().split("#")[1]) { // if there is data after device
        let data = "\n" + device;
        console.log("device " + device);
        const pairs = msg.toString().split("#")[1].split(",");
        if (pairs.length) pairs.pop();
        for (const i in pairs) {
            const pair = pairs[i].split(":");;
            pairs[i] = pair;
            console.log("pid:" + pair[0] + ", value:" + pair[1]); // show pid and value pair https://freematics.com/pages/hub/freematics-data-logging-format/ (obd-II pids and freematics custom)
            data += "\npid:" + pair[0] + ", value:" + pair[1];
        }
        fs.appendFileSync('data.txt', data, 'utf8');
    }

});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(4000);