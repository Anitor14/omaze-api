
const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');


var serviceAccount = require("./serviceAPI.json");

const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

const storageRef = admin.storage().bucket(`gs://shem-api.appspot.com`);

async function uploadFile(path, filename, destination) {
    const storage = storageRef.upload(path, {
        public: true,
        destination: `${destination}/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        }
    });
    return storage[0].metadata.mediaLink;
}

module.exports = { uploadFile };
