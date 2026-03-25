/**
 * ============================================================
 * IPFS Utility — Pinata Upload & Fetch via Backend
 * ============================================================
 * Communicates with the Express backend server to:
 *   - Upload encrypted file blobs to Pinata IPFS
 *   - Fetch encrypted files from IPFS via CID
 * ============================================================
 */

import axios from "axios";

// Backend API base URL
const API_BASE = "https://medical-records-dapp.onrender.com/api";

/**
 * uploadToIPFS(encryptedString, filename)
 *
 * Sends the encrypted ciphertext string as a file blob to the
 * backend, which pins it on Pinata. Returns the IPFS CID.
 *
 * @param {string} encryptedString — AES-256 encrypted ciphertext
 * @param {string} filename — original filename (for reference)
 * @returns {string} — IPFS CID hash
 */
export async function uploadToIPFS(encryptedString, filename = "record.enc") {
    // Convert the encrypted string to a Blob for multipart upload
    const blob = new Blob([encryptedString], { type: "application/octet-stream" });

    const formData = new FormData();
    formData.append("file", blob, filename);

    const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
        return response.data.cid;
    }

    throw new Error(response.data.error || "Upload failed");
}

/**
 * fetchFromIPFS(cid)
 *
 * Fetches an encrypted file from IPFS via the backend gateway proxy.
 * Returns the raw encrypted ciphertext string.
 *
 * @param {string} cid — IPFS content identifier
 * @returns {string} — encrypted ciphertext
 */
export async function fetchFromIPFS(cid) {
    const response = await axios.get(`${API_BASE}/file/${cid}`);
    return response.data; // raw ciphertext string
}
