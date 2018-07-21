#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var program = require('commander');
const axios = require('axios');
// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var request = require('request');

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

app.get('/status', function (req, res) {
  res.send('ok');
});

app.post('/test', function (req, res) {
  var message = req.body.message;
  // axios
  //     .post(
  //         'https://api.telegram.org/bot694364183:AAGemWjJLnZKryELrdjjoBtFLuYvmWW4zIM/sendMessage',
  //         {
  //           chat_id: message.chat.id,
  //           text: 'Polo!!'
  //         }
  //     )
  //     .then(function() {
  //       console.log('Message posted');
  //       res.end('ok')
  //     }).catch(function(err) {
  //       console.log('Error :', err);
  //       res.end('Error :' + err);
  //     });


  request({
    url: 'https://report.anychart.com/raster-image',
    method: 'POST',
    json: {
      "file_name": "anychart.png",
      "file_type": "png",
      "data": "var chart = anychart.pie(); chart.data([10, 20, 8, 5, 12, 9]); chart.container('container'); chart.draw();",
      "data_type": "javascript",
      "response_type": "base64"
    }
  }, function(error, response, body) {
    console.log(body);
    request({
      url: 'https://api.telegram.org/bot694364183:AAGemWjJLnZKryELrdjjoBtFLuYvmWW4zIM/sendPhoto',
      method: 'POST',
      json: {
        chat_id: message.chat.id,
        photo: body.data
      }
    }, function(error, response, body) {
      console.log('Message posted');
      res.end('ok')
    });
  });

});


app.get('/chart', function(req, res) {
  request({
    url: 'https://report.anychart.com/raster-image',
    method: 'POST',
    json: {
      "file_name": "anychart.png",
      "file_type": "png",
      "data": "var chart = anychart.pie(); chart.data([10, 20, 8, 5, 12, 9]); chart.container('container'); chart.draw();",
      "data_type": "javascript",
      "response_type": "base64"
    }
  }, function(error, response, body){
    console.log('body', body.data);
  });
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
        axios
            .post(
                'https://api.telegram.org/bot694364183:AAGemWjJLnZKryELrdjjoBtFLuYvmWW4zIM/sendMessage',
                {
                  chat_id: message.chat.id,
                  text: 'Polo!!'
                }
            )
            .then(function() {
              // We get here if the message was successfully posted
              console.log('Message posted');
              res.end('ok')
            }).catch(function(err) {
              // ...and here if it was not
          console.log('Error :', err);
          res.end('Error :' + err);
        })
      }
    });
  }, function(generationError) {
    console.log(generationError);
  });

    // res.send('X: ');
});


app.listen(program.port, function () {
  console.log('Export server listening on port ' + program.port + '!')
});

module.exports = app;