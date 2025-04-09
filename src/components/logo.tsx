'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Logo({ 
  size = 'medium', 
  href = '/',
  className = ''
}: { 
  size?: 'small' | 'medium' | 'large',
  href?: string
  className?: string
}) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // Size mapping
  const sizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 }
  };
  
  const { width, height } = sizes[size];
  
  return (
    <Link 
      href={href}
      className={`relative block ${className} ${!logoLoaded ? 'animate-pulse' : ''}`}
    >
      <Image 
        src="/logo.png" 
        alt="Marketfy" 
        width={width}
        height={height}
        priority
        onLoad={() => setLogoLoaded(true)}
        className={`transition-all duration-300 drop-shadow-md ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectFit: 'contain'
        }}
      />
      {!logoLoaded && (
        <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="font-bold text-primary text-lg">M</span>
        </div>
      )}
    </Link>
  );
}