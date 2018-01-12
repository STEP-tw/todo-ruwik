const http = require('http');
const app = require('./js/app.js');
const PORT = 8000;
const server = http.createServer(app);
server.listen(PORT);
console.log(`listening on port ${PORT}`);
