const admin = require("firebase-admin");
require('dotenv').config();


// const serviceAccount = require("./serviceAccount.json");
// console.log(serviceAccount);

const base64Credentials = process.env.private_key;
const decodedPrivateKey = Buffer.from(base64Credentials, 'base64').toString('utf-8');
const formattedPrivateKey = decodedPrivateKey.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: formattedPrivateKey,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;