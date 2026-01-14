const Evidence = require('../models/Evidence');
const User = require('../models/User');
const MerkleRoot = require('../models/MerkleRoot');
const { signData, verifySignature, hashData } = require('../utils/digitalSignature');
const { buildMerkleTree, generateProof, verifyProof } = require('../utils/merkleTree');
const { calculateFileHash } = require('../utils/fileHash');
const { createAuditLog } = require('../utils/auditLogger');
const path = require('path');
const fs = require('fs');

const getPreviousHash = async () => {
  const lastEvidence = await Evidence.findOne().sort({ createdAt: -1 });
  return lastEvidence ? lastEvidence.currentHash : 'GENESIS';
};

const updateMerkleTree = async () => {
  const allEvidence = await Evidence.find().sort({ createdAt: 1 });
  const { tree, root } = buildMerkleTree(allEvidence);
  
  if (root) {
    const lastRoot = await MerkleRoot.findOne().sort({ createdAt: -1 });
    await MerkleRoot.create({
      root,
      evidenceCount: allEvidence.length,
      previousRoot: lastRoot ? lastRoot.root : 'GENESIS'
    });

    for (const ev of allEvidence) {
      const proof = generateProof(tree, ev);
      ev.merkleProof = proof;
      await ev.save({ validateBeforeSave: false }); 
    }
  }

  return root;
};

