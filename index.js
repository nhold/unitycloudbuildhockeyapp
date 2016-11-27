// Initialise .env config.
require('dotenv').config();

// Options
var options = {
    port: process.env.PORT || 3000, // Heroku port or 80.
    unityAPIBase: "https://build-api.cloud.unity3d.com/", // URI (e.g. href) recieved in web hook payload.
    unityCloudAPIKey: process.env.UNITYCLOUD_KEY,
    hockeyappAPIUpload: "https://rink.hockeyapp.net/api/2/apps/upload",
    hockeyappAPIKey: process.env.HOCKEYAPP_KEY,
};

// Imports
var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    app = express(),
    http = require('http'),
    https = require('https'),
    server = http.Server(app),
    bodyParser = require('body-parser'),
    najax = require('najax'),
    FormData = require('form-data'),
    _ = require('lodash'),
    url = require("url"),
    path = require("path");

var hockey = require('./hockey.js');
var ucb = require('./ucb.js');

// Run Server
var server = server.listen(options.port, function () {
    console.log('listening on *:' + options.port);
});

// Configure Express
app.use('/public', express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Listen for a unity cloud build on /build URL.
ucb.listenForBuild(app, '/build', (unityBuildData) => {

    // Get the URL to the Unity Cloud Build artifact.
    var filename = unityBuildData.links.api_self.href;

    if (filename) {

        ucb.getBuildDetails(unityBuildData, options.unityCloudAPIKey, (bdetails) => {

            var parsed = url.parse(bdetails.links.download_primary.href);
            var filename = path.basename(parsed.pathname);
            console.log(filename);
            var message = "Master automated build.";

            if (bdetails.changeset != null) {
                // Construct message from all changesets.
                message = "";

                for (var i in bdetails.changeset) {
                    message += bdetails.changeset[i].message + "\n";
                }
            }

            var projectName = bdetails.projectVersion.projectName;

            ucb.downloadFromUCB(bdetails.links.download_primary.href, filename, () => { 

                // TODO: define build info based on branch or target name (I.e Master branch is beta and develop is alpha)
                /*
                if (unityBuildData.buildTargetName.includes("Master")) {
                    hockey.uploadFileToHockey(filename, message, 2, 0, 0);
                }
                else {
                    hockey.uploadFileToHockey(filename, message, 2, 0, 2);
                }*/

                hockey.uploadFileToHockey(filename, message, 2, 0, 0);
            });
        });
    }
    else {
        console.log("Error with filename.");
    }
});