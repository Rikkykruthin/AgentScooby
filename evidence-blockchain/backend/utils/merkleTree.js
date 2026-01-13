const { MerkleTree } = require('merkletreejs');
const crypto = require('crypto');

/**
 * SHA-256 hash function for Merkle Tree
 */
const sha256 = (data) => {
  return crypto.createHash('sha256').update(data).digest();
};

/**
 * Build a Merkle Tree from an array of evidence data
 * @param {Array} evidenceList - Array of evidence objects
 * @returns {Object} { tree, root, leaves }
 */
const buildMerkleTree = (evidenceList) => {
  if (!evidenceList || evidenceList.length === 0) {
    return { tree: null, root: null, leaves: [] };
  }

  // Create leaves by hashing each evidence record using stable fields
  const leaves = evidenceList.map(evidence => {
    const data = JSON.stringify({
      id: evidence._id?.toString() || evidence.id,
      name: evidence.name,
      caseNo: evidence.caseNo,
      currentHash: evidence.currentHash
    });
    return sha256(data);
  });

  // Build the tree
  const tree = new MerkleTree(leaves, sha256);
  const root = tree.getRoot().toString('hex');

  return { tree, root, leaves };
};

/**
 * Generate a proof for a specific evidence item
 * @param {MerkleTree} tree - The Merkle tree
 * @param {Object} evidence - Evidence object to prove
 * @returns {Array} Proof array
 */
const generateProof = (tree, evidence) => {
  const data = JSON.stringify({
    id: evidence._id?.toString() || evidence.id,
    name: evidence.name,
    caseNo: evidence.caseNo,
    currentHash: evidence.currentHash
  });
  const leaf = sha256(data);
  return tree.getProof(leaf).map(p => ({
    position: p.position,
    data: p.data.toString('hex')
  }));
};

/**
 * Verify a proof against the Merkle root
 * @param {Array} proof - Proof array
 * @param {Object} evidence - Evidence object
 * @param {string} root - Merkle root in hex
 * @returns {boolean} True if valid
 */
const verifyProof = (proof, evidence, root) => {
  const data = JSON.stringify({
    id: evidence._id?.toString() || evidence.id,
    name: evidence.name,
    caseNo: evidence.caseNo,
    currentHash: evidence.currentHash
  });
  const leaf = sha256(data);
  
  // Reconstruct proof format for merkletreejs
  const proofBuffers = proof.map(p => ({
    position: p.position,
    data: Buffer.from(p.data, 'hex')
  }));
  
  const tree = new MerkleTree([], sha256);
  return tree.verify(proofBuffers, leaf, Buffer.from(root, 'hex'));
};

/**
 * Get the Merkle root as hex string
 * @param {MerkleTree} tree - The Merkle tree
 * @returns {string} Root in hex format
 */
const getMerkleRoot = (tree) => {
  if (!tree) return null;
  return tree.getRoot().toString('hex');
};

module.exports = {
  buildMerkleTree,
  generateProof,
  verifyProof,
  getMerkleRoot,
  sha256
};
