# MedVault — Blockchain Medical Record Management System

A decentralized application (DApp) for secure medical record management using a hybrid on-chain / off-chain architecture.

## Architecture Overview

```
Patient                          Provider
   │                                │
   ├─ Encrypt file (AES-256)        ├─ Request record ID → Smart Contract
   ├─ Upload to IPFS (Pinata)       ├─ Get IPFS CID (if authorized)
   ├─ Store CID on-chain            ├─ Fetch encrypted file from IPFS
   └─ Grant/Revoke access           └─ Decrypt locally with passphrase
```

## Tech Stack

| Layer          | Technology                    |
|----------------|-------------------------------|
| Smart Contract | Solidity ^0.8.0               |
| Frontend       | React 18 + Vite + Tailwind v3 |
| Blockchain SDK | Ethers.js v6                  |
| Encryption     | CryptoJS AES-256-CBC          |
| IPFS Storage   | Pinata API                    |
| Backend        | Node.js + Express             |

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MetaMask** browser extension
- **Pinata** account ([app.pinata.cloud](https://app.pinata.cloud))
- Deployed smart contract address (Sepolia testnet recommended)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Pinata API keys
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your deployed contract address:
#   VITE_CONTRACT_ADDRESS=0x...
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new file and paste the contents of `smart-contract/MedicalRecordAccess.sol`
3. Compile with Solidity 0.8.x
4. Deploy to Sepolia testnet using "Injected Provider" (MetaMask)
5. Copy the deployed contract address into `frontend/.env`

## Usage Flow

### As a Patient
1. Connect MetaMask wallet
2. Select a medical record file
3. Enter an encryption passphrase → **Encrypt & Upload**
4. Enter a unique Record ID → **Add Record to Blockchain**
5. Enter a provider's wallet address → **Grant Access**

### As a Provider
1. Connect MetaMask wallet
2. Switch to **Provider Dashboard**
3. Enter the Record ID → **Request Record**
4. If authorized, the encrypted file is fetched automatically
5. Enter the decryption passphrase → **Decrypt File**
6. Download the decrypted record

## Project Structure

```
medical-records-dapp/
├── smart-contract/
│   └── MedicalRecordAccess.sol       # Solidity contract
├── backend/
│   ├── package.json
│   ├── server.js                     # Express + Pinata IPFS
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx                  # Entry point
│       ├── App.jsx                   # Root component + routing
│       ├── index.css                 # Tailwind + custom styles
│       ├── contracts/
│       │   └── MedicalRecordAccess.json  # Contract ABI
│       ├── utils/
│       │   ├── ethersProvider.js      # MetaMask + contract setup
│       │   ├── encryption.js          # AES-256 encrypt/decrypt
│       │   └── ipfs.js                # Pinata upload & fetch
│       └── components/
│           ├── ConnectWallet.jsx      # Wallet connection UI
│           ├── PatientView.jsx        # Patient dashboard
│           └── ProviderView.jsx       # Provider dashboard
└── README.md
```

## License

MIT
