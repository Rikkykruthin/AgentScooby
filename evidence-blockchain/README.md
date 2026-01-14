# CUSTAIN - Evidence Management System Using Blockchain

A MERN stack application for managing forensic evidence with **Merkle Tree** and **Digital Signatures (ECDSA)** for blockchain-grade security.

## Features

- **Multi-role Authentication** - Admin, Forensic Staff, Staff, Police
- **Evidence Management** - Full CRUD with blockchain integrity
- **Merkle Tree** - All evidence records form a Merkle tree for instant tamper detection
- **Digital Signatures (ECDSA)** - Each officer signs their entries with their private key
- **Hash Chain** - Each record links to the previous via SHA-256 hashes
- **Movement Logs** - Track evidence transport with blockchain verification
- **Access Logs** - Track officer entry/exit and evidence access
- **Integrity Verification** - Verify any evidence hasn't been tampered with
- **Dark Mode** - Toggle between light and dark themes

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Blockchain:** Merkle Tree (merkletreejs) + ECDSA (elliptic)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick Start

### 1. Start MongoDB

```bash
# If using local MongoDB
mongod
```

Or use MongoDB Atlas and update the connection string.

### 2. Install Backend Dependencies

```bash
cd evidence-blockchain/backend
npm install
```

### 3. Seed Admin User

```bash
node seed.js
```

This creates an admin user:
- Email: `admin@custain.com`
- Password: `admin123`

### 4. Start Backend Server

```bash
npm run dev
```

Server runs on http://localhost:5001

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend runs on http://localhost:3000

## Usage

1. Login as Admin (`admin@custain.com` / `admin123`)
2. Add users (Forensic, Staff, Police roles)
3. Add evidence - automatically signed with your ECDSA private key
4. View Merkle root in Dashboard
5. Use "Verify Integrity" to check any evidence for tampering

## Blockchain Security

### Merkle Tree
- All evidence forms a Merkle tree
- Root hash changes if ANY record is modified
- Proof verification for individual records

### Digital Signatures (ECDSA secp256k1)
- Each user gets a unique key pair on registration
- Every evidence entry is signed with the officer's private key
- Signature verification proves WHO added/modified data

### Hash Chain
- Each record stores its hash and previous record's hash
- Genesis block starts the chain
- Any break in chain indicates tampering

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `GET /api/auth/users` - List users (admin)

### Evidence
- `GET /api/evidence` - List all evidence
- `POST /api/evidence` - Add evidence
- `GET /api/evidence/:id` - Get single evidence
- `PUT /api/evidence/:id` - Update evidence
- `DELETE /api/evidence/:id` - Delete evidence
- `GET /api/evidence/:id/verify` - Verify integrity
- `GET /api/evidence/merkle/root` - Get current Merkle root

### Logs
- `GET /api/logs/movement` - Movement logs
- `POST /api/logs/movement` - Create movement log
- `GET /api/logs/access` - Access logs
- `POST /api/logs/access` - Record entry
