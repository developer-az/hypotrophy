'use client'

export function BiscuitMark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill="#1a1610" stroke="#d4a054" strokeWidth="2" />
      <ellipse cx="18" cy="18" rx="9" ry="11" fill="#c4a574" />
      <ellipse cx="46" cy="18" rx="9" ry="11" fill="#c4a574" />
      <ellipse cx="18" cy="18" rx="5" ry="6" fill="#e8c9a0" />
      <ellipse cx="46" cy="18" rx="5" ry="6" fill="#e8c9a0" />
      <ellipse cx="32" cy="36" rx="18" ry="16" fill="#d4b896" />
      <ellipse cx="32" cy="40" rx="10" ry="8" fill="#f0dcc0" />
      <circle cx="24" cy="32" r="2.2" fill="#1a1610" />
      <circle cx="40" cy="32" r="2.2" fill="#1a1610" />
      <ellipse cx="32" cy="38" rx="3.2" ry="2.2" fill="#8b3a2a" />
      <path d="M29 42 Q32 45 35 42" fill="none" stroke="#6b3a2a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
