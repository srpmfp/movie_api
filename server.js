const http = require('http'),
    url = require('url'),
    fs = require('fs');

http.createServer((request, response) => {
    let addr = request.url;
    let q = new URL('http://' + request.headers.host + addr);
    let filepath = '';

    fs.appendFile('log.txt', `'URL:',  ${addr} \nTimestamp:  new ${Date()} + '\n\n'`, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('added to log');
        }
    });

    if (q.pathname.includes('documentation')) {
        filepath = (__dirname + '/documentation.html');
    } else {
        filepath = 'index.html';

    }
    fs.readFile(filepath, (err, data) => {
        if (err) {
            throw err;
        } else {
            response.writeHead(200, { 'Content-type': 'text/html' });
            response.write(data);
            response.end();
        }
    });

}).listen(8080);
console.log('My first node test server is on Port 8080');
