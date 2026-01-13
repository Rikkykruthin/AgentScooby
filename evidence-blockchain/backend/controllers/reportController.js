const PDFDocument = require('pdfkit');
const Evidence = require('../models/Evidence');
const Case = require('../models/Case');
const MovementLog = require('../models/MovementLog');
const AccessLog = require('../models/AccessLog');

// Colors
const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  success: '#2e7d32',
  successBg: '#e8f5e9',
  info: '#1565c0',
  infoBg: '#e3f2fd',
  warning: '#f57c00',
  warningBg: '#fff3e0',
  gray: '#666666',
  lightGray: '#f5f5f5',
  border: '#e0e0e0'
};

// Draw styled header
const drawHeader = (doc, title, subtitle) => {
  // Header background
  doc.rect(0, 0, doc.page.width, 100).fill(COLORS.primary);
  
  // Logo/Title
  doc.fillColor('#ffffff')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('CUSTAIN', 50, 30);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('Evidence Management System Using Blockchain', 50, 55);
  
  // Document title on right
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text(title, 300, 35, { align: 'right', width: 200 });
  
  if (subtitle) {
    doc.fontSize(9)
       .font('Helvetica')
       .text(subtitle, 300, 55, { align: 'right', width: 200 });
  }
  
  // Generation date
  doc.fontSize(8)
     .text(`Generated: ${new Date().toLocaleString()}`, 300, 70, { align: 'right', width: 200 });
  
  doc.fillColor('#000000');
  doc.y = 120;
};

// Draw section title
const drawSectionTitle = (doc, title, icon = '●') => {
  doc.moveDown(0.8);
  doc.fillColor(COLORS.primary)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(`${icon} ${title.toUpperCase()}`);
  doc.moveTo(50, doc.y + 3).lineTo(250, doc.y + 3).lineWidth(2).stroke(COLORS.accent);
  doc.moveDown(0.5);
  doc.fillColor('#000000');
};

// Draw info row
const drawInfoRow = (doc, label, value, x = 50, width = 500) => {
  const y = doc.y;
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .fillColor(COLORS.gray)
     .text(label, x, y, { width: 120 });
  doc.font('Helvetica')
     .fillColor('#000000')
     .text(value || 'N/A', x + 125, y, { width: width - 125 });
  doc.moveDown(0.4);
};

// Draw two column info
const drawTwoColumnInfo = (doc, data) => {
  const startY = doc.y;
  const col1X = 50, col2X = 300;
  let maxY = startY;
  
  data.forEach((item, i) => {
    const x = i % 2 === 0 ? col1X : col2X;
    const y = startY + Math.floor(i / 2) * 22;
    
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .fillColor(COLORS.gray)
       .text(item.label, x, y);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#000000')
       .text(item.value || 'N/A', x, y + 10);
    
    maxY = Math.max(maxY, y + 25);
  });
  
  doc.y = maxY;
};

// Draw info box
const drawInfoBox = (doc, data, bgColor = COLORS.lightGray, borderColor = COLORS.border) => {
  const boxHeight = 70;
  const startY = doc.y;
  
  doc.rect(50, startY, 500, boxHeight)
     .fillAndStroke(bgColor, borderColor);
  
  doc.y = startY + 12;
  
  // Title line
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text(data.title, 65, doc.y);
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(COLORS.gray)
     .text(data.subtitle, 65, doc.y + 5);
  
  // Right side info
  if (data.rightInfo) {
    let rightY = startY + 12;
    data.rightInfo.forEach(item => {
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(COLORS.gray)
         .text(`${item.label}: `, 380, rightY, { continued: true })
         .fillColor('#000000')
         .text(item.value);
      rightY += 14;
    });
  }
  
  doc.fillColor('#000000');
  doc.y = startY + boxHeight + 15;
};

// Draw table
const drawTable = (doc, headers, rows, options = {}) => {
  const { colWidths = [], startX = 50 } = options;
  const defaultWidth = (500 - (headers.length - 1) * 5) / headers.length;
  const widths = headers.map((_, i) => colWidths[i] || defaultWidth);
  
  let currentX = startX;
  const headerY = doc.y;
  
  // Header background
  doc.rect(startX, headerY - 3, 500, 18).fill(COLORS.primary);
  
  // Header text
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, currentX + 5, headerY, { width: widths[i] - 10 });
    currentX += widths[i];
  });
  
  doc.fillColor('#000000').font('Helvetica').fontSize(8);
  let rowY = headerY + 20;
  
  rows.forEach((row, rowIndex) => {
    if (rowY > 720) return; // Prevent overflow
    
    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.rect(startX, rowY - 3, 500, 16).fill('#fafafa');
    }
    
    currentX = startX;
    doc.fillColor('#000000');
    row.forEach((cell, i) => {
      doc.text(String(cell || '-'), currentX + 5, rowY, { width: widths[i] - 10 });
      currentX += widths[i];
    });
    rowY += 18;
  });
  
  doc.y = rowY + 5;
};

// Draw verification badge
const drawVerificationBadge = (doc, isVerified = true) => {
  const y = doc.y;
  const bgColor = isVerified ? COLORS.successBg : '#ffebee';
  const textColor = isVerified ? COLORS.success : '#c62828';
  const text = isVerified ? '✓ BLOCKCHAIN VERIFIED' : '✗ VERIFICATION PENDING';
  const subtext = isVerified 
    ? 'This document is protected by cryptographic hash chain and digital signatures'
    : 'Blockchain verification is pending for this evidence';
  
  doc.rect(50, y, 500, 50).fillAndStroke(bgColor, isVerified ? COLORS.success : '#c62828');
  
  doc.fillColor(textColor)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(text, 60, y + 12, { width: 480, align: 'center' });
  
  doc.fontSize(8)
     .font('Helvetica')
     .text(subtext, 60, y + 30, { width: 480, align: 'center' });
  
  doc.fillColor('#000000');
  doc.y = y + 60;
};

// Draw footer
const drawFooter = (doc, pageNum = 1) => {
  const y = doc.page.height - 40;
  doc.rect(0, y - 10, doc.page.width, 50).fill(COLORS.lightGray);
  
  doc.fillColor(COLORS.gray)
     .fontSize(7)
     .font('Helvetica')
     .text('This document is blockchain-verified and tamper-evident. Any modification will invalidate the hash chain.', 50, y, { align: 'center', width: 500 })
     .text(`Page ${pageNum} | CUSTAIN Evidence Management System | Confidential`, 50, y + 12, { align: 'center', width: 500 });
  
  doc.fillColor('#000000');
};

