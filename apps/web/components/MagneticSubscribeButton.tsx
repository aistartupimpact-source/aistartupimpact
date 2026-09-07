'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';

export default function MagneticSubscribeButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [style, setStyle] = useState({ x: 0, y: 0, textX: 0, textY: 0, scale: 1, glowX: 50, glowY: 50, hovering: false });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    const pullStrength = 0.3;
    const x = distX * pullStrength;
    const y = distY * pullStrength;

    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;

    setStyle({ x, y, textX: -x * 0.4, textY: -y * 0.4, scale: 1.03, glowX, glowY, hovering: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setStyle({ x: 0, y: 0, textX: 0, textY: 0, scale: 1, glowX: 50, glowY: 50, hovering: false });
  }, []);

  const handleMouseDown = useCallback(() => {
    setStyle(prev => ({ ...prev, scale: 0.97 }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setStyle(prev => ({ ...prev, scale: 1.03 }));
  }, []);

  return (
    <Link
      ref={btnRef}
      href="/newsletter"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="magnetic-subscribe hidden sm:inline-flex items-center justify-center"
      style={{
        transform: `translate(${style.x}px, ${style.y}px) scale(${style.scale})`,
        transition: style.hovering ? 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)' : 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <span
        className="magnetic-subscribe-glow"
        style={{
          opacity: style.hovering ? 1 : 0,
          background: `radial-gradient(circle at ${style.glowX}% ${style.glowY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
        }}
      />
      <span
        className="magnetic-subscribe-text"
        style={{
          transform: `translate(${style.textX}px, ${style.textY}px)`,
          transition: style.hovering ? 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)' : 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        Subscribe
      </span>
    </Link>
  );
}
