'use client';

import React, { useEffect, useRef } from 'react';
import getSourceLogo from '../utils/source-logo';
import { useAllSources } from '../api/source/queries';

const SLIDE_SPEED = 60; // px per second

export default function SourceSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const { data: sources } = useAllSources();
  const SOURCES = sources?.map((source) => source.name) || [];

  // Duplicate logos for seamless infinite scroll
  const logos = [...SOURCES, ...SOURCES];

  useEffect(() => {
    let start: number | null = null;
    let left = 0;
    const track = trackRef.current;
    if (!track) return;
    const totalWidth = track.scrollWidth / 2;

    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      left = -(elapsed / 1000) * SLIDE_SPEED;
      // Reset to 0 when scrolled past half (since we duplicate)
      if (-left >= totalWidth) {
        start = ts;
        left = 0;
      }
      track.style.transform = `translateX(${left}px)`;
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div style={{ width: '100%', margin: 0 }}>
      <div style={{ width:'100%', display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
        <h4 style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, marginBottom: 0,width: 'max-content' }}>Search once, buy anywhere!</h4>
      </div>
      <div style={{ overflow: 'hidden', width: '100%', background: '#f8f9fa', borderRadius: 12, backgroundColor: 'white', paddingBottom: 16, paddingTop: 16 }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 75,
            willChange: 'transform',
            backgroundColor: 'white',
          }}
        >
          {logos.map((source, idx) => {
            const logo = getSourceLogo(source);
            if (!logo) return null;
            return (
              <div key={source + idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 75, minWidth: 140, padding: '0 32px' }}>
                <img src={logo} alt={source} style={{ height: 75, maxWidth: 120, objectFit: 'contain', filter: 'grayscale(0.2)',
                          mixBlendMode: 'multiply', // This is the key line
                          backgroundColor: 'white',
                 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 