import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { optimizeImageUrl, getFallbackImageUrl } from '../lib/imageUtils';

interface ImageWithFallbackProps {
  src: string | undefined;
  alt: string;
  className?: string;
  originalSrc?: string;
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [stage, setStage] = useState<number>(0); // 0: optimized lh3, 1: thumbnail, 2: original src, 3: error
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    setStage(0);
    setCurrentSrc(optimizeImageUrl(src) || src);
  }, [src]);

  if (!currentSrc || stage >= 3) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 min-w-8 min-h-8" />
      </div>
    );
  }

  const handleError = () => {
    if (stage === 0) {
      const fallback = getFallbackImageUrl(src);
      if (fallback && fallback !== currentSrc) {
        setStage(1);
        setCurrentSrc(fallback);
      } else if (src && src !== currentSrc) {
        setStage(2);
        setCurrentSrc(src);
      } else {
        setStage(3);
      }
    } else if (stage === 1) {
      if (src && src !== currentSrc) {
        setStage(2);
        setCurrentSrc(src);
      } else {
        setStage(3);
      }
    } else {
      setStage(3);
    }
  };

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
    />
  );
}

