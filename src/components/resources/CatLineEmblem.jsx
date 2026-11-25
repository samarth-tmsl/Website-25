import React from 'react';

/**
 * Vector line-art emblem for CAT with animated stroke-drawing paths.
 */
function CatLineEmblem({ className = '' }) {
  return (
    <svg
      className={`exam-resource-library__cat-svg ${className}`.trim()}
      viewBox="0 0 260 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="catLineGrad" x1="16" y1="20" x2="244" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#DEC7FF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* C */}
      <path
        className="cat-line-path cat-line-path--1"
        pathLength="100"
        d="M 80 32 C 70 18, 45 18, 32 32 C 19 46, 19 66, 32 80 C 45 94, 70 94, 80 80"
        stroke="url(#catLineGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* A */}
      <path
        className="cat-line-path cat-line-path--2"
        pathLength="100"
        d="M 96 90 L 128 21 L 160 90"
        stroke="url(#catLineGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="cat-line-path cat-line-path--3"
        pathLength="100"
        d="M 107 67 L 149 67"
        stroke="url(#catLineGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* T */}
      <path
        className="cat-line-path cat-line-path--4"
        pathLength="100"
        d="M 172 22 L 240 22"
        stroke="url(#catLineGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        className="cat-line-path cat-line-path--5"
        pathLength="100"
        d="M 206 22 L 206 90"
        stroke="url(#catLineGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default CatLineEmblem;
