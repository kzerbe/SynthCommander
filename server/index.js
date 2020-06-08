const port = 8008; // server's port

const express = require('express');  // express Web-framework
const bodyParser = require('body-parser'); // parse query strings and HTTP body
const fs = require('file-system'); // file access
const YAML = require('yaml');  // YAML file parser

const app = express();

app.use(express.static(__dirname + '/public'));  // static file middleware
app.use(bodyParser.urlencoded({extended: false})); //
app.use(bodyParser.json()); // support JSON requests/responds

const patchDir = __dirname + '/patches';          // patches folder
const modelDir = __dirname + '/public/assets';    // synthmodel folder

fs.mkdir(patchDir); // make sure patches folder exists

// request list of patchfiles
app.get('/api/list', (request, response) => {
  fs.readdir(patchDir, (err, files) => {
    if (err) {
      response.send(`patch listing failed: ${err.message}`)
    }
    const patches = files.map(fn => { // strip  file extension
      return fn.substring(0, fn.lastIndexOf('.'))
    });

    response.send(JSON.stringify(patches)); // respond patchnames as JSON array
  });
});

// request patch as /api/load?name=patchname
app.get('/api/load', (request, response) => {
  const patchname = request.query.name;

  if (!patchname) {
    response.status(404).send('patch name missing');
    return;
  }

  // check for patch file availabilty
  const filename = `${patchDir}/${patchname}.json`;
  fs.readFile(filename, (err, data) => {
    if (err) {
      response.status(404).send('patch file not found');
      return;
    }
    response.status(200).send(data);
  });
});

// post patch where request body contains JSON patch data
app.post('/api/store', (request, response) => {
  let msg = 'Ok';
  const patchname = request.body.patchname; // field "patchname" should contain patchname
  if (!!patchname) {
    const filename = `${patchDir}/${patchname}.json`; // build patch file name
    const patch = JSON.stringify(request.body);
    fs.writeFile(filename, patch, (err) => { // store patch file
      if (err) {
        msg = `can't store patch: ${err.message}`;
      }
    });
  } else {
    msg = 'patchname is missing';
  }
  response.status(200).send(`{"status": "${msg}"}`)
});

// request list of synthesizer model files
app.get('/api/listmodels', (request, response) => {
  fs.readdir(modelDir, (err, files) => {
    // respond array of filenames of type .json or .yaml
    response.status(200).send(files.filter(name => name.endsWith('.yaml') || name.endsWith('json')));
  });
});

// request synthesizer model data as /api/model?model=modelname.yaml
app.get('/api/model', (request, response) => {
  const modelname = request.query.model;
  if (!modelname) {
    response.status(404).send('missing model name');
    return;
  }

  let isYaml = modelname.endsWith('.yaml');
  filename = `${modelDir}/${modelname}`

  // check for file availability
  if (!fs.existsSync(filename)) {
    response.status(404).send('model file not found');
    return;
  }

  let jsdata;
  if (isYaml) { // convert YAML to json
    let data = fs.readFileSync(filename, 'utf-8');
    jsdata =YAML.parse(data);
  } else { // read as JSON
    let data = fs.readFileSync(filename, 'utf-8');
    jsdata = JSON.parse(data);
  }
  // send synth model as JSON
  response.status(200).send(jsdata);
});

// start server
app.listen(port, () => {
  console.log(`started server at http://localhost:${port}`);
});
