'use client';

import React from 'react';

export function Logo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="strong-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Pink High Heel Shoe */}
        <path
          d="M45 65C45 65 55 85 85 85C115 85 125 55 125 25M45 65L35 85C35 85 40 95 55 95C70 95 85 85 85 85M125 25L135 85H125"
          stroke="#FF69B4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#strong-neon)"
        />
        
        {/* Cyan Swirls */}
        <path
          d="M135 45C135 45 145 35 155 45C165 55 155 65 145 60C135 55 140 45 145 45M145 70C145 70 155 60 165 70C175 80 165 90 155 85C145 80 150 70 155 70"
          stroke="#00FFFF"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#neon-glow)"
        />

        {/* Main Frame */}
        <rect
          x="15"
          y="100"
          width="170"
          height="60"
          rx="12"
          stroke="#00FFFF"
          strokeWidth="3"
          filter="url(#strong-neon)"
        />

        {/* Santa Text */}
        <text
          x="100"
          y="132"
          textAnchor="middle"
          fill="#00FFFF"
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            fontFamily: 'Inter, system-ui',
            filter: 'drop-shadow(0 0 8px #00FFFF)',
            letterSpacing: '2px'
          }}
        >
          SANTA
        </text>

        {/* Night Club Text */}
        <text
          x="100"
          y="152"
          textAnchor="middle"
          fill="#00FFFF"
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: 'Inter, system-ui',
            letterSpacing: '3px',
            filter: 'drop-shadow(0 0 4px #00FFFF)'
          }}
        >
          NIGHT CLUB
        </text>

        {/* Yellow Stars */}
        <g filter="url(#neon-glow)">
          <path d="M25 175L28 180L33 180L29 183L30 187L25 185L20 187L21 183L17 180L22 180L25 175Z" fill="#FFFF00" />
          <path d="M62 180L65 185L70 185L66 188L67 192L62 190L57 192L58 188L54 185L59 185L62 180Z" fill="#FFFF00" />
          <path d="M100 185L103 190L108 190L104 193L105 197L100 195L95 197L96 193L92 190L97 190L100 185Z" fill="#FFFF00" />
          <path d="M138 180L141 185L146 185L142 188L143 192L138 190L133 192L134 188L130 185L135 185L138 180Z" fill="#FFFF00" />
          <path d="M175 175L178 180L183 180L179 183L180 187L175 185L170 187L171 183L167 180L172 180L175 175Z" fill="#FFFF00" />
        </g>
      </svg>
    </div>
  );
}