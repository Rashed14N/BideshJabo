import React from 'react';
import { Globe, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export default function Logo({ className, iconSize = 24, textSize = "text-xl", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="relative flex items-center justify-center">
        <Globe 
          size={iconSize} 
          className="text-gold animate-[spin_10s_linear_infinite]" 
        />
        <Send 
          size={iconSize * 0.6} 
          className="absolute -top-1 -right-1 text-white transform -rotate-12 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" 
        />
      </div>
      {showText && (
        <span className={cn("font-display font-extrabold tracking-tighter", textSize)}>
          Bidesh <span className="text-gold">Jabo</span>
        </span>
      )}
    </div>
  );
}
