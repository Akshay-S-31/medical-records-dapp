/**
 * ============================================================
 * Medical Records DApp — Backend Server
 * ============================================================
 * Express server that handles IPFS (Pinata) integration:
 *   POST /api/upload  — Upload encrypted file to Pinata IPFS
 *   GET  /api/file/:cid — Fetch encrypted file from IPFS gateway
 * ============================================================
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
app.use(cors({ origin: ["http://localhost:5173", "https://medical-records-dapp-eosin.vercel.app"] }));
app.use(express.json());

// Multer: store uploaded file in memory as a Buffer
const upload = multer({ storage: multer.memoryStorage() });

// --------------- Pinata Credentials ---------------
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET_API_KEY;

/**
 * POST /api/upload
 * Accepts a single file (field name: "file") and pins it to Pinata.
 * Returns the IPFS CID (IpfsHash) on success.
 */
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }

        // Build multipart form for Pinata pinFileToIPFS endpoint
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname || "encrypted-record.bin",
            contentType: req.file.mimetype || "application/octet-stream",
        });

        // Optional: add Pinata metadata
        const metadata = JSON.stringify({
            name: `medical-record-${Date.now()}`,
        });
        formData.append("pinataMetadata", metadata);

        const pinataRes = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    ...formData.getHeaders(),
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET,
                },
            }
        );

        // Return the CID to the frontend
        return res.json({ success: true, cid: pinataRes.data.IpfsHash });
    } catch (err) {
        console.error("Pinata upload error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to upload to IPFS" });
    }
});

/**
 * GET /api/file/:cid
 * Fetches an encrypted file from the IPFS gateway using its CID.
 * Returns the raw content as text (since the encrypted payload is a string).
 */
app.get("/api/file/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        // Use Pinata's dedicated gateway or the public IPFS gateway
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

        const response = await axios.get(gatewayUrl, {
            responseType: "text",
        });

        return res.send(response.data);
    } catch (err) {
        console.error("IPFS fetch error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to fetch from IPFS" });
    }
});

// --------------- Health Check ---------------
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --------------- Start Server ---------------
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
