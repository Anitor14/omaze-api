
const axios = require('axios').default;
require("dotenv").config();

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function converterCurrency() {
    var options = { method: 'GET', url: 'https://free.currconv.com/api/v7/convert?q=USD_NGN&compact=ultra&apiKey=1b679b2977ccc4eceadd' };
    const promise = await axios.request(options);
    return promise.data;
}

const STATUS_CODES = {
    "OK": 200
};

const { API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID } = process.env;

const FIREBASE_CONFIG = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    databaseURL: DATABASE_URL,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
    measurementId: MEASUREMENT_ID
}

const uploadToFirebaseStorage = async (imagePath, storage) => {
    // Format the filename
    const timestamp = Date.now();
    const name = imagePath.originalname.split(".")[0];
    const type = imagePath.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;
    // Step 1. Create reference for file name in cloud storage 
    const imageRef = storage.child(fileName);
    // Step 2. Upload the file in the bucket storage
    const snapshot = await imageRef.put(imagePath.buffer);
    // Step 3. Grab the public url
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
}

const streamCloudinaryUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

const multiCloudinaryUpload = (file, folder) => {
	return new Promise(resolve => {
		cloudinary.uploader.upload(file, (result) => {
			resolve({
				url: result.url,
				id: result.public_id,
			})
		}, {
			resource_type: 'auto',
			folder: folder,
		})
	})
}

const generateCloudinaryImageOptions = (options) => {
    const { width, height, format, resource_type, created_at, bytes, type, etag, placeholder, url, secure_url, original_filename } = options;
    return {
        width: width,
        height: height,
        format: format,
        resource_type: resource_type,
        created_at: created_at,
        bytes: bytes,
        type: type,
        etag: etag,
        placeholder: placeholder,
        url: url,
        secure_url: secure_url,
        original_filename: original_filename
    };
};

const getImageableType = () => {
    return "";
}

module.exports = { 
    converterCurrency, 
    STATUS_CODES, 
    FIREBASE_CONFIG, 
    uploadToFirebaseStorage, 
    streamCloudinaryUpload, 
    generateCloudinaryImageOptions,
    multiCloudinaryUpload
};