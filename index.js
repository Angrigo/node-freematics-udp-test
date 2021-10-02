/* const express = require('express')
const app = express()
const port = 4000

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(express.text());

app.all('/', (req, res) => {
    console.log("called helloworld")

    res.send('Hello World!')
})

app.all('/api/info', (req, res) => {
    console.log("called info")
    res.send('ok')
})

app.all('/api/notify', (req, res) => {
    console.log("called notify")
    res.send('ok')
})

app.all('/api/notify/:id', (req, res) => {
    console.log("called notify with id " + req.params.id)
    res.send('ok')
})

app.all('/hub/api/post/', (req, res) => {
    console.log("called hub api post")
    res.send('ok')
})

app.all('/hub/api/post/:id', (req, res) => {
    console.log("called hub api post with id " + req.params.id)
    console.log(req.body);
    res.send('ok')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
}) */

const nth_index_of = (str, pattern, n) => {
    var i = -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

let requests = 0;
const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}\n`);
    const device = msg.toString().split("#")[0];
    if (msg.toString().split("#")[1]) {
        const pairs = msg.toString().split("#")[1].split(",");
        if(pairs.length) pairs.pop();
        console.log("device " + device);
        for (const i in pairs) {
            const pair = pairs[i].split(":");;
            pairs[i] = pair;
            console.log("pid:" + pair[0] + ", value:" + pair[1]);
        }
    }


    const EV = msg.toString().substring(msg.indexOf("=") + 1, msg.indexOf(","));
    if (!EV) return;
    if (EV != "1") return;

    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    requests++;
    const comingChecksum = msg.toString().split("*")[1];
    const calculatedChecksum = Buffer.from(msg.toString().split("*")[0]).byteLength.toString(16);
    console.log(comingChecksum, calculatedChecksum)
    console.log(parseInt(comingChecksum, 16), parseInt(calculatedChecksum, 16))
    const TS = msg.toString().substring(
        msg.indexOf("TS=") + 3,
        nth_index_of(msg, ",", 2)
    );
    console.log("ev è " + EV)
    console.log("ts è " + TS)
    // 1#EV=1,RX=n,TS=39539*X
    if (EV == "1") { // login
        let stringtoSend = `1#EV=1,RX=${requests},TS=${TS}`;
        const bytes = Buffer.byteLength(stringtoSend);
        const checksum = bytes.toString(16);
        stringtoSend += "*" + checksum;
        console.log("sending back: " + stringtoSend)
        server.send(stringtoSend, rinfo.port, rinfo.address)
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(4000);