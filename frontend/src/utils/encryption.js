/**
 * ============================================================
 * AES-256 File Encryption / Decryption Utility
 * ============================================================
 * Uses CryptoJS AES (AES-256-CBC) with passphrase-based key
 * derivation (PBKDF2 internally via CryptoJS).
 *
 * - encryptFile: ArrayBuffer → encrypted ciphertext string
 * - decryptFile: ciphertext string → ArrayBuffer
 * ============================================================
 */

import CryptoJS from "crypto-js";

/**
 * encryptFile(fileArrayBuffer, passphrase)
 *
 * Encrypts a file (as ArrayBuffer) using AES-256 with the
 * provided passphrase. Returns the encrypted ciphertext as
 * a Base64-encoded string.
 *
 * @param {ArrayBuffer} fileArrayBuffer — raw file bytes
 * @param {string} passphrase — secret passphrase for encryption
 * @returns {string} — Base64-encoded ciphertext
 */
export function encryptFile(fileArrayBuffer, passphrase) {
    // Convert ArrayBuffer to CryptoJS WordArray
    const wordArray = CryptoJS.lib.WordArray.create(fileArrayBuffer);

    // Encrypt using AES (CryptoJS uses AES-256-CBC with PBKDF2 key derivation)
    const encrypted = CryptoJS.AES.encrypt(wordArray, passphrase);

    // Return as Base64 string (compact for storage)
    return encrypted.toString();
}

/**
 * decryptFile(ciphertextStr, passphrase)
 *
 * Decrypts a Base64-encoded ciphertext string back to raw bytes.
 * Returns an ArrayBuffer that can be used to reconstruct the
 * original file (e.g., for download or display).
 *
 * @param {string} ciphertextStr — Base64-encoded ciphertext
 * @param {string} passphrase — the same passphrase used for encryption
 * @returns {ArrayBuffer} — decrypted file bytes
 */
export function decryptFile(ciphertextStr, passphrase) {
    // Decrypt to WordArray
    const decrypted = CryptoJS.AES.decrypt(ciphertextStr, passphrase);

    // Convert WordArray to Uint8Array → ArrayBuffer
    const typedArray = convertWordArrayToUint8Array(decrypted);
    return typedArray.buffer;
}

/**
 * Helper: Converts a CryptoJS WordArray to a Uint8Array.
 */
function convertWordArrayToUint8Array(wordArray) {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
        u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8;
}
