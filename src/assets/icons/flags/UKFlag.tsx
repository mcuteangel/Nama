import React from 'react';

const UKFlag: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 600 300"
    {...props}
  >
    <rect fill="#00247D" width="600" height="300" />
    <path fill="#FFFFFF" d="M0,0L200,100M0,100L200,0" stroke="#FFFFFF" strokeWidth="60" />
    <path fill="#CF142B" d="M0,0L200,100M0,100L200,0" stroke="#CF142B" strokeWidth="40" />
    <path fill="#FFFFFF" d="M300,0L300,300M0,150L600,150" stroke="#FFFFFF" strokeWidth="100" />
    <path fill="#CF142B" d="M300,0L300,300M0,150L600,150" stroke="#CF142B" strokeWidth="60" />
  </svg>
);

export default UKFlag;