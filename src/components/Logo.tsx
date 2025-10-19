import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1890ff" stopOpacity={1} />
            <stop offset="100%" stopColor="#0960a5" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="50%" stopColor="#e6f3ff" stopOpacity={1} />
            <stop offset="100%" stopColor="#cce7ff" stopOpacity={1} />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#grad1)"/>
        <text
          x="16"
          y="19"
          fontFamily="cursive, fantasy, 'Brush Script MT', serif"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          fill="url(#textGrad)"
          textLength="28"
          lengthAdjust="spacingAndGlyphs"
        >
          Nama
        </text>
      </svg>
    </div>
  );
};

export default Logo;
