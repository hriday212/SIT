"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ArrowRight, Wallet, CreditCard, Target, FileText, Info, ShieldCheck, Store, LogOut, User, Sprout, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/AuthContext"
import { ethers } from "ethers"
import GoogleTranslate from "./GoogleTranslate"

const MAIN_LINKS = [
    { name: "Home", href: "/", public: true },
    { name: "Dashboard", href: "/dashboard", public: false },
    { name: "Schemes", href: "/schemes", public: false },
    { name: "Market", href: "/marketplace", public: false },
    { name: "Contact", href: "/contact", public: false },
]

const MENU_LINKS = [
    { name: "Soil Analyzer", href: "/dashboard/soil", icon: Sprout, desc: "AI-powered soil health telemetry." },
    { name: "Loan Portal", href: "/dashboard/kcc", icon: Wallet, desc: "Agri-Business & Crop Loans." },
    { name: "Marketplace", href: "/marketplace", icon: Store, desc: "Buy verified seeds and tools." },
    { name: "Document Vault", href: "/dashboard/vault", icon: FileText, desc: "Secure digital locker." },
    { name: "Blockchain Center", href: "/dashboard/explorer", icon: ShieldCheck, desc: "Live decentralized data explorer." },
]

export function NavBar() {
    const pathname = usePathname()
    const router = useRouter()
    const { isAuthenticated, user, logout } = useAuth()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)

    // Only apply aggressive scroll-hiding on the home page (for the video)
    const isHomePage = pathname === "/"

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        handleScroll()
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    const handleProtectedClick = (e: React.MouseEvent, href: string, isPublic: boolean) => {
        if (!isPublic && !isAuthenticated) {
            e.preventDefault()
            router.push("/login")
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (error) {
                console.error("User rejected request", error);
            }
        } else {
            alert("Please install MetaMask to use Web3 features.");
        }
    }

    return (
        <>
            <div
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
                    isScrolled ? "bg-white/10 backdrop-blur-md border-b border-white/10 py-4 shadow-xl shadow-black/5" : "py-6",
                    "opacity-100"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                            <img src="/logo.png" alt="DBT-Connect Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className={cn(
                            "font-black tracking-tighter text-lg hidden sm:block",
                            isHomePage && !isScrolled ? "text-white" : "text-[#2d3429]"
                        )}>
                            DBT-Connect
                        </span>
                    </Link>

                    {/* Main Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-lg p-1.5 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        {MAIN_LINKS.map((link) => {
                            if (!link.public && !isAuthenticated) return null;
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive ? "text-[#2d3429] bg-white shadow-sm scale-105" :
                                            isHomePage && !isScrolled ? "text-white/70 hover:text-white" : "text-neutral-500 hover:text-[#2d3429]"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                                    <div className="w-8 h-8 rounded-full bg-[#7c9473]/20 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                        <div className={cn("text-[10px] font-black uppercase leading-none", isHomePage && !isScrolled ? "text-white" : "text-[#2d3429]")}>{user?.name}</div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest text-[#7c9473] mt-0.5">{user?.role}</div>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:flex px-6 py-3 bg-[#2d3429] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#7c9473] transition-all items-center gap-2 shadow-xl shadow-[#2d3429]/20">
                                Login <ArrowRight size={14} />
                            </Link>
                        )}

                        {/* Connect Wallet Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <GoogleTranslate />
                            <button
                                onClick={connectWallet}
                                className={cn(
                                    "px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all items-center gap-2 border",
                                    walletAddress ? "bg-[#7c9473]/10 text-[#7c9473] border-[#7c9473]/30" : "bg-white text-[#2d3429] border-neutral-200 hover:border-[#2d3429]"
                                )}
                            >
                                <Link2 size={14} className={walletAddress ? "text-[#7c9473]" : "text-neutral-400"} />
                                {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "Connect Wallet"}
                            </button>
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "p-3 rounded-xl transition-colors",
                                isMenuOpen ? "bg-white text-[#2d3429] shadow-sm" :
                                    isHomePage && !isScrolled ? "text-white hover:bg-white/10" : "text-[#2d3429] bg-neutral-100 hover:bg-neutral-200"
                            )}
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-[90] bg-[#fdfdfb] pt-32 px-6 pb-12 overflow-y-auto"
                    >
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Menu Links */}
                            <div className="space-y-12">
                                {/* Mobile Main Links */}
                                <div className="md:hidden flex flex-col gap-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Primary Routes</div>
                                    {MAIN_LINKS.map(link => (
                                        <Link
                                            key={link.name}
                                            href={link.public || isAuthenticated ? link.href : "/login"}
                                            className="text-4xl font-black text-[#2d3429] tracking-tighter hover:text-[#7c9473] transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Secondary Menu Links */}
                                <div className="flex flex-col gap-8">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Platform Features</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {MENU_LINKS.map((link, i) => (
                                            <motion.div
                                                key={link.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <Link
                                                    href={isAuthenticated ? link.href : "/login"}
                                                    className="block p-6 bg-white rounded-3xl border border-neutral-100 hover:border-[#7c9473]/30 hover:shadow-xl hover:shadow-[#7c9473]/5 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-[#f8f9f5] text-[#7c9473] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#7c9473] group-hover:text-white transition-all duration-300">
                                                        <link.icon size={20} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-[#2d3429] mb-2">{link.name}</h4>
                                                    <p className="text-xs font-bold text-neutral-400">{link.desc}</p>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Menu Sidebar / Highlight */}
                            <div className="bg-[#2d3429] rounded-[48px] p-12 text-white relative overflow-hidden flex flex-col justify-end min-h-[400px]">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="text-[10px] bg-white/10 w-fit px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-6">
                                                {user?.role === "farmer" ? "Farmer Portal" : "Buyer Portal"}
                                            </div>
                                            <h3 className="text-4xl font-black tracking-tighter mb-4">Welcome, {user?.name?.split(' ')[0]}.</h3>
                                            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-8">
                                                {user?.role === "farmer"
                                                    ? "Access your farm dashboard, check scheme eligibility, and manage your crop lifecycle."
                                                    : "Browse the marketplace, connect with farmers, and manage your procurement."
                                                }
                                            </p>
                                            <Link href="/dashboard" className="inline-flex px-8 py-4 bg-[#7c9473] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#6a8062] transition-colors gap-3 items-center">
                                                Go to Dashboard <ArrowRight size={16} />
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-[10px] bg-white/10 w-fit px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-6">Get Started</div>
                                            <h3 className="text-4xl font-black tracking-tighter mb-4">Enter the Ecosystem.</h3>
                                            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-8">
                                                Login or register to access the full platform — schemes, loans, marketplace, and more.
                                            </p>
                                            <Link href="/login" className="inline-flex px-8 py-4 bg-[#7c9473] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#6a8062] transition-colors gap-3 items-center">
                                                Login / Register <ArrowRight size={16} />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}