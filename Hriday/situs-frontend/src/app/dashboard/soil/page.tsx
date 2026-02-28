"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/DashboardWrapper"
import { Beaker, Zap } from "lucide-react"
import { ethers } from "ethers"

// Hardhat Local Node Deployment Address
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const ABI = [
    "function logSoilData(uint256 _n, uint256 _p, uint256 _k, uint256 _phLevel, uint256 _temp, uint256 _moisture, string memory _targetCrop) public",
    "function getSoilHistory(address _farmer) public view returns (tuple(uint256 timestamp, uint256 n, uint256 p, uint256 k, uint256 phLevel, uint256 temp, uint256 moisture, string targetCrop)[])"
]

export default function CustomSoilPortal() {
    // Form State
    const [farmerName, setFarmerName] = useState("Rajesh Kumar")
    const [soilType, setSoilType] = useState("Alluvial")
    const [targetCrop, setTargetCrop] = useState("Wheat")

    // Telemetry State
    const [n, setN] = useState("70")
    const [p, setP] = useState("50")
    const [k, setK] = useState("40")
    const [ph, setPh] = useState("6")
    const [temp, setTemp] = useState("25")
    const [moisture, setMoisture] = useState("45")

    // UI State
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [hasResult, setHasResult] = useState(false)
    const [score, setScore] = useState(0)
    const [history, setHistory] = useState<any[]>([])

    // IoT Auto-polling effect (Polls API every 2 seconds for fresh Wokwi data)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/soil/iot-ingest')
                const json = await res.json()
                if (json.success && json.data) {
                    const d = json.data
                    // Assuming ESP32 sends temperature, humidity/moisture etc.
                    if (d.temperature) setTemp(d.temperature)
                    if (d.humidity) setMoisture(d.humidity)
                    if (d.n) setN(d.n)
                    if (d.p) setP(d.p)
                    if (d.k) setK(d.k)
                    if (d.ph) setPh(d.ph)
                }
            } catch (e) {
                // Ignore silent poll errors
            }
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const loadHistory = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
                const data = await contract.getSoilHistory(await signer.getAddress())
                setHistory([...data].reverse()) // Show newest first
            } catch (error) {
                console.warn("Blockchain read failed (likely wrong network or no history): mapping returned 0x.")
                setHistory([])
            }
        }
    }

    useEffect(() => { loadHistory() }, [])

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsAnalyzing(true)

        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

                // Call the Smart Contract with 6 metrics + crop
                const tx = await contract.logSoilData(
                    parseInt(n), parseInt(p), parseInt(k), parseInt(ph), parseInt(temp), parseInt(moisture), targetCrop
                )

                await tx.wait() // Wait for block verification

                // Calculate dummy score based on NPK
                const calculatedScore = Math.min(100, Math.floor((parseInt(n) + parseInt(p) + parseInt(k)) / 2))
                setScore(calculatedScore)
                setHasResult(true)
                loadHistory()

            } catch (error: any) {
                console.error(error)
                alert("Transaction Failed. Check MetaMask.")
            }
        } else {
            alert("MetaMask is not installed.")
        }
        setIsAnalyzing(false)
    }

    const getGaugeColor = () => {
        if (score > 80) return "#7c9473"
        if (score > 50) return "#a3b18a"
        return "#c9a66b"
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto py-8">

                {/* Header matching custom HTML */}
                <header className="mb-12 text-center flex flex-col items-center">
                    <div className="inline-block px-4 py-2 bg-[#7c9473]/10 text-[#7c9473] rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-[#7c9473]/20">
                        🔵 Satellite & IoT Sync Active
                    </div>
                    <h1 className="text-5xl md:text-[3.5rem] font-black tracking-tighter uppercase leading-none text-[#2d3429]">
                        Soil Analysis Portal
                    </h1>
                </header>

                <div className="flex flex-col gap-10 max-w-3xl mx-auto">

                    {/* Input Card */}
                    <div className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-xl relative overflow-hidden">
                        <Beaker className="absolute top-12 right-12 opacity-5 w-32 h-32 text-[#2d3429]" />

                        <h2 className="font-black uppercase mb-10 tracking-tight text-2xl text-[#2d3429]">Telemetry Input</h2>

                        <form onSubmit={handleAnalyze}>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Farmer Name / शेतकऱ्याचे नाव</label>
                                    <input type="text" value={farmerName} onChange={e => setFarmerName(e.target.value)} className="bg-[#fcfcf9] border border-[#f0f0eb] p-4 rounded-2xl font-bold focus:outline-none focus:border-[#7c9473]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Soil Type / मातीचा प्रकार</label>
                                    <select value={soilType} onChange={e => setSoilType(e.target.value)} className="bg-[#fcfcf9] border border-[#f0f0eb] p-4 rounded-2xl font-bold focus:outline-none focus:border-[#7c9473]">
                                        <option>Alluvial / गाळाची</option>
                                        <option>Black / काळी</option>
                                        <option>Red / तांबडी</option>
                                        <option>Laterite / जांभी</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Crop / पीक</label>
                                    <select value={targetCrop} onChange={e => setTargetCrop(e.target.value)} className="bg-[#fcfcf9] border border-[#f0f0eb] p-4 rounded-2xl font-bold focus:outline-none focus:border-[#7c9473]">
                                        <option value="Wheat">Wheat / गहू</option>
                                        <option value="Rice">Rice / तांदूळ</option>
                                        <option value="Maize">Maize / मक्का</option>
                                        <option value="Cotton">Cotton / कापूस</option>
                                        <option value="Sugarcane">Sugarcane / ऊस</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: "Nitrogen (N)", val: n, set: setN },
                                    { label: "Phosphorus", val: p, set: setP },
                                    { label: "Potassium", val: k, set: setK },
                                    { label: "Soil PH", val: ph, set: setPh },
                                    { label: "Temp (°C)", val: temp, set: setTemp },
                                    { label: "Moisture", val: moisture, set: setMoisture }
                                ].map((field, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">{field.label}</label>
                                        <input type="number" value={field.val} onChange={e => field.set(e.target.value)} className="bg-[#fcfcf9] border border-[#f0f0eb] p-3 rounded-xl font-bold focus:outline-none focus:border-[#7c9473]" />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isAnalyzing}
                                className="w-full p-6 bg-[#2d3429] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-[#7c9473] hover:-translate-y-1 transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                            >
                                {isAnalyzing ? "Anchoring to Blockchain..." : (
                                    <><Zap size={18} /> Analyze & Block-Sign Quality Score</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Result Panel */}
                    {hasResult && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-xl text-center animate-in fade-in slide-in-from-bottom-5">
                            <h2 className="font-black uppercase mb-8 text-xs tracking-[0.1em] text-gray-400">Current Analysis Results</h2>

                            <div className="flex flex-col items-center justify-center">
                                <div
                                    className="w-[220px] h-[220px] rounded-full border-[15px] flex items-center justify-center mb-8 transition-colors duration-1000"
                                    style={{ borderColor: getGaugeColor() }}
                                >
                                    <span className="text-6xl font-black tracking-tighter text-[#2d3429]">{score}%</span>
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-widest mb-4" style={{ color: getGaugeColor() }}>
                                    {score > 80 ? "Optimal" : score > 50 ? "Moderate" : "Critical"}
                                </h3>
                                <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                                    {score > 80
                                        ? `Excellent conditions for ${targetCrop}. Nitrogen and pH levels are optimal for high yield.`
                                        : score > 50
                                            ? `Good overall quality for ${targetCrop}. Consider balancing NPK metrics for better efficiency.`
                                            : `Soil metrics for ${targetCrop} are below optimal. Immediate intervention in irrigation and fertilization recommended.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* History Section */}
                    <div className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-xl">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="font-black uppercase tracking-tight text-2xl text-[#2d3429]">Past Records</h2>
                            <button onClick={loadHistory} className="px-4 py-2 border border-[#7c9473] text-[#7c9473] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7c9473]/10">
                                Refresh
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#f0f0eb]">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date Logged</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Crop</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Moisture</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">No history anchored to wallet.</td></tr>
                                    ) : (
                                        history.map((item, idx) => (
                                            <tr key={idx} className="border-b border-[#fcfcf9]">
                                                <td className="p-4 text-xs font-bold">{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>
                                                <td className="p-4 text-xs font-black text-gray-500">{item.targetCrop}</td>
                                                <td className="p-4 text-sm font-black text-[#7c9473]">{item.moisture.toString()}%</td>
                                                <td className="p-4 text-[10px] font-black text-[#2d3429] uppercase tracking-widest text-right">✅ Signed by Node</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
