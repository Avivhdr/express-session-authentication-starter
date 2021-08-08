const crypto = require('crypto');
const fs = require('fs');
const decrypt = require('./decrypt');
// const { originalData } = require('./signMessage');

// This is the data that we are receiving from the sender
const receivedData = require('./signMessage').packageOfDataToSend;

// // confirming that the data was not changed
// if (JSON.stringify(originalData) === JSON.stringify(receivedData.originalData)) {
//   console.log('Data was not changed'); // eslint-disable-line no-console
// } else {
//   console.log('Data was changed');
// }

// Decrypting the signed message to hex
const publicKey = fs.readFileSync(__dirname + '/id_rsa_pub.pem', 'utf8');
const decryptedMessage = decrypt.decryptWithPublicKey(publicKey, receivedData.signedAndEncryptedData);
const decryptedMessageHex = decryptedMessage.toString();

// Replicating what the sender has done and later checking if it matches what the sender sent
// Creating hex from the original data (that should be equal to the hex that was decrypted)
const hash = crypto.createHash(receivedData.algorithm);
const hashOfOriginal = hash.update(JSON.stringify(receivedData.originalData));
const hashOfOriginalHex = hash.digest('hex');

// Comparing the 2 hexs to see if they are a match
if (hashOfOriginalHex === decryptedMessageHex) {
    console.log('Success!  The data has not been tampered with and the sender is valid.')
} else {
    console.log('Uh oh... Someone is trying to manipulate the data or someone else is sending this!  Do not use!');
}