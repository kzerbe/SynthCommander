const port = 8008;

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('file-system');
const YAML = require('yaml');

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const patchDir = __dirname + '/patches';
const modelDir = __dirname + '/public';

app.get('/api/list', (request, response) => {
  fs.readdir(patchDir, (err, files) => {
    if (err) {
      response.send(`patch listing failed: ${err.message}`)
    }
    const patches = files.map(fn => {
      return fn.substring(0, fn.lastIndexOf('.'))
    });

    response.send(JSON.stringify(patches));
  });
});

app.get('/api/model', (request, response) => {
  const modelname = request.query.model;
  if (!modelname) {
    response.status(404).send('missing model name');
    return;
  }

  let isYaml = false;
  let filename = `${modelDir}/${modelname}.yaml`;

  if (fs.existsSync(filename)) {
    isYaml = true;
  } else {
    filename = `${modelDir}/${modelname}.json`;
  }

  if (!fs.existsSync(filename)) {
    response.status(404).send('model file not found');
    return;
  }

  let jsdata;
  if (isYaml) {
    let data = fs.readFileSync(filename, 'utf-8');
    jsdata =YAML.parse(data);
  } else {
    let data = fs.readFileSync(filename, 'utf-8');
    jsdata = JSON.parse(data);
  }
  response.status(200).send(jsdata);
});

app.get('/api/load', (request, response) => {
  const patchname = request.query.name;
  if (!patchname) {
    response.status(404).send('patch name missing');
    return;
  }

  const filename = `${patchDir}/${patchname}.json`;
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
  const patchname = request.body.patchname;
  if (!!patchname) {
    const filename = `${patchDir}/${patchname}.json`;
    const patch = JSON.stringify(request.body);
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
