'use client';

import React, { useEffect, useRef, useState } from 'react';
import getSourceLogo from '../utils/source-logo';
import { useAllSources } from '../api/source/queries';

export default function SourceSlider() {
  const { data: sources } = useAllSources();
  const SOURCES = sources?.map((source) => source.name) || [];

  const [repeats, setRepeats] = useState(2);
  const [duration, setDuration] = useState(60); // seconds
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // ✅ Generate logos only when repeats is valid
  const logos =
    repeats > 0 && SOURCES.length > 0
      ? Array(repeats)
          .fill(null)
          .flatMap(() => SOURCES)
      : [];

  useEffect(() => {
    const updateMetrics = () => {
      if (!containerRef.current || !trackRef.current || SOURCES.length === 0) return;

      const containerWidth = containerRef.current.offsetWidth;
      const totalWidth = trackRef.current.scrollWidth;

      // Approximate single set width by dividing by current repeat count
      const singleSetWidth = totalWidth / repeats || 1;

      // Ensure at least 2x container width of content
      const neededRepeats = Math.ceil((containerWidth * 2) / singleSetWidth);

      if (neededRepeats > repeats) {
        setRepeats(neededRepeats);
        return; // let layout update, rerun after
      }

      // Update scroll duration based on total width
      const updatedTotalWidth = singleSetWidth * repeats;
      const speed = isMobile ? 100 : 150; // px/sec
      const newDuration = updatedTotalWidth / speed;
      setDuration(newDuration);
    };

    // Run once layout is rendered
    setTimeout(updateMetrics, 50);
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [SOURCES, repeats]);

  return (
    <div style={{ width: '100%', margin: 0 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
        <h4 style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, marginBottom: 0, width: 'max-content' }}>
          Search once, buy anywhere!
        </h4>
      </div>

      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          width: '100%',
          backgroundColor: 'white',
          paddingBottom: 16,
          paddingTop: 16,
          borderRadius: 12,
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: 'inline-flex',
            whiteSpace: 'nowrap',
            animation: `scroll-left ${duration}s linear infinite`,
          }}
        >
          {logos.map((source, idx) => {
            const logo = getSourceLogo(source);
            if (!logo) return null;
            return (
              <div
                key={`${source}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 75,
                  minWidth: 140,
                  padding: '0 32px',
                }}
              >
                <img
                  src={logo}
                  alt={source}
                  style={{
                    height: 75,
                    maxWidth: 120,
                    objectFit: 'contain',
                    filter: 'grayscale(0.2)',
                    mixBlendMode: 'multiply',
                    backgroundColor: 'white',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
