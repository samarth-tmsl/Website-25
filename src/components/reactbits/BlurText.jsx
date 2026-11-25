import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BlurText component from React Bits (JS-CSS flavor)
 * Staggers a sleek blur-to-focus animation across words or letters.
 */
function BlurText({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
  direction = 'top', // 'top' or 'bottom'
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
}) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const refs = useRef([]);
  refs.current = [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            refs.current.forEach((el, index) => {
              if (el) {
                setTimeout(() => {
                  el.style.opacity = '1';
                  el.style.filter = 'blur(0px)';
                  el.style.transform = 'translate3d(0, 0, 0)';
                  if (index === refs.current.length - 1 && onAnimationComplete) {
                    onAnimationComplete();
                  }
                }, index * delay);
              }
            });
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    if (refs.current[0]) {
      observer.observe(refs.current[0].parentElement);
    }

    return () => observer.disconnect();
  }, [delay, threshold, rootMargin, onAnimationComplete]);

  const offset = direction === 'top' ? '-20px' : '20px';

  return (
    <span
      className={`blur-text-container ${className}`}
      style={{ display: 'inline-block', flexWrap: 'wrap' }}
    >
      {elements.map((segment, index) => (
        <span
          key={index}
          ref={(el) => el && refs.current.push(el)}
          style={{
            display: 'inline-block',
            opacity: 0,
            filter: 'blur(10px)',
            transform: `translate3d(0, ${offset}, 0)`,
            transition: 'opacity 0.7s cubic-bezier(0.2, 0.65, 0.3, 0.9), filter 0.7s cubic-bezier(0.2, 0.65, 0.3, 0.9), transform 0.7s cubic-bezier(0.2, 0.65, 0.3, 0.9)',
            marginRight: animateBy === 'words' ? '0.3em' : '0em',
            willChange: 'transform, filter, opacity',
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
        </span>
      ))}
    </span>
  );
}

BlurText.propTypes = {
  text: PropTypes.string.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
  animateBy: PropTypes.oneOf(['words', 'letters']),
  direction: PropTypes.oneOf(['top', 'bottom']),
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  onAnimationComplete: PropTypes.func,
};

export default BlurText;
