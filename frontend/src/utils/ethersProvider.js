/**
 * ============================================================
 * Ethers.js Provider Utility
 * ============================================================
 * Handles MetaMask connection and smart contract instantiation
 * using Ethers.js v6.
 * ============================================================
 */

import { BrowserProvider, Contract } from "ethers";
import contractArtifact from "../contracts/MedicalRecordAccess.json";

// Deployed contract address — set via VITE_CONTRACT_ADDRESS in .env
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * connectWallet()
 * Prompts MetaMask to connect and returns the provider, signer,
 * and connected wallet address.
 *
 * @returns {{ provider: BrowserProvider, signer: JsonRpcSigner, address: string }}
 */
export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error(
            "MetaMask is not installed. Please install it to use this DApp."
        );
    }

    // Request account access from MetaMask
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
}

/**
 * getContract(signer)
 * Returns an ethers.js Contract instance connected to the
 * MedicalRecordAccess smart contract.
 *
 * @param {JsonRpcSigner} signer — the connected wallet signer
 * @returns {Contract}
 */
export function getContract(signer) {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.startsWith("0xYOUR")) {
        throw new Error(
            "Contract address not set. Please set VITE_CONTRACT_ADDRESS in frontend/.env"
        );
    }

    return new Contract(CONTRACT_ADDRESS, contractArtifact.abi, signer);
}
