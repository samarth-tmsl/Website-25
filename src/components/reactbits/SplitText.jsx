import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SplitText component from React Bits (JS-CSS flavor)
 * Splits text into individual letters or words with stagger entrance animations.
 */
function SplitText({
  text = '',
  className = '',
  delay = 50,
  animationFrom = { opacity: 0, transform: 'translate3d(0, 30px, 0)' },
  animationTo = { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  easing = 'cubic-bezier(0.2, 0.65, 0.3, 0.9)',
  threshold = 0.1,
  rootMargin = '-50px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) {
  const words = text.split(' ').map((word) => word.split(''));
  const lettersRef = useRef([]);
  lettersRef.current = [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lettersRef.current.forEach((letter, index) => {
              if (letter) {
                setTimeout(() => {
                  letter.style.transition = `opacity 0.6s ${easing}, transform 0.6s ${easing}`;
                  letter.style.opacity = animationTo.opacity;
                  letter.style.transform = animationTo.transform;
                  if (index === lettersRef.current.length - 1 && onLetterAnimationComplete) {
                    onLetterAnimationComplete();
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

    if (lettersRef.current[0]) {
      observer.observe(lettersRef.current[0].parentElement);
    }

    return () => observer.disconnect();
  }, [delay, easing, threshold, rootMargin, animationTo, onLetterAnimationComplete]);

  return (
    <span
      className={`split-text-container ${className}`}
      style={{
        display: 'inline-block',
        textAlign,
        overflow: 'hidden',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {word.map((char, charIndex) => (
            <span
              key={charIndex}
              ref={(el) => el && lettersRef.current.push(el)}
              style={{
                display: 'inline-block',
                opacity: animationFrom.opacity,
                transform: animationFrom.transform,
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </span>
          ))}
          <span style={{ display: 'inline-block', width: '0.28em' }}>&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

SplitText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  animationFrom: PropTypes.object,
  animationTo: PropTypes.object,
  easing: PropTypes.string,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  textAlign: PropTypes.string,
  onLetterAnimationComplete: PropTypes.func,
};

export default SplitText;
