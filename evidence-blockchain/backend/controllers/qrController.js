const QRCode = require('qrcode');
const Evidence = require('../models/Evidence');

exports.generateQRCode = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${baseUrl}/scan/${evidence._id}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      }
    });

    res.json({
      qrCode: qrCodeDataUrl,
      evidenceId: evidence.evidenceId,
      url: qrData
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({ message: 'Error generating QR code' });
  }
};

exports.generatePrintableQR = async (req, res) => {
  try {
    console.log('Generating QR for evidence ID:', req.params.id);
    const evidence = await Evidence.findById(req.params.id)
      .populate('collectedBy', 'name designation');
    
    if (!evidence) {
      console.log('Evidence not found');
      return res.status(404).json({ message: 'Evidence not found' });
    }
    console.log('Evidence found:', evidence.evidenceId);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${baseUrl}/scan/${evidence._id}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({
      qrCode: qrCodeDataUrl,
      evidence: {
        evidenceId: evidence.evidenceId,
        name: evidence.name,
        caseNo: evidence.caseNo,
        evidenceType: evidence.evidenceType,
        collectionDate: evidence.collectionDate,
        collectedBy: evidence.collectedBy?.name || 'N/A',
        storageLocation: evidence.storageLocation
      },
      url: qrData
    });
  } catch (error) {
    console.error('Printable QR generation error:', error);
    res.status(500).json({ message: 'Error generating printable QR' });
  }
};

exports.getEvidenceByQR = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('collectedBy', 'name designation')
      .select('-signature -privateKey');
    
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    res.json({
      evidenceId: evidence.evidenceId,
      name: evidence.name,
      caseNo: evidence.caseNo,
      evidenceType: evidence.evidenceType,
      description: evidence.description,
      status: evidence.status,
      collectionDate: evidence.collectionDate,
      collectionLocation: evidence.collectionLocation,
      storageLocation: evidence.storageLocation,
      collectedBy: evidence.collectedBy?.name || 'N/A',
      currentHash: evidence.currentHash,
      createdAt: evidence.createdAt,
      isVerified: !!evidence.currentHash && !!evidence.signature
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Error fetching evidence' });
  }
};
