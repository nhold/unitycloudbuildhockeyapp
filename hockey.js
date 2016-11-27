
var fs = require('fs');
var FormData = require('form-data');

var hockeyAPIUpload = "https://rink.hockeyapp.net/api/2/apps/upload";

var HOCKEY_APP_HOST = 'rink.hockeyapp.net';
var HOCKEY_APP_PATH = '/api/2/apps/upload/';
var HOCKEY_APP_PROTOCOL = 'https:';

module.exports = { uploadFileToHockey };

function uploadFileToHockey(filename, notes, status, notes_type, release_type) {

    console.log("Uploading a file to hockeyapp: " + filename);

    var readable = fs.createReadStream(filename);

    readable.on('error', () => {
        console.log("Error reading file for upload to hockeyapp.");
    });

    // Create FormData
    var form = new FormData();
    form.append('status', status);
    form.append('notes', notes);
    form.append('notes_type', notes_type);
    form.append('notify', 0);
    form.append('ipa', readable);
    form.append('release_type', release_type);

    var req = form.submit({
        host: HOCKEY_APP_HOST,
        path: HOCKEY_APP_PATH,
        protocol: HOCKEY_APP_PROTOCOL,
        headers: {
            'Accept': 'application/json',
            'X-HockeyAppToken': options.hockeyappAPIKey
        }
    }, (err, res) => {
        if (err) {
            console.log(err);
        }

        if (res.statusCode !== 200 && res.statusCode !== 201) {
            console.log('Uploading failed with status ' + res.statusCode);
            console.log(res);
            return;
        }

        res.on('end', () => {

            console.log("Finished uploading " + filename + " to hockeyapp.");

            deleteFile(filename);

        });

    });
}