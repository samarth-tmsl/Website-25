import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * SpotlightCard component from React Bits (JS-CSS flavor)
 * Creates a dynamic radial gradient spotlight effect that tracks mouse position across the card surface.
 */
function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(124, 58, 237, 0.25)',
  spotlightRadius = 300,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      <div
        className="spotlight-overlay"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          opacity,
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: `radial-gradient(${spotlightRadius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

SpotlightCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  spotlightColor: PropTypes.string,
  spotlightRadius: PropTypes.number,
  style: PropTypes.object,
};

export default SpotlightCard;
