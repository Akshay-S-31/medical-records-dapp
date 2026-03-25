/**
 * ============================================================
 * ConnectWallet Component
 * ============================================================
 * Renders a "Connect Wallet" button that triggers MetaMask
 * connection. On success, displays the connected address and
 * lifts the { signer, address } state up to the parent.
 * ============================================================
 */

import { useState } from "react";
import { connectWallet } from "../utils/ethersProvider";

export default function ConnectWallet({ onConnected }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConnect = async () => {
        setLoading(true);
        setError("");
        try {
            const wallet = await connectWallet();
            onConnected(wallet); // lift { provider, signer, address } to App
        } catch (err) {
            setError(err.message || "Failed to connect wallet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="card max-w-md w-full text-center space-y-6">
                {/* Logo / Icon */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                    </svg>
                </div>

                <div>
                    <h1 className="text-3xl font-bold gradient-text">MedVault</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Blockchain-powered Medical Record Management
                    </p>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn-primary w-full text-lg py-3"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Connecting…
                        </span>
                    ) : (
                        "🦊 Connect MetaMask"
                    )}
                </button>

                {error && (
                    <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <p className="text-gray-600 text-xs">
                    Ensure MetaMask is installed and connected to the correct network
                </p>
            </div>
        </div>
    );
}
