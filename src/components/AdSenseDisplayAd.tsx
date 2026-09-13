import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const AdSenseDisplayAd: React.FC = () => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adPushed, setAdPushed] = useState(false);

  useEffect(() => {
    // Ensure script is loaded if not already in index.html
    const existingScript = document.querySelector('script[src*="adsbygoogle.js?client=ca-pub-5378392556030394"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5378392556030394';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Trigger AdSense ad request
    if (!adPushed) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdPushed(true);
      } catch (e) {
        console.warn('AdSense push notice:', e);
      }
    }

    // Check if the ad container receives iframe/content from AdSense
    const checkTimer = setTimeout(() => {
      if (adRef.current) {
        const hasContent = adRef.current.children.length > 0 || adRef.current.getAttribute('data-ad-status') === 'filled';
        if (hasContent) {
          setAdLoaded(true);
        }
      }
    }, 1200);

    return () => clearTimeout(checkTimer);
  }, [adPushed]);

  return (
    <div 
      id="adsense-display-container" 
      className="w-full my-6 p-4 rounded-2xl bg-stone-100/80 border border-stone-200/90 shadow-xs transition-all"
    >
      {/* Policy Compliant Ad Header - Distinct from Game Controls */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200 text-xs text-stone-500 uppercase font-medium tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Advertisement</span>
        </div>
        <span className="text-[10px] text-stone-400 lowercase tracking-normal">Display Ad • Not Rewarded</span>
      </div>

      {/* AdSense Unit Wrapper */}
      <div className="min-h-[120px] sm:min-h-[140px] md:min-h-[160px] flex items-center justify-center relative overflow-hidden rounded-lg bg-white/70">
        {/* The Exact Google AdSense Code */}
        {/* Chicken Jump */}
        <ins
          ref={adRef}
          className="adsbygoogle w-full block"
          style={{ display: 'block', minHeight: '100px' }}
          data-ad-client="ca-pub-5378392556030394"
          data-ad-slot="6088982303"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        {/* Fallback / Preview state when live ad network is connecting, pending approval, or running in dev sandbox */}
        {!adLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none bg-radial from-stone-50 to-stone-100/90">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Google AdSense
              </span>
              <span className="text-xs font-medium text-stone-600">Responsive Display Ad</span>
            </div>
            <p className="text-xs text-stone-500 max-w-sm">
              Slot ID: <span className="font-mono text-stone-700">6088982303</span> • Publisher: <span className="font-mono text-stone-700">ca-pub-5378392556030394</span>
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Live ads render here automatically via Google ad network. Accidental clicks prevented.
            </p>
          </div>
        )}
      </div>

      {/* Footer policy reassurance */}
      <div className="pt-2 mt-2 text-center text-[10px] text-stone-400">
        Google AdSense Display Unit • No game points are awarded for ad interactions
      </div>
    </div>
  );
};