const addEvidence = async (req, res) => {
  try {
    const {
      name, caseNo, evidenceType, description,
      collectionLocation, storageLocation, storagePointer,
      status
    } = req.body;

    console.log('Adding evidence, req.user:', req.user?._id);
    console.log('Request body:', req.body);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id);
    console.log('User found:', user ? 'yes' : 'no', 'has privateKey:', !!user?.privateKey);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.privateKey) {
      return res.status(500).json({ message: 'User private key not found' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileHash = await calculateFileHash(file.path);
        attachments.push({
          fileName: file.originalname,
          fileHash: fileHash,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          filePath: file.filename  
        });
      }
    }

    const signedTimestamp = Date.now();
    const dataString = JSON.stringify({
      name, caseNo, evidenceType, description,
      collectionLocation, storageLocation, storagePointer,
      collectedBy: req.user._id.toString(),
      timestamp: signedTimestamp,
      attachments: attachments.map(a => ({ fileName: a.fileName, fileHash: a.fileHash }))
    });

    const previousHash = await getPreviousHash();
    const currentHash = hashData(dataString + previousHash);

    let signature;
    try {
      signature = signData(dataString, user.privateKey);
    } catch (signError) {
      console.error('Signing error:', signError);
      return res.status(500).json({ message: 'Failed to sign evidence: ' + signError.message });
    }

    const evidence = await Evidence.create({
      name,
      caseNo,
      evidenceType,
      description,
      collectedBy: req.user._id,
      collectionDate: new Date(),
      collectionLocation,
      storageLocation,
      storagePointer,
      status: status || 'Collected',
      currentHash,
      previousHash,
      signature,
      signedBy: req.user._id,
      signedTimestamp,
      attachments: attachments
    });

    await updateMerkleTree();

    await createAuditLog({
      action: 'EVIDENCE_CREATED',
      actor: req.user._id,
      targetType: 'Evidence',
      targetId: evidence._id.toString(),
      targetName: evidence.name,
      details: {
        evidenceId: evidence.evidenceId,
        caseNo: evidence.caseNo,
        evidenceType: evidence.evidenceType,
        filesCount: attachments.length
      },
      req,
      status: 'SUCCESS'
    });

    res.status(201).json(evidence);
  } catch (error) {
    console.error('Add Evidence Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllEvidence = async (req, res) => {
  try {
    const { search, caseNo } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (caseNo) {
      query.caseNo = caseNo;
    }

    const evidence = await Evidence.find(query)
      .populate('collectedBy', 'name')
      .populate('signedBy', 'name publicKey')
      .sort({ createdAt: -1 });

    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('collectedBy', 'name')
      .populate('signedBy', 'name publicKey');

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const user = await User.findById(req.user._id);

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'currentHash' && key !== 'previousHash') {
        evidence[key] = req.body[key];
      }
    });

    const dataString = JSON.stringify({
      ...evidence.toObject(),
      updatedAt: Date.now()
    });
    
    evidence.previousHash = evidence.currentHash;
    evidence.currentHash = hashData(dataString + evidence.previousHash);
    evidence.signature = signData(dataString, user.privateKey);
    evidence.signedBy = req.user._id;

    await evidence.save();

    await updateMerkleTree();

    await createAuditLog({
      action: 'EVIDENCE_UPDATED',
      actor: req.user._id,
      targetType: 'Evidence',
      targetId: evidence._id.toString(),
      targetName: evidence.name,
      details: {
        evidenceId: evidence.evidenceId,
        caseNo: evidence.caseNo,
        changes: Object.keys(req.body)
      },
      req,
      status: 'SUCCESS'
    });

    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const evidenceInfo = {
      evidenceId: evidence.evidenceId,
      name: evidence.name,
      caseNo: evidence.caseNo
    };

    await evidence.deleteOne();

    await updateMerkleTree();

    await createAuditLog({
      action: 'EVIDENCE_DELETED',
      actor: req.user._id,
      targetType: 'Evidence',
      targetId: req.params.id,
      targetName: evidenceInfo.name,
      details: {
        evidenceId: evidenceInfo.evidenceId,
        caseNo: evidenceInfo.caseNo
      },
      req,
      status: 'SUCCESS'
    });

    res.json({ message: 'Evidence deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('signedBy', 'publicKey name');

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    if (!evidence.signedTimestamp) {
      return res.json({
        evidenceId: evidence.evidenceId,
        signatureValid: false,
        merkleValid: false,
        hashChainValid: false,
        signedBy: evidence.signedBy?.name || 'Unknown',
        currentHash: evidence.currentHash,
        previousHash: evidence.previousHash,
        merkleRoot: null,
        integrityStatus: 'CANNOT_VERIFY',
        message: 'Evidence was added before verification system was implemented. Please delete and re-add.'
      });
    }

    const dataString = JSON.stringify({
      name: evidence.name,
      caseNo: evidence.caseNo,
      evidenceType: evidence.evidenceType,
      description: evidence.description,
      collectionLocation: evidence.collectionLocation,
      storageLocation: evidence.storageLocation,
      storagePointer: evidence.storagePointer,
      collectedBy: evidence.collectedBy?._id?.toString() || evidence.collectedBy?.toString(),
      timestamp: evidence.signedTimestamp
    });

    const signatureValid = verifySignature(
      dataString,
      evidence.signature,
      evidence.signedBy.publicKey
    );

    const currentRoot = await MerkleRoot.findOne().sort({ createdAt: -1 });
    let merkleValid = false;
    
    if (currentRoot && evidence.merkleProof.length > 0) {
      merkleValid = verifyProof(evidence.merkleProof, evidence, currentRoot.root);
    }

    let hashChainValid = true;
    if (evidence.previousHash !== 'GENESIS') {
      const prevEvidence = await Evidence.findOne({ currentHash: evidence.previousHash });
      hashChainValid = !!prevEvidence;
    }

    res.json({
      evidenceId: evidence.evidenceId,
      signatureValid,
      merkleValid,
      hashChainValid,
      signedBy: evidence.signedBy.name,
      currentHash: evidence.currentHash,
      previousHash: evidence.previousHash,
      merkleRoot: currentRoot?.root || null,
      integrityStatus: signatureValid && hashChainValid ? 'VERIFIED' : 'TAMPERED'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMerkleRoot = async (req, res) => {
  try {
    const root = await MerkleRoot.findOne().sort({ createdAt: -1 });
    res.json(root || { message: 'No Merkle root computed yet' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const attachment = evidence.attachments.id(req.params.fileId);
    if (!attachment) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../uploads', attachment.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const currentHash = await calculateFileHash(filePath);
    if (currentHash !== attachment.fileHash) {
      return res.status(500).json({ message: 'File integrity check failed - file may be corrupted' });
    }

    res.download(filePath, attachment.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEvidence,
  getAllEvidence,
  getEvidence,
  updateEvidence,
  deleteEvidence,
  verifyEvidence,
  getMerkleRoot,
  downloadFile
};
