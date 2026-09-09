import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/scss';
import 'swiper/scss/navigation';
import 'swiper/scss/pagination';
import { Link } from 'react-router-dom';

import line from '/images2/background/line-2.webp';
// import newGitHubIcon from '../../assets/images/new/github.webp';
// import newLinkedInIcon from '../../assets/images/new/linkdln.webp';

Team3.propTypes = {
  data: PropTypes.array,
};

function Team3(props) {
  const { data } = props;
  const [swiper, setSwiper] = useState(null);
  const swiperRef = useRef(null);
  const [slidesPerView, setSlidesPerView] = useState(3); 
  useEffect(() => {
    if (swiper) {
      swiper.update();
    }
  }, [swiper]);

  useEffect(() => {
    const handleResize = () => {
      
      if (window.innerWidth <= 768) {
        setSlidesPerView(1); 
      } else {
        setSlidesPerView(3); 
      }
    };

    
    handleResize();
    window.addEventListener('resize', handleResize);

    const swiperAutoScroll = setInterval(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
    }, 2000);

    return () => {
      clearInterval(swiperAutoScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLinkedInClick = (event, link) => {
    event.stopPropagation();
    window.open(link.link1, '_blank');
  };

  const handleGitHubClick = (event, link) => {
    event.stopPropagation();
    window.open(link.link2, '_blank');
  };

  return (
    /* Previous Heads section disabled */
    null
  );
}

export default Team3;
