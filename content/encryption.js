/**
 * encrypt a string
 * @param {string} input 
 */
const encrypt = (input) => {
    return stringToHex(input)
}

/**
 * decrypt a string
 * @param {any} input 
 */
const decrypt = (input) => {
    return hexToString(input)
}

function stringToHex(str)
{
    const buf = Buffer.from(str, 'utf8');
    return buf.toString('hex');
}

function hexToString(str)
{
    const buf = Buffer.from(str,'hex');
    return buf.toString('utf8');
}

module.exports = {
    encrypt,
    decrypt
}