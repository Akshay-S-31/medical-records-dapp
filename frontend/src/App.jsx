/**
 * ============================================================
 * App Component — Root of the Medical Records DApp
 * ============================================================
 * Manages:
 *   - Wallet connection state
 *   - Tab-based navigation between Patient View and Provider View
 * ============================================================
 */

import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import PatientView from "./components/PatientView";
import ProviderView from "./components/ProviderView";

export default function App() {
    // Wallet connection state
    const [wallet, setWallet] = useState(null); // { provider, signer, address }

    // Active tab: "patient" or "provider"
    const [activeTab, setActiveTab] = useState("patient");

    // If wallet is not connected, show the connect screen
    if (!wallet) {
        return <ConnectWallet onConnected={setWallet} />;
    }

    return (
        <div className="min-h-screen">
            {/* ---- Top Navigation Bar ---- */}
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold gradient-text">MedVault</h1>
                    </div>

                    {/* Wallet Address Badge */}
                    <div className="flex items-center gap-3">
                        <div className="status-badge bg-accent-600/20 text-accent-400 border border-accent-600/30">
                            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                            {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                        </div>
                    </div>
                </div>
            </header>

            {/* ---- Main Content ---- */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Tab Switcher */}
                <div className="flex gap-1 p-1 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 mb-6">
                    <button
                        onClick={() => setActiveTab("patient")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "patient"
                                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                            }`}
                        id="tab-patient"
                    >
                        🏥 Patient Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("provider")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === "provider"
                                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                            }`}
                        id="tab-provider"
                    >
                        👨‍⚕️ Provider Dashboard
                    </button>
                </div>

                {/* Active View */}
                {activeTab === "patient" ? (
                    <PatientView signer={wallet.signer} />
                ) : (
                    <ProviderView signer={wallet.signer} />
                )}
            </main>

            {/* ---- Footer ---- */}
            <footer className="border-t border-gray-800/60 mt-12 py-6 text-center text-xs text-gray-600">
                MedVault — Blockchain Medical Record Management System MVP
            </footer>
        </div>
    );
}
