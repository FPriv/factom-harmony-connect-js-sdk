const http = require('http');
const fs = require('fs');
const path = require('path');
const URL = require('url').URL;
const simulateNotary = require('./simulateNotary');
const testMethods = require('./testMethods');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.svg': 'application/image/svg+xml',
};

/** handle GET request */
function HTMLHandler(request, response) {
  console.log('request ', request.url);

  let filePath = `.${request.url}`;
  if (filePath === './') {
    filePath = './index.html';
  }
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // eslint-disable-next-line no-shadow
        fs.readFile('./404.html', (error, content) => {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        });
      } else {
        response.writeHead(500);
        response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
        response.end();
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

function handleFileDownload(request, response) {
  const file = fs.createReadStream('./Factom_Whitepaper_v1.2.pdf');
  const stat = fs.statSync('./Factom_Whitepaper_v1.2.pdf');
  response.setHeader('Content-Length', stat.size);
  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', 'attachment; filename=Factom_Whitepaper_v1.2.pdf');
  file.pipe(response);
}

http.createServer((req, res) => {
  // create an object for all redirection options
  const router = {
    'GET/simulate': simulateNotary,
    'GET/testMethods': testMethods,
    'GET/document': handleFileDownload,
    default: HTMLHandler,
  };
  // parse the url by using WHATWG URL API
  const reqUrl = new URL(req.url, 'http://127.0.0.1/');
  // find the related function by searching "method + pathname" and run it
  const redirectedFunc = router[req.method + reqUrl.pathname] || router.default;
  redirectedFunc(req, res, reqUrl);
}).listen(8080, () => {
  console.log('Server is running at http://127.0.0.1:8080/');
});
