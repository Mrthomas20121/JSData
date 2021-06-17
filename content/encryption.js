const crypto = require('crypto');
const key = Buffer.from("232f150296ffd446fc0b39fa32d1c1d42c2e232ccd3203df729b7f3c3c63a5da2", "hex");
const iv = crypto.randomBytes(16);

/**
 * Encrypt a value
 * @param {*} text 
 */
function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}\r\n${encrypted.toString('hex')}`
}

/**
 * Decrypt a value
 * @param {string} text 
 */
function decrypt(text) {
    let arr = text.split('\r\n')
    let iv = Buffer.from(arr[0], 'hex');
    let encryptedText = Buffer.from(arr[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt
}