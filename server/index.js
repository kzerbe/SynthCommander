const port = 8008;

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('file-system');

const app= express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let patchDir = __dirname + '/patches';

app.get('/api/list', (request, response) => {
  fs.readdir(patchDir, (err, files) => {
    if(err) {
      response.send(`patch listing failed: ${err.message}`)
    }
    let patches = files.map(fn => {
      return fn.substring(0, fn.lastIndexOf('.'))
    });
    let list = JSON.stringify(patches);
    response.send(list);
  });
});

app.get('/api/load', (request, response) => {
  let patchname = request.query.name;
  if (!patchname) {
    response.status(404).send('patch name missing');
    return;
  }
  let filename = `${patchDir}/${patchname}.json`;
  fs.readFile(filename, (err, data) => {
    if (err) {
      response.status(404).send('patch file not found');
      return;
    }
    response.status(200).send(data);
  });
});

app.post('/api/store', (request, response) => {
  let msg = 'Ok';
  let patchname = request.body.patchname;
  if (!!patchname) {
    let filename = `${patchDir}/${patchname}.json`;
    let patch = JSON.stringify(request.body);
    fs.writeFile(filename, patch, (err) => {
        if (err) {
          msg = `can't store patch: ${err.message}`;
        }
    });
  } else {
    msg = 'patchname is missing';
  }
  response.status(200).send(`{"status": "${msg}"}`)
});

app.listen(port, () => {
  console.log(`started server at http://localhost:${port}`);
});
