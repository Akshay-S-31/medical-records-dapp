/**
 * ============================================================
 * ProviderView Component
 * ============================================================
 * Dashboard for healthcare providers to:
 *   1. Request a medical record by ID (calls requestRecord on-chain)
 *   2. If authorized, fetch the encrypted file from IPFS via CID
 *   3. Decrypt the file locally and provide a download link
 * ============================================================
 */

import { useState } from "react";
import { getContract } from "../utils/ethersProvider";
import { fetchFromIPFS } from "../utils/ipfs";
import { decryptFile } from "../utils/encryption";

export default function ProviderView({ signer }) {
    // ---- Request State ----
    const [recordId, setRecordId] = useState("");
    const [requestStatus, setRequestStatus] = useState("");
    const [fetchedCid, setFetchedCid] = useState("");

    // ---- Encrypted Data State ----
    const [encryptedData, setEncryptedData] = useState("");

    // ---- Decryption State ----
    const [passphrase, setPassphrase] = useState("");
    const [decryptStatus, setDecryptStatus] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");

    // ---- Loading States ----
    const [requesting, setRequesting] = useState(false);
    const [decrypting, setDecrypting] = useState(false);

    // ==============================================
    // Step 1: Request record from smart contract
    // ==============================================
    const handleRequestRecord = async () => {
        if (!recordId) return setRequestStatus("❌ Please enter a Record ID.");

        try {
            setRequesting(true);
            setRequestStatus("⏳ Querying smart contract…");
            setFetchedCid("");
            setEncryptedData("");
            setDownloadUrl("");

            const contract = getContract(signer);

            // Call the view function — returns CID if authorized
            const cid = await contract.requestRecord(BigInt(recordId));

            setFetchedCid(cid);
            setRequestStatus(`✅ Access granted! CID: ${cid}`);

            // Automatically fetch from IPFS
            setRequestStatus("📥 Fetching encrypted file from IPFS…");
            const data = await fetchFromIPFS(cid);
            setEncryptedData(data);
            setRequestStatus("✅ Encrypted file retrieved. Enter passphrase to decrypt.");
        } catch (err) {
            console.error(err);

            // Parse revert reasons from the smart contract
            const reason = err.reason || err.message || "Unknown error";
            if (reason.includes("ACCESS DENIED")) {
                setRequestStatus("🚫 ACCESS DENIED: You are not authorized to view this record.");
            } else if (reason.includes("does not exist")) {
                setRequestStatus("❌ Record does not exist on the blockchain.");
            } else {
                setRequestStatus(`❌ Error: ${reason}`);
            }
        } finally {
            setRequesting(false);
        }
    };

    // ==============================================
    // Step 2: Decrypt the fetched file
    // ==============================================
    const handleDecrypt = () => {
        if (!encryptedData) return setDecryptStatus("❌ No encrypted data to decrypt.");
        if (!passphrase) return setDecryptStatus("❌ Please enter the decryption passphrase.");

        try {
            setDecrypting(true);
            setDecryptStatus("🔓 Decrypting file…");

            const decryptedBuffer = decryptFile(encryptedData, passphrase);

            // Create a downloadable blob URL
            const blob = new Blob([decryptedBuffer]);
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

            setDecryptStatus("✅ File decrypted successfully! Click to download.");
        } catch (err) {
            console.error(err);
            setDecryptStatus("❌ Decryption failed. Incorrect passphrase or corrupted data.");
        } finally {
            setDecrypting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ---- Section 1: Request Record ---- */}
            <div className="card">
                <h2 className="text-xl font-bold text-primary-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-sm">1</span>
                    Request Medical Record
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="label-text" htmlFor="provider-record-id">
                            Record ID
                        </label>
                        <input
                            id="provider-record-id"
                            type="number"
                            placeholder="Enter the record ID…"
                            value={recordId}
                            onChange={(e) => setRecordId(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <button
                        onClick={handleRequestRecord}
                        disabled={requesting}
                        className="btn-primary"
                        id="btn-request-record"
                    >
                        {requesting ? "Querying…" : "🔍 Request Record from Blockchain"}
                    </button>

                    {/* Status */}
                    {requestStatus && (
                        <p className={`text-sm ${requestStatus.startsWith("✅") ? "text-accent-400" :
                                requestStatus.startsWith("❌") || requestStatus.startsWith("🚫") ? "text-red-400" :
                                    "text-yellow-400"
                            }`}>
                            {requestStatus}
                        </p>
                    )}

                    {/* CID Display */}
                    {fetchedCid && (
                        <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">Retrieved IPFS CID</p>
                            <code className="text-accent-400 text-sm break-all">{fetchedCid}</code>
                        </div>
                    )}
                </div>
            </div>

            {/* ---- Section 2: Decrypt File ---- */}
            {encryptedData && (
                <div className="card">
                    <h2 className="text-xl font-bold text-primary-300 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-sm">2</span>
                        Decrypt Medical Record
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label-text" htmlFor="decrypt-passphrase">
                                Decryption Passphrase
                            </label>
                            <input
                                id="decrypt-passphrase"
                                type="password"
                                placeholder="Enter the passphrase used during encryption…"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <button
                            onClick={handleDecrypt}
                            disabled={decrypting}
                            className="btn-accent"
                            id="btn-decrypt"
                        >
                            {decrypting ? "Decrypting…" : "🔓 Decrypt File"}
                        </button>

                        {/* Status */}
                        {decryptStatus && (
                            <p className={`text-sm ${decryptStatus.startsWith("✅") ? "text-accent-400" : decryptStatus.startsWith("❌") ? "text-red-400" : "text-yellow-400"}`}>
                                {decryptStatus}
                            </p>
                        )}

                        {/* Download Link */}
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                download={`record-${recordId}-decrypted`}
                                className="inline-flex items-center gap-2 bg-accent-600/20 border border-accent-600/40
                           text-accent-400 font-medium px-5 py-3 rounded-xl hover:bg-accent-600/30
                           transition-all"
                                id="link-download-decrypted"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Decrypted File
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* ---- Info Card ---- */}
            <div className="card border-primary-800/50 bg-primary-900/20">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-primary-300">How it works</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            The smart contract verifies your authorization before returning the IPFS CID.
                            All decryption happens locally in your browser — the raw file never travels over the network.
                            You need the correct passphrase that the patient used during encryption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
