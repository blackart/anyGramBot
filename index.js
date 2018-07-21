#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var program = require('commander');

program
    .version('1.0.0')
    .option('-p, --port [value]', 'TCP port of server ', 3000)
    .option('-o, --output-dir [value]', 'Output directory', 'shared')
    .option('-d, --disable-scripts-executing [value]', 'Whether script execution disabled', false)
    .option('--log-level [value]', 'Level of logging. Possible values: error, warn, info, verbose, debug, silly', 'info')
    .option('--log-file [value]', 'Path to log file. File will created and will rotate by daily.', null);

program.parse(process.argv);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({parameterLimit: 100000, limit: '50mb', extended: true}));

app.post('/');

app.get('/status', function (req, res) {
  res.send('ok');
});

app.listen(program.port, function () {
  console.log('Export server listening on port ' + program.port + '!')
});

module.exports = app;