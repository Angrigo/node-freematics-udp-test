const nth_index_of = (str, pattern, n) => {
    var i = -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}


const handleLogin = (data) => {
    let stringtoSend = `1#EV=1,RX=${data.requests},TS=${data.TS}`;

    const buffer = Buffer.from(stringtoSend);
    let checksum = 0;
    buffer.map((v) => { checksum += v; })
    // checksum calc is working with CheckSum8 Modulo 256 -> Sum of Bytes % 256
    stringtoSend += "*" + (checksum % 256).toString(16).toUpperCase();
    console.log("sending back: " + stringtoSend)

    return stringtoSend;
}



module.exports = { nth_index_of, handleLogin }