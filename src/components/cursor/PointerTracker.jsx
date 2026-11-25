import React, { useEffect, useRef } from 'react';

/**
 * Global blurred circular pointer tracker that smoothly follows cursor movement
 * using frame-rate-independent exponential smoothing.
 */
function PointerTracker() {
  const trackerRef = useRef(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const el = trackerRef.current;
    if (!el) return;

    let mouseX = -250;
    let mouseY = -250;
    let currentX = -250;
    let currentY = -250;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let rafId = null;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Frame-rate-independent exponential smoothing (silky across 60Hz/120Hz+)
      const posFactor = 1 - Math.exp(-10 * dt);
      const scaleFactor = 1 - Math.exp(-12 * dt);

      currentX += (mouseX - currentX) * posFactor;
      currentY += (mouseY - currentY) * posFactor;
      scale += (targetScale - scale) * scaleFactor;

      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
      rafId = requestAnimationFrame(animate);
    };

    const BOX_SELECTOR =
      '.nft-item, .project-box, .card-box, .team-box, .portfolio-box, .testimonials-box, .counter-box, .blog-box, .box-item, .speciality-box';

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        currentX = mouseX;
        currentY = mouseY;
        visible = true;
        el.style.opacity = '1';
      }

      const box = e.target.closest(BOX_SELECTOR);
      if (box) {
        const rect = box.getBoundingClientRect();
        box.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        box.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      }

      const interactive = e.target.closest('a, button, [role="button"], .action-btn, input, textarea, select');
      targetScale = interactive ? 1.28 : 1;
    };

    const handleMouseDown = () => {
      targetScale = 0.88;
    };

    const handleMouseUp = (e) => {
      const interactive = e.target.closest('a, button, [role="button"], .action-btn, input, textarea, select');
      targetScale = interactive ? 1.28 : 1;
    };

    const handleMouseLeave = () => {
      visible = false;
      el.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={trackerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(167, 139, 250, 0.34) 0%, rgba(124, 58, 237, 0.18) 38%, rgba(92, 39, 254, 0.06) 62%, rgba(92, 39, 254, 0) 75%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        mixBlendMode: 'screen',
      }}
    />
  );
}

export default PointerTracker;
