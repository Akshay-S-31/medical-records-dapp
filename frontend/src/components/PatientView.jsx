/**
 * ============================================================
 * PatientView Component
 * ============================================================
 * Dashboard for patients to:
 *   1. Select & encrypt a medical record file (AES-256)
 *   2. Upload encrypted file to IPFS via backend → get CID
 *   3. Register the CID on-chain via addRecord(recordId, cid)
 *   4. Grant / Revoke access to healthcare providers
 * ============================================================
 */

import { useState } from "react";
import { getContract } from "../utils/ethersProvider";
import { encryptFile } from "../utils/encryption";
import { uploadToIPFS } from "../utils/ipfs";

export default function PatientView({ signer }) {
    // ---- File Upload & Encryption State ----
    const [file, setFile] = useState(null);
    const [passphrase, setPassphrase] = useState("");
    const [cid, setCid] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    // ---- On-chain Record Registration State ----
    const [recordId, setRecordId] = useState("");
    const [registerStatus, setRegisterStatus] = useState("");

    // ---- Access Control State ----
    const [providerAddress, setProviderAddress] = useState("");
    const [accessStatus, setAccessStatus] = useState("");

    // ---- Loading States ----
    const [uploading, setUploading] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [granting, setGranting] = useState(false);
    const [revoking, setRevoking] = useState(false);

    // ==============================================
    // Step 1: Encrypt file & upload to IPFS
    // ==============================================
    const handleEncryptAndUpload = async () => {
        if (!file) return setUploadStatus("❌ Please select a file first.");
        if (!passphrase) return setUploadStatus("❌ Please enter an encryption passphrase.");

        try {
            setUploading(true);
            setUploadStatus("🔐 Encrypting file with AES-256…");

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Encrypt file content
            const encrypted = encryptFile(arrayBuffer, passphrase);

            setUploadStatus("📤 Uploading encrypted file to IPFS…");

            // Upload to IPFS via backend
            const ipfsCid = await uploadToIPFS(encrypted, file.name + ".enc");

            setCid(ipfsCid);
            setUploadStatus(`✅ Uploaded! CID: ${ipfsCid}`);
        } catch (err) {
            console.error(err);
            setUploadStatus(`❌ Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    // ==============================================
    // Step 2: Register CID on blockchain
    // ==============================================
    const handleAddRecord = async () => {
        if (!recordId) return setRegisterStatus("❌ Enter a Record ID.");
        if (!cid) return setRegisterStatus("❌ Upload a file first to get a CID.");

        try {
            setRegistering(true);
            setRegisterStatus("⏳ Sending transaction to blockchain…");

            const contract = getContract(signer);
            const tx = await contract.addRecord(BigInt(recordId), cid);
            setRegisterStatus("⛏️ Mining transaction…");
            await tx.wait();

            setRegisterStatus(`✅ Record #${recordId} registered on-chain!`);
        } catch (err) {
            console.error(err);
            setRegisterStatus(`❌ Error: ${err.reason || err.message}`);
        } finally {
            setRegistering(false);
        }
    };

    // ==============================================
    // Step 3: Grant access to a provider
    // ==============================================
    const handleGrantAccess = async () => {
        if (!providerAddress) return setAccessStatus("❌ Enter a provider wallet address.");

        try {
            setGranting(true);
            setAccessStatus("⏳ Granting access…");

            const contract = getContract(signer);
            const tx = await contract.grantAccess(providerAddress);
            await tx.wait();

            setAccessStatus(`✅ Access granted to ${providerAddress.slice(0, 6)}…${providerAddress.slice(-4)}`);
        } catch (err) {
            console.error(err);
            setAccessStatus(`❌ Error: ${err.reason || err.message}`);
        } finally {
            setGranting(false);
        }
    };

    // ==============================================
    // Step 4: Revoke access from a provider
    // ==============================================
    const handleRevokeAccess = async () => {
        if (!providerAddress) return setAccessStatus("❌ Enter a provider wallet address.");

        try {
            setRevoking(true);
            setAccessStatus("⏳ Revoking access…");

            const contract = getContract(signer);
            const tx = await contract.revokeAccess(providerAddress);
            await tx.wait();

            setAccessStatus(`✅ Access revoked from ${providerAddress.slice(0, 6)}…${providerAddress.slice(-4)}`);
        } catch (err) {
            console.error(err);
            setAccessStatus(`❌ Error: ${err.reason || err.message}`);
        } finally {
            setRevoking(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ---- Section 1: Encrypt & Upload ---- */}
            <div className="card">
                <h2 className="text-xl font-bold text-primary-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-sm">1</span>
                    Encrypt &amp; Upload Medical Record
                </h2>

                <div className="space-y-4">
                    {/* File Input */}
                    <div>
                        <label className="label-text">Select Medical Record File</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                         file:rounded-xl file:border-0 file:text-sm file:font-semibold
                         file:bg-primary-600/20 file:text-primary-300
                         hover:file:bg-primary-600/30 transition-all cursor-pointer"
                            id="patient-file-input"
                        />
                        {file && (
                            <p className="text-xs text-gray-500 mt-1">
                                📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    {/* Passphrase */}
                    <div>
                        <label className="label-text" htmlFor="patient-passphrase">
                            Encryption Passphrase
                        </label>
                        <input
                            id="patient-passphrase"
                            type="password"
                            placeholder="Enter a strong passphrase…"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleEncryptAndUpload}
                        disabled={uploading}
                        className="btn-primary"
                        id="btn-encrypt-upload"
                    >
                        {uploading ? "Processing…" : "🔐 Encrypt & Upload to IPFS"}
                    </button>

                    {/* Status */}
                    {uploadStatus && (
                        <p className={`text-sm mt-2 ${uploadStatus.startsWith("✅") ? "text-accent-400" : uploadStatus.startsWith("❌") ? "text-red-400" : "text-yellow-400"}`}>
                            {uploadStatus}
                        </p>
                    )}

                    {/* CID Display */}
                    {cid && (
                        <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">IPFS Content Identifier (CID)</p>
                            <code className="text-accent-400 text-sm break-all">{cid}</code>
                        </div>
                    )}
                </div>
            </div>

            {/* ---- Section 2: Register on Blockchain ---- */}
            <div className="card">
                <h2 className="text-xl font-bold text-primary-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-sm">2</span>
                    Register Record On-Chain
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="label-text" htmlFor="patient-record-id">
                            Record ID (unique number)
                        </label>
                        <input
                            id="patient-record-id"
                            type="number"
                            placeholder="e.g. 1001"
                            value={recordId}
                            onChange={(e) => setRecordId(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <button
                        onClick={handleAddRecord}
                        disabled={registering || !cid}
                        className="btn-accent"
                        id="btn-add-record"
                    >
                        {registering ? "Mining…" : "⛓️ Add Record to Blockchain"}
                    </button>

                    {registerStatus && (
                        <p className={`text-sm ${registerStatus.startsWith("✅") ? "text-accent-400" : registerStatus.startsWith("❌") ? "text-red-400" : "text-yellow-400"}`}>
                            {registerStatus}
                        </p>
                    )}
                </div>
            </div>

            {/* ---- Section 3: Access Control ---- */}
            <div className="card">
                <h2 className="text-xl font-bold text-primary-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center text-sm">3</span>
                    Manage Provider Access
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="label-text" htmlFor="provider-address">
                            Provider Wallet Address
                        </label>
                        <input
                            id="provider-address"
                            type="text"
                            placeholder="0x…"
                            value={providerAddress}
                            onChange={(e) => setProviderAddress(e.target.value)}
                            className="input-field font-mono text-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleGrantAccess}
                            disabled={granting}
                            className="btn-accent flex-1"
                            id="btn-grant-access"
                        >
                            {granting ? "Processing…" : "✅ Grant Access"}
                        </button>
                        <button
                            onClick={handleRevokeAccess}
                            disabled={revoking}
                            className="btn-danger flex-1"
                            id="btn-revoke-access"
                        >
                            {revoking ? "Processing…" : "🚫 Revoke Access"}
                        </button>
                    </div>

                    {accessStatus && (
                        <p className={`text-sm ${accessStatus.startsWith("✅") ? "text-accent-400" : accessStatus.startsWith("❌") ? "text-red-400" : "text-yellow-400"}`}>
                            {accessStatus}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
