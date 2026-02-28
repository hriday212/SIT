"use client"

import { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export default function GoogleTranslate() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Only load the script if it hasn't been loaded already
        const addScript = document.createElement("script");
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        addScript.async = true;
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: "en", includedLanguages: "en,hi,mr,pa,te,ta", autoDisplay: false },
                "google_translate_element"
            );
        };
    }, []);

    return (
        <div className="relative flex items-center">
            {/* Custom Sleek Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-3 rounded-xl bg-white text-neutral-400 hover:text-[#7c9473] hover:bg-[#7c9473]/10 transition-all border border-neutral-200"
                title="Translate Page"
            >
                <Globe size={16} />
            </button>

            {/* Hidden/Styled Google Container */}
            <div
                className={cn(
                    "absolute top-12 right-0 z-50 overflow-hidden rounded-xl shadow-2xl bg-white border border-neutral-100 transition-all origin-top-right",
                    isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
                )}
            >
                {/* We scale the actual google widget up slightly and hide its branding padding using CSS inside global.css */}
                <div id="google_translate_element" className="p-2"></div>
            </div>
        </div>
    );
}

// Add the init function to the global window object to avoid TS errors
declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

