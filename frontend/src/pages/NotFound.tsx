import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", router.asPath);
  }, [router.asPath]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 font-sans p-6">

      {/* 
        Custom SVG Illustration perfectly mimicking the portal fall reference image 
        while adhering strictly to the primary app styling (#0A0E2E).
      */}
      <div className="w-full max-w-4xl opacity-90 transition-opacity hover:opacity-100">
        <svg viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto animate-in fade-in zoom-in duration-1000 origin-center drop-shadow-sm">

          {/* Background floating light gray coins/disks */}
          <circle cx="250" cy="120" r="22" fill="#cbd5e1" opacity="0.4" />
          <circle cx="700" cy="80" r="32" fill="#cbd5e1" opacity="0.4" />
          <ellipse cx="230" cy="400" rx="18" ry="28" fill="#cbd5e1" opacity="0.4" transform="rotate(30 230 400)" />
          <ellipse cx="800" cy="380" rx="16" ry="24" fill="#cbd5e1" opacity="0.4" transform="rotate(-20 800 380)" />
          <ellipse cx="500" cy="460" rx="40" ry="14" fill="#cbd5e1" opacity="0.4" transform="rotate(-10 500 460)" />

          {/* Dark floating elements */}
          <ellipse cx="430" cy="110" rx="18" ry="8" fill="#0A0E2E" opacity="0.8" transform="rotate(-15 430 110)" />
          <ellipse cx="680" cy="450" rx="30" ry="12" fill="#0A0E2E" opacity="0.75" transform="rotate(20 680 450)" />

          {/* Left portal (black hole) */}
          <ellipse cx="320" cy="270" rx="18" ry="65" transform="rotate(20 320 270)" fill="#0A0E2E" />

          {/* Top half of character coming out of left portal */}
          <path d="M290,230 Q250,180 200,170" stroke="#0A0E2E" strokeOpacity="0.8" strokeWidth="14" strokeLinecap="round" fill="none" /> {/* Arm waving */}
          <path d="M200,170 L195,152 M200,170 L206,155" stroke="#0A0E2E" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" /> {/* Fingers */}
          <path d="M315,270 Q280,270 270,200" stroke="#0A0E2E" strokeWidth="32" strokeLinecap="round" fill="none" /> {/* Torso */}
          <circle cx="270" cy="170" r="18" fill="#0A0E2E" fillOpacity="0.9" /> {/* Head */}

          {/* Right portal (black hole) */}
          <ellipse cx="680" cy="280" rx="22" ry="75" transform="rotate(-25 680 280)" fill="#0A0E2E" />

          {/* Legs falling into right portal */}
          <path d="M680,280 L760,210 L790,225" stroke="#0A0E2E" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M685,290 L770,260 L790,275" stroke="#0A0E2E" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="778" y="215" width="28" height="14" rx="5" fill="#0A0E2E" fillOpacity="0.85" transform="rotate(25 778 215)" /> {/* Shoe */}
          <rect x="778" y="265" width="28" height="14" rx="5" fill="#0A0E2E" fillOpacity="0.85" transform="rotate(15 778 265)" /> {/* Shoe */}

          {/* Top portal with plant */}
          <ellipse cx="530" cy="150" rx="50" ry="14" fill="#0A0E2E" />
          <path d="M530,150 Q510,100 550,65" stroke="#0A0E2E" strokeOpacity="0.95" strokeWidth="5" strokeLinecap="round" fill="none" /> {/* Stem */}
          <path d="M523,120 Q545,110 550,128 Q530,135 523,120 Z" fill="#0A0E2E" fillOpacity="0.95" /> {/* Leaf 1 */}
          <path d="M518,95 Q495,85 490,105 Q505,110 518,95 Z" fill="#0A0E2E" fillOpacity="0.95" /> {/* Leaf 2 */}
          <path d="M540,75 Q565,60 570,80 Q550,88 540,75 Z" fill="#0A0E2E" fillOpacity="0.95" /> {/* Leaf 3 */}

          {/* Hat falling */}
          <path d="M350,420 L385,455 L360,480 L325,445 Z" fill="#0A0E2E" fillOpacity="0.9" />
          <path d="M315,435 L395,470" stroke="#0A0E2E" strokeWidth="7" strokeLinecap="round" />
          <path d="M340,435 L372,470" stroke="#f1f5f9" strokeWidth="4" /> {/* Hat Stripe */}

          {/* Sparkles */}
          <path d="M420,170 L424,180 L434,184 L424,188 L420,198 L416,188 L406,184 L416,180 Z" fill="#94a3b8" />
          <path d="M580,390 L583,398 L591,401 L583,404 L580,412 L577,404 L569,401 L577,398 Z" fill="#94a3b8" />
          <path d="M300,100 L303,108 L311,111 L303,114 L300,122 L297,114 L289,111 L297,108 Z" fill="#94a3b8" />

          {/* 404 Text - Centered */}
          <text x="500" y="340"
            fontFamily="inherit"
            fontWeight="900"
            fontSize="220"
            fill="#0A0E2E"
            textAnchor="middle"
            letterSpacing="-5"
            style={{ textShadow: '4px 4px 6px rgba(10,14,46,0.1)' }}
          >
            404
          </text>

          {/* ERROR PAGE Text */}
          <text x="500" y="380"
            fontFamily="inherit"
            fontWeight="800"
            fontSize="24"
            fill="#0A0E2E"
            textAnchor="middle"
            letterSpacing="5"
          >
            ERROR PAGE
          </text>

        </svg>
      </div>

      <div className="relative z-10 text-center px-6 mt-4 animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <p className="mx-auto max-w-md mb-8 text-base md:text-lg font-medium text-[#0A0E2E]/60">
          The page you are looking for has clearly slipped into another dimension or is temporarily unavailable.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0A0E2E] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#1a264a] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0A0E2E]/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
