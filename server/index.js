const port = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('file-system');

const app= express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let patchDir = __dirname + '/patches';

app.get('', (request, response) => {
  response.send({'/status':'patch saved'});
});

app.get('/list', (request, response) => {
  fs.readdir(patchDir, (err, files) => {
    let patches = files.map(fn => {
      return fn.substring(0, fn.lastIndexOf('.'))
    });
    let list = JSON.stringify(patches);
    response.send(list);
  });
});

app.post('/store', (request, response) => {
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
  response.send(`{'status: '${msg}'`)
});

app.listen(port, () => {
  console.log(`started server at http://localhost:${port}`);
});
