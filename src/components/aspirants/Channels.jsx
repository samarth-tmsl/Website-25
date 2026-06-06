//React
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//Swiper API
import { Swiper, SwiperSlide } from 'swiper/react';
import {Autoplay,Navigation,Pagination} from 'swiper'
import 'swiper/scss';
import 'swiper/scss/pagination';
//FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'

Channels.propTypes = {
  data: PropTypes.array,
};

function Channels(props) {
  const { data } = props;

  useEffect(() => {
    const swiperAutoScroll = setInterval(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
    }, 5000);

    return () => {
      clearInterval(swiperAutoScroll);
    };
  }, []);

  const swiperRef = React.useRef(null);

function control_prev() {
  if (swiperRef.current && swiperRef.current.swiper) {
    swiperRef.current.swiper.slidePrev();
  }
}
function control_next() {
  if (swiperRef.current && swiperRef.current.swiper) {
    swiperRef.current.swiper.slideNext();
  }
}

  return (
    <div className="channel-carousel">
      <button
        className="control control-left"
        aria-label="Previous channel"
        onClick={control_prev}
      >
        <FontAwesomeIcon className="arrow-icons" icon={faAngleLeft} />
      </button>

      <section className="channel-section">
        <div className="container" id="ch-cont">
          <div className="row">
            <div className="col-12">
              <div className="swiper-container project-swiper-container">
                <Swiper
                  ref={swiperRef}
                  className="project-swiper channel-swiper"
                  spaceBetween={28}
                  breakpoints={{
                    0: { slidesPerView: 1 },
                    600: { slidesPerView: 2 },
                    992: { slidesPerView: 3 },
                    1300: { slidesPerView: 4 },
                  }}
                  loop={true}
                  navigation={false}
                  pagination={{ clickable: true, el: '.channel-pagination' }}
                  autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
                  slidesPerGroup={1}
                  modules={[Navigation, Pagination, Autoplay]}
                  {...gestureParams}
                >
                  {data.map((idx) => (
                    <SwiperSlide key={idx.id}>
                      <a href={idx.url} target="_blank" rel="noopener noreferrer" className="channel-link">
                        <article className="channel-card" aria-label={idx.title}>
                          <div className="avatar-wrap">
                            <img className="channel-avatar" src={idx.img} alt={idx.title + ' avatar'} />
                          </div>
                          <div className="channel-name">{idx.title}</div>
                        </article>
                      </a>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="channel-pagination swiper-pagination" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        className="control control-right"
        aria-label="Next channel"
        onClick={control_next}
      >
        <FontAwesomeIcon className="arrow-icons" icon={faAngleRight} />
      </button>
    </div>
  );
}

export default Channels;


const gestureParams = {
  touchEventsTarget: 'wrapper', 
  touchStartPreventDefault: false, 
  touchMoveStopPropagation: false, 
  simulateTouch: true, 
  longSwipes: true,
  longSwipesRatio: 0.5, 
  longSwipesMs: 300, 
};