// Generate Evidence Report PDF
exports.generateEvidenceReport = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('collectedBy', 'name designation email')
      .populate('signedBy', 'name designation');

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Evidence-Report-${evidence.evidenceId}.pdf`);
    
    doc.pipe(res);

    // Header
    drawHeader(doc, 'EVIDENCE REPORT', `Report #${evidence.evidenceId}`);

    // Evidence ID Box
    drawInfoBox(doc, {
      title: evidence.evidenceId,
      subtitle: evidence.name,
      rightInfo: [
        { label: 'Case No', value: evidence.caseNo },
        { label: 'Type', value: evidence.evidenceType || 'N/A' },
        { label: 'Status', value: evidence.status }
      ]
    }, COLORS.infoBg, COLORS.info);

    // Description
    drawSectionTitle(doc, 'Description', '📋');
    doc.fontSize(10).font('Helvetica').text(evidence.description || 'No description provided', { width: 500 });
    
    // Collection Details
    drawSectionTitle(doc, 'Collection Details', '📍');
    drawTwoColumnInfo(doc, [
      { label: 'Collected By', value: evidence.collectedBy?.name || 'N/A' },
      { label: 'Designation', value: evidence.collectedBy?.designation || 'N/A' },
      { label: 'Collection Date', value: evidence.collectionDate ? new Date(evidence.collectionDate).toLocaleString() : new Date(evidence.createdAt).toLocaleString() },
      { label: 'Location', value: evidence.collectionLocation || 'N/A' }
    ]);

    // Storage Details
    drawSectionTitle(doc, 'Storage Information', '🗄️');
    drawTwoColumnInfo(doc, [
      { label: 'Storage Location', value: evidence.storageLocation || 'N/A' },
      { label: 'Storage Pointer', value: evidence.storagePointer || 'N/A' },
      { label: 'Attachments', value: evidence.attachments?.length ? `${evidence.attachments.length} file(s)` : 'None' },
      { label: 'Created At', value: new Date(evidence.createdAt).toLocaleString() }
    ]);

    // Blockchain Verification
    drawSectionTitle(doc, 'Blockchain Verification', '🔐');
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.gray).text('CURRENT HASH (SHA-256)');
    doc.fontSize(7).font('Courier').fillColor('#000000').text(evidence.currentHash || 'Not yet hashed');
    doc.moveDown(0.4);
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.gray).text('PREVIOUS HASH');
    doc.fontSize(7).font('Courier').fillColor('#000000').text(evidence.previousHash || 'Genesis Block (First in chain)');
    doc.moveDown(0.4);
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.gray).text('DIGITAL SIGNATURE');
    doc.fontSize(7).font('Courier').fillColor('#000000').text(evidence.signature ? evidence.signature.substring(0, 100) + '...' : 'Not signed');
    doc.moveDown(0.4);
    
    drawTwoColumnInfo(doc, [
      { label: 'Signed By', value: evidence.signedBy?.name || 'N/A' },
      { label: 'Signed At', value: evidence.signedTimestamp ? new Date(evidence.signedTimestamp).toLocaleString() : 'N/A' }
    ]);

    doc.moveDown(1);
    
    // Verification Badge
    drawVerificationBadge(doc, !!evidence.currentHash && !!evidence.signature);

    drawFooter(doc, 1);
    doc.end();

  } catch (error) {
    console.error('Generate evidence report error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Generate Chain of Custody Certificate
exports.generateCustodyCertificate = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('collectedBy', 'name designation');

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const movements = await MovementLog.find({ evidenceId: evidence._id })
      .populate('movedBy', 'name designation')
      .sort({ createdAt: 1 });

    const accessLogs = await AccessLog.find({ evidenceId: evidence._id })
      .populate('accessedBy', 'name designation')
      .sort({ createdAt: -1 })
      .limit(10);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Chain-of-Custody-${evidence.evidenceId}.pdf`);
    
    doc.pipe(res);

    // Header
    drawHeader(doc, 'CHAIN OF CUSTODY', 'Certificate');

    // Evidence Info Box
    drawInfoBox(doc, {
      title: evidence.evidenceId,
      subtitle: evidence.name,
      rightInfo: [
        { label: 'Case No', value: evidence.caseNo },
        { label: 'Type', value: evidence.evidenceType || 'N/A' },
        { label: 'Status', value: evidence.status }
      ]
    }, COLORS.warningBg, COLORS.warning);

    // Initial Collection
    drawSectionTitle(doc, 'Initial Collection', '📍');
    drawTwoColumnInfo(doc, [
      { label: 'Collecting Officer', value: evidence.collectedBy?.name || 'N/A' },
      { label: 'Designation', value: evidence.collectedBy?.designation || 'N/A' },
      { label: 'Collection Date', value: evidence.collectionDate ? new Date(evidence.collectionDate).toLocaleString() : new Date(evidence.createdAt).toLocaleString() },
      { label: 'Location', value: evidence.collectionLocation || 'N/A' }
    ]);

    // Movement History
    drawSectionTitle(doc, 'Custody Transfer History', '🔄');
    
    if (movements.length > 0) {
      const rows = movements.map(m => [
        new Date(m.createdAt).toLocaleDateString(),
        new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        m.fromLocation || 'N/A',
        m.toLocation || 'N/A',
        m.movedBy?.name || 'N/A',
        m.reason || '-'
      ]);
      
      drawTable(doc, 
        ['Date', 'Time', 'From', 'To', 'Officer', 'Reason'],
        rows,
        { colWidths: [70, 50, 90, 90, 100, 100] }
      );
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gray)
         .text('No custody transfers recorded. Evidence remains with initial collector.', { align: 'center' });
      doc.moveDown(1);
    }

    // Access Log Summary
    drawSectionTitle(doc, 'Recent Access Log', '👁️');
    doc.fontSize(9).font('Helvetica').text(`Total Access Events: ${accessLogs.length}`);
    doc.moveDown(0.5);
    
    if (accessLogs.length > 0) {
      const accessRows = accessLogs.slice(0, 8).map(a => [
        new Date(a.createdAt).toLocaleDateString(),
        new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        a.accessedBy?.name || 'Unknown',
        a.action || 'View',
        a.ipAddress || '-'
      ]);
      
      drawTable(doc,
        ['Date', 'Time', 'Officer', 'Action', 'IP Address'],
        accessRows,
        { colWidths: [80, 60, 150, 80, 130] }
      );
    }

    // Blockchain Integrity
    drawSectionTitle(doc, 'Blockchain Integrity', '🔐');
    drawTwoColumnInfo(doc, [
      { label: 'Hash', value: evidence.currentHash ? evidence.currentHash.substring(0, 40) + '...' : 'N/A' },
      { label: 'Signature', value: evidence.signature ? 'Valid ✓' : 'Not Signed' },
      { label: 'Merkle Proof', value: evidence.merkleProof ? 'Available ✓' : 'N/A' },
      { label: 'Chain Status', value: evidence.previousHash ? 'Linked ✓' : 'Genesis' }
    ]);

    doc.moveDown(1);

    // Certificate Box
    const certY = doc.y;
    doc.rect(50, certY, 500, 70).fillAndStroke(COLORS.infoBg, COLORS.info);
    
    doc.fillColor(COLORS.info)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF CHAIN OF CUSTODY', 60, certY + 15, { width: 480, align: 'center' });
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('This certificate verifies that the chain of custody for the above evidence has been', 60, certY + 35, { width: 480, align: 'center' })
       .text('maintained and all transfers are recorded with blockchain verification.', 60, certY + 48, { width: 480, align: 'center' });

    drawFooter(doc, 1);
    doc.end();

  } catch (error) {
    console.error('Generate custody certificate error:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
};

// Generate Case Summary Report
exports.generateCaseReport = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('assignedOfficer', 'name designation')
      .populate('createdBy', 'name designation');

    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const evidence = await Evidence.find({ caseNo: caseData.caseNo })
      .populate('collectedBy', 'name');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Case-Report-${caseData.caseId}.pdf`);
    
    doc.pipe(res);

    // Header
    drawHeader(doc, 'CASE SUMMARY', `Report #${caseData.caseId}`);

    // Case Info Box
    drawInfoBox(doc, {
      title: caseData.title,
      subtitle: `Case No: ${caseData.caseNo}`,
      rightInfo: [
        { label: 'Status', value: caseData.status },
        { label: 'Priority', value: caseData.priority },
        { label: 'Type', value: caseData.type }
      ]
    }, COLORS.warningBg, COLORS.warning);

    // Case Details
    drawSectionTitle(doc, 'Case Details', '📁');
    doc.fontSize(10).font('Helvetica').text(caseData.description, { width: 500 });
    doc.moveDown(0.5);
    
    drawTwoColumnInfo(doc, [
      { label: 'Filed On', value: new Date(caseData.filingDate).toLocaleDateString() },
      { label: 'Location', value: caseData.location || 'N/A' },
      { label: 'Assigned Officer', value: caseData.assignedOfficer?.name || 'Unassigned' },
      { label: 'Created By', value: caseData.createdBy?.name || 'N/A' }
    ]);

    if (caseData.notes) {
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.gray).text('NOTES');
      doc.fontSize(9).font('Helvetica').fillColor('#000000').text(caseData.notes);
    }

    // Evidence List
    drawSectionTitle(doc, `Linked Evidence (${evidence.length})`, '📦');
    
    if (evidence.length > 0) {
      const rows = evidence.map(ev => [
        ev.evidenceId,
        ev.name,
        ev.evidenceType || 'N/A',
        ev.status,
        ev.collectedBy?.name || 'N/A',
        new Date(ev.createdAt).toLocaleDateString()
      ]);
      
      drawTable(doc,
        ['ID', 'Name', 'Type', 'Status', 'Collected By', 'Date'],
        rows,
        { colWidths: [70, 130, 70, 70, 90, 70] }
      );
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gray)
         .text('No evidence linked to this case.', { align: 'center' });
      doc.moveDown(1);
    }

    // Statistics
    drawSectionTitle(doc, 'Case Statistics', '📊');
    
    const duration = caseData.closedDate 
      ? Math.ceil((new Date(caseData.closedDate) - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date() - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24));

    // Stats boxes
    const statsY = doc.y;
    const boxWidth = 120;
    const stats = [
      { label: 'Duration', value: `${duration} days`, color: COLORS.info },
      { label: 'Evidence', value: evidence.length.toString(), color: COLORS.success },
      { label: 'Status', value: caseData.status, color: COLORS.warning },
      { label: 'Priority', value: caseData.priority, color: COLORS.primary }
    ];

    stats.forEach((stat, i) => {
      const x = 50 + i * (boxWidth + 10);
      doc.rect(x, statsY, boxWidth, 50).fillAndStroke('#f8f9fa', stat.color);
      doc.fillColor(stat.color).fontSize(18).font('Helvetica-Bold')
         .text(stat.value, x, statsY + 10, { width: boxWidth, align: 'center' });
      doc.fontSize(8).font('Helvetica')
         .text(stat.label, x, statsY + 32, { width: boxWidth, align: 'center' });
    });

    doc.fillColor('#000000');
    doc.y = statsY + 70;

    if (caseData.closedDate) {
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica')
         .text(`Case Closed: ${new Date(caseData.closedDate).toLocaleDateString()}`);
    }

    drawFooter(doc, 1);
    doc.end();

  } catch (error) {
    console.error('Generate case report error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};
