import React from 'react';

export function GeometricP() {
  const SVGLogo = ({ className, fill = "currentColor", size = 240 }: { className?: string, fill?: string, size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 
        Stem: x: 24 to 44, y: 10 to 90. Width: 20, Height: 80.
        Outer Bowl: starts at x=44, y=10. Semicircle to y=74. Radius: 32. Center: 44, 42.
        Inner Void: starts at x=44, y=30. Semicircle to y=54. Radius: 12. Center: 44, 42.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 10 L44 10 A32 32 0 0 1 44 74 L44 90 L24 90 Z M44 30 A12 12 0 0 1 44 54 Z"
      />
    </svg>
  );

  return (
    <div className="w-full flex flex-col font-sans border-t-[3px] h-full min-h-screen" style={{ borderColor: '#C8FF00' }}>
      {/* Dark Section */}
      <div
        className="flex flex-col items-center justify-center py-24 px-8"
        style={{ backgroundColor: '#0A0A0A', flex: '6' }}
      >
        <SVGLogo fill="#C8FF00" size={240} className="mb-14" />
        <h1
          className="text-4xl font-bold tracking-[0.15em] uppercase mb-4"
          style={{ color: '#C8FF00' }}
        >
          PayVora
        </h1>
        <p className="text-sm uppercase tracking-widest text-neutral-500">
          Geometric P Monogram
        </p>
      </div>

      {/* Light Section */}
      <div className="flex flex-col items-center justify-center py-20 px-8 bg-white" style={{ flex: '4' }}>
        <div className="flex items-end gap-16 mb-12">
          <div className="flex flex-col items-center gap-4">
            <SVGLogo fill="#0A0A0A" size={64} />
            <span className="text-xs font-semibold text-neutral-400">64px</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <SVGLogo fill="#0A0A0A" size={32} />
            <span className="text-xs font-semibold text-neutral-400">32px</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <SVGLogo fill="#0A0A0A" size={16} />
            <span className="text-xs font-semibold text-neutral-400">16px</span>
          </div>
        </div>
        <p className="text-sm font-medium text-neutral-600 uppercase tracking-widest">
          Scales to 16×16px
        </p>
      </div>
    </div>
  );
}
