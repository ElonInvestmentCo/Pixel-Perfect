import React from 'react';

function ChevronLogo({ size = 240, color = "#C8FF00", className = "" }: { size?: number, color?: string, className?: string }) {
  // Use a single bold chevron at 16px or below for clarity
  const isSmall = size <= 24;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer bold chevron */}
      <polygon points="50,10 100,90 75,90 50,50 25,90 0,90" />
      
      {/* Inner nested chevron (hidden at small sizes) */}
      {!isSmall && (
        <polygon points="50,62 67.5,90 57.5,90 50,78 42.5,90 32.5,90" />
      )}
    </svg>
  );
}

export function GrowthChevron() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0A] font-sans border-t-[3px] border-[#C8FF00] overflow-hidden selection:bg-[#C8FF00] selection:text-black">
      {/* Dark Section (~60%) */}
      <div className="flex flex-col items-center justify-center p-12 relative min-h-[60dvh]">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <span className="text-zinc-600 text-xs tracking-[0.2em] uppercase font-bold">Variant 3</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <ChevronLogo size={240} color="#C8FF00" className="drop-shadow-[0_0_32px_rgba(200,255,0,0.15)]" />
          
          <h1 className="text-[#C8FF00] text-4xl sm:text-5xl font-bold tracking-[0.15em] uppercase mt-16 mb-4">
            PayVora
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base tracking-[0.05em]">
            Growth Chevron Mark
          </p>
        </div>
      </div>

      {/* Light Section (~40%) */}
      <div className="flex flex-col items-center justify-center p-12 bg-white min-h-[40dvh] relative border-t border-zinc-200">
        <div className="flex flex-col items-center justify-center gap-12 w-full max-w-2xl">
          
          {/* Logo Size Grid */}
          <div className="flex items-end justify-center gap-16 sm:gap-24">
            <div className="flex flex-col items-center gap-6">
              <ChevronLogo size={64} color="#0A0A0A" />
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.15em]">64px</span>
            </div>
            
            <div className="flex items-end justify-center gap-12">
              <div className="flex flex-col items-center gap-6">
                <ChevronLogo size={32} color="#0A0A0A" />
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.15em]">32px</span>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 flex items-center justify-center border border-zinc-100 rounded-md bg-zinc-50/50">
                  <ChevronLogo size={16} color="#0A0A0A" />
                </div>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.15em]">16px</span>
              </div>
            </div>
          </div>
          
          {/* Annotations */}
          <div className="flex flex-col items-center gap-3 text-center">
             <span className="text-zinc-900 text-sm font-bold tracking-wide uppercase">Scales to 16×16px</span>
             <span className="text-zinc-500 text-sm">Abstract mark — no letterforms</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
