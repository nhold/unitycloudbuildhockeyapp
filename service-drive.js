var google = require('googleapis');
var drive = google.drive('v3');
var googlekey = require('./drive_service_account.json');

module.exports = {
    uploadToDrive
}
var jwtClient;

if (googlekey) {
    jwtClient = new google.auth.JWT(
        googlekey.client_email,
        null,
        googlekey.private_key,
        ['https://www.googleapis.com/auth/drive'],
        null
    );
}


function uploadToDrive(filename, projectName) {
    if (googlekey) {
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
            }

            var folderID = '0B1BjojHY9NB6X0ItbXdrWDdzd28';

            // TODO: Only Create folder if it doesn't already exist.
            var folderMetaData = {
                'name': projectName,
                'mimeType': 'application/vnd.google-apps.folder',
                parents: [folderID]
            };

            drive.files.create({
                auth: jwtClient,
                resource: folderMetaData,
                fields: 'id'
            }, function (err, fold) {

                if (err) {
                    console.log(err);
                }
                else {
                    console.log(fold.id);

                    // Create file in folder when it exists.
                    var fileMetadata = {
                        'name': decodeURI(filename),
                        parents: [fold.id]
                    };

                    var media = {
                        mimeType: 'application/binary',
                        body: fs.createReadStream(filename)
                    };

                    drive.files.create({
                        auth: jwtClient,
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    }, function (err, file) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(file.id);
                        }

                    });
                }

            });

        });
    }
}