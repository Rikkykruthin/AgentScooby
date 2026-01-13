const EC = require('elliptic').ec;
const crypto = require('crypto');

// Using secp256k1 curve (same as Bitcoin/Ethereum)
const ec = new EC('secp256k1');

/**
 * Generate a new key pair for a user
 * @returns {Object} { privateKey, publicKey }
 */
const generateKeyPair = () => {
  const keyPair = ec.genKeyPair();
  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex')
  };
};

/**
 * Sign data with a private key
 * @param {string} data - Data to sign
 * @param {string} privateKey - Private key in hex format
 * @returns {string} Signature in hex format
 */
const signData = (data, privateKey) => {
  const key = ec.keyFromPrivate(privateKey, 'hex');
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const signature = key.sign(hash);
  return signature.toDER('hex');
};

/**
 * Verify a signature
 * @param {string} data - Original data
 * @param {string} signature - Signature in hex format
 * @param {string} publicKey - Public key in hex format
 * @returns {boolean} True if valid
 */
const verifySignature = (data, signature, publicKey) => {
  try {
    const key = ec.keyFromPublic(publicKey, 'hex');
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return key.verify(hash, signature);
  } catch (error) {
    return false;
  }
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hash in hex format
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  generateKeyPair,
  signData,
  verifySignature,
  hashData
};
