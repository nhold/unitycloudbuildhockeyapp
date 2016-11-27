
var fs = require('fs');
var FormData = require('form-data');
var bodyParser = require('body-parser');
var najax = require('najax');
var http = require('http');
var https = require('https');

var unityAPIBase = "https://build-api.cloud.unity3d.com/";

module.exports = {
    listenForBuild,
    getBuildDetails,
    downloadFromUCB,
}

// TODO: Make sure it's a valid post.
function listenForBuild(expressApp, url, onHookReceived) {

    var jsonParser = bodyParser.json();

    expressApp.post(url, jsonParser, function (req, res) {

        if (!req.body) return res.sendStatus(400);

        console.log("Receieved a post from /build:");
        console.log(JSON.stringify(req.body));

        onHookReceived(req.body);
    });
}

// This will authorise first.
function getBuildDetails(bData, key, onBuildDetailsReceived) {
    najax({
        url: unityAPIBase + bData.links.api_self.href,
        type: 'GET',
        headers: {
            'Authorization': 'Basic ' + key
        },
        success: function (data) {

            console.log(data);
            var data = JSON.parse(data);
            onBuildDetailsReceived(data);

        },
        error: function (error) {
            console.log(error);
        }
    });
}

function downloadFromUCB(url, filename, onFinished) {
    
    deleteFile(filename);

    https.get(url, (res) => {

        var writeStream = fs.createWriteStream(filename, { 'flags': 'a' });

        var len = parseInt(res.headers['content-length'], 10);
        var cur = 0;
        var total = len / 1048576; //1048576 - bytes in  1Megabyte

        res.on('data', (chunk) => {
            writeStream.write(chunk, 'binary');
        });

        res.on('end', () => {
            writeStream.end();
        });

        writeStream.on('finish', () => {

            onFinished();

        });

    }).on('error', (e) => {
        console.error(e);
    });
}

function deleteFile(filename) {
    fs.exists(filename, function (exists) {
        if (exists) {
            // Delete File.
            fs.unlink(filename);
        }
    });
}