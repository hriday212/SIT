"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/DashboardWrapper"
import { ShieldCheck, Database, Fingerprint, Coins, Cpu, Network, ArrowRight } from "lucide-react"
import { ethers } from "ethers"
import { motion } from "framer-motion"

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const ABI = [
    "function getSoilHistory(address _farmer) public view returns (tuple(uint256 timestamp, uint256 n, uint256 p, uint256 k, uint256 phLevel, uint256 temp, uint256 moisture, string targetCrop)[])",
    "function getPaymentHistory(address _farmer) public view returns (tuple(uint256 timestamp, uint256 amount, string schemeName, address sender)[])",
    "function landRecords(address) public view returns (address owner, string coordinates, uint256 areaSqMeters, bool isVerified)",
]

export default function ExplorerPage() {
    const [soilData, setSoilData] = useState<any[]>([])
    const [paymentData, setPaymentData] = useState<any[]>([])
    const [landData, setLandData] = useState<any>(null)
    const [address, setAddress] = useState<string>("")

    const loadBlockchainData = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
                const userAddress = await signer.getAddress()
                setAddress(userAddress)

                // Fetch raw blockchain data mapping tables
                const soil = await contract.getSoilHistory(userAddress)
                const payments = await contract.getPaymentHistory(userAddress)
                const land = await contract.landRecords(userAddress)

                setSoilData(soil)
                setPaymentData(payments)

                if (land.owner !== "0x0000000000000000000000000000000000000000") {
                    setLandData(land)
                }

            } catch (error) {
                console.error("Could not fetch data:", error)
            }
        }
    }

    useEffect(() => {
        loadBlockchainData()
    }, [])

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-12 pb-24">

                {/* Header Phase */}
                <div className="text-center space-y-6 pt-8">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2d3429] shadow-xl shadow-[#2d3429]/20 rounded-full text-xs font-black uppercase tracking-[0.2em] text-white">
                        <Network size={14} className="text-[#7c9473]" /> AgriPayChain Network Explorer
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-[#2d3429] tracking-tighter leading-[0.9]">
                        Live Decentralized <br /> Data Center.
                    </h1>
                    <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                        A real-time visualizer of the smart contract logic securely anchored to the Ethereum Virtual Machine (EVM). <br /> Connected Address: <br /> <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded text-[#2d3429]">{address || "Not Connected"}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Database 1: Land Registry */}
                    <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Fingerprint size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-[#f8f9f5] flex items-center justify-center text-[#2d3429] mb-6">
                                <Database size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-[#2d3429] mb-2 tracking-tighter">Land Registry mapping</h3>
                            <p className="text-sm font-bold text-neutral-400 mb-8 uppercase tracking-widest text-[10px]">Integration: Revenue Dept API</p>

                            <div className="flex-grow">
                                {landData ? (
                                    <div className="bg-neutral-50 rounded-2xl p-6 font-mono text-xs text-neutral-600 break-words space-y-4">
                                        <div><span className="text-[#7c9473] font-bold">owner:</span> <br />{landData.owner}</div>
                                        <div><span className="text-[#7c9473] font-bold">coordinates:</span> "{landData.coordinates}"</div>
                                        <div><span className="text-[#7c9473] font-bold">areaSqMeters:</span> {landData.areaSqMeters.toString()}</div>
                                        <div><span className="text-[#7c9473] font-bold">isVerified:</span> {landData.isVerified ? "true" : "false"}</div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-neutral-50 border border-neutral-100 border-dashed rounded-2xl text-neutral-400 text-sm font-bold">
                                        No land registered to this wallet address yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Database 2: IoT Soil Data */}
                    <div className="bg-[#2d3429] text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6">
                                <Database size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Soil Telemetry mapping[]</h3>
                            <p className="text-sm font-bold text-white/50 mb-8 uppercase tracking-widest text-[10px]">Integration: Farm IoT Nodes</p>

                            <div className="flex-grow space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {soilData.length > 0 ? soilData.map((data, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-4 font-mono text-xs text-white/80 border border-white/10">
                                        [{i}] =&gt; <span className="text-[#7c9473]">struct</span> SoilData {'{'} <br />
                                        &nbsp;&nbsp;timestamp: {data.timestamp.toString()}, <br />
                                        &nbsp;&nbsp;moisture: {data.moisture.toString()}%, <br />
                                        &nbsp;&nbsp;pHLevel: {data.phLevel.toString()}, <br />
                                        &nbsp;&nbsp;temperature: {data.temp.toString()}°C, <br />
                                        &nbsp;&nbsp;crop: "{data.targetCrop}" <br />
                                        {'}'}
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 border border-white/10 border-dashed rounded-2xl text-white/40 text-sm font-bold">
                                        Array is empty.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Database 3: Payment Tracking */}
                    <div className="bg-[#f8f9f5] rounded-[40px] p-8 border border-neutral-100 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Coins size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#7c9473] shadow-sm mb-6">
                                <Database size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-[#2d3429] mb-2 tracking-tighter">DBT Subsidies mapping[]</h3>
                            <p className="text-sm font-bold text-neutral-400 mb-8 uppercase tracking-widest text-[10px]">Integration: Govt Node API</p>

                            <div className="flex-grow space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {paymentData.length > 0 ? paymentData.map((pay, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 font-mono text-xs text-neutral-600 border border-neutral-100 shadow-sm">
                                        [{i}] =&gt; <span className="text-[#7c9473]">struct</span> Payment {'{'} <br />
                                        &nbsp;&nbsp;timestamp: {pay.timestamp.toString()}, <br />
                                        &nbsp;&nbsp;weiAmt: {pay.amount.toString()}, <br />
                                        &nbsp;&nbsp;scheme: "{pay.schemeName}" <br />
                                        {'}'}
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white border border-neutral-200 border-dashed rounded-2xl text-neutral-400 text-sm font-bold">
                                        No subsidies transferred yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend/Explanation Section */}
                <div className="bg-[#2d3429] rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 shadow-2xl">
                    <div className="max-w-2xl">
                        <div className="inline-flex py-1 px-3 bg-[#7c9473] text-[10px] uppercase font-black tracking-widest rounded-full mb-6">Judges & Demo Info</div>
                        <h2 className="text-3xl font-black tracking-tighter mb-4">Why Blockchain for this?</h2>
                        <ul className="space-y-4 text-white/70 font-medium text-sm">
                            <li className="flex gap-3 items-start"><ShieldCheck className="text-[#7c9473] shrink-0" size={18} /> <strong>Immutability:</strong> Soil scores cannot be faked retroactively by farmers applying for better insurance tiers.</li>
                            <li className="flex gap-3 items-start"><ShieldCheck className="text-[#7c9473] shrink-0" size={18} /> <strong>Transparency:</strong> Direct Benefit Transfers (DBT) are publicly verifiable, eradicating middlemen corruption.</li>
                            <li className="flex gap-3 items-start"><ShieldCheck className="text-[#7c9473] shrink-0" size={18} /> <strong>Interoperability:</strong> Third-party IoT providers securely push data directly into the farmer's Smart Contract.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
