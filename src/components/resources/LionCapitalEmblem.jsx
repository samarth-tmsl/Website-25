import React from 'react';

/**
 * Extracted line-art emblem of the Lion Capital of India (UPSC emblem).
 */
function LionCapitalEmblem({ className = '' }) {
  return (
    <img
      src="/images2/upsc-emblem.webp"
      alt=""
      aria-hidden="true"
      className={className}
      loading="lazy"
    />
  );
}

export default LionCapitalEmblem;
