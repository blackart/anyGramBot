#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var program = require('commander');
var fs = require('fs');
var JSDOM = require('jsdom').JSDOM;
// Create instance of JSDOM.
var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
// Get window
var window = jsdom.window;
// require anychart and anychart export modules
var anychart = require('anychart')(window);
var anychartExport = require('anychart-nodejs')(anychart);

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

app.get('/:chartType?/:x?/:y?', function (req, res) {

  //parse data and compose DATA obj
  var chartType = req.params.chartType.split(',');
  var x = req.params.x.split(',');
  var y = req.params.y.split(',');
  var data = [];

  for (var i = 0; i < x.length; i++) {
    x[i] = +x[i];
    y[i] = +y[i];
    data.push([x[i], y[i]]);
  }

  console.log(data);

  //generate chart
  var chart = anychart[chartType](data);
  chart.bounds(0, 0, 800, 600);
  chart.container('container');
  chart.draw();

// generate JPG image and save it to a file
  anychartExport.exportTo(chart, 'jpg').then(function(image) {
    fs.writeFile('anychart.jpg', image, function(fsWriteError) {
      if (fsWriteError) {
        console.log(fsWriteError);
      } else {
        console.log('Complete');
      }
    });
  }, function(generationError) {
    console.log(generationError);
  });

    // res.send('X: ');
});


app.listen(program.port, function () {
  // logger.info('Export server listening on port ' + program.port + '!')
  console.log('Export server listening on port ' + program.port + '!')
});

module.exports = app;