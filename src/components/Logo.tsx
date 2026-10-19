import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSubtitle = false }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 56,
  };

  return (
    <div className={`inline-flex flex-col items-center select-none group ${className}`}>
      <div className="flex items-center gap-2 relative">
        {/* Ícone de Coroa com Anel Orbital Futurista */}
        <div className="relative flex items-center justify-center">
          <svg
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          >
            <defs>
              <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="orbitGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Anel Orbital */}
            <ellipse
              cx="50"
              cy="64"
              rx="44"
              ry="14"
              stroke="url(#orbitGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              className="animate-pulse-subtle"
            />
            
            {/* Esferas orbitais */}
            <circle cx="8" cy="62" r="3" fill="#ffffff" className="drop-shadow-[0_0_6px_#ffffff]" />
            <circle cx="92" cy="66" r="3" fill="#cbd5e1" />

            {/* Coroa Streetwear Cromada */}
            <path
              d="M24 64 L18 32 L38 48 L50 22 L62 48 L82 32 L76 64 Z"
              fill="url(#chromeGrad)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Joias da coroa / Pontos de Luz */}
            <circle cx="18" cy="32" r="2.5" fill="#ffffff" />
            <circle cx="50" cy="22" r="3.5" fill="#ffffff" className="drop-shadow-[0_0_6px_#ffffff]" />
            <circle cx="82" cy="32" r="2.5" fill="#ffffff" />
            
            {/* Base da coroa detalhada */}
            <rect x="22" y="64" width="56" height="5" rx="2.5" fill="#050507" stroke="url(#chromeGrad)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Tipografia STREETLIFE */}
        <span
          className={`font-black tracking-widest uppercase text-chrome font-display transition-all duration-300 ${sizeClasses[size]}`}
          style={{ letterSpacing: '0.18em' }}
        >
          STREETLIFE
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[10px] uppercase tracking-[0.35em] text-chrome-400 font-mono mt-0.5">
          Arena de Batalhas & Sportlife
        </span>
      )}
    </div>
  );
};
