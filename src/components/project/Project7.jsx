import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/scss';
import 'swiper/scss/navigation';
import PropTypes from 'prop-types';
import 'swiper/scss/pagination';
import data from '../../assets/fake-data/dataPartner'
import dataPartner from '../../assets/fake-data/dataPartner';
import { api } from '../../services/api';

Partners.propTypes = {
  data: PropTypes.array,
};

function Partners() {
  const [sponsorsList, setSponsorsList] = useState(dataPartner);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const result = await api.getSponsors();
        if (result && result.length > 0) {
          setSponsorsList(result);
        }
      } catch (err) {
        console.warn("Failed to fetch sponsors from database, using static fallback.", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSponsors();
  }, []);

  // Helper to slice lists safely
  const getSlice = (start, end) => {
    if (sponsorsList.length <= start) return [];
    return sponsorsList.slice(start, end);
  };

  const renderSwiper = (sliceData) => {
    if (!sliceData || sliceData.length === 0) return null;
    return (
      <Swiper
        className="brands-swiper"
        spaceBetween={30}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1100: {
            slidesPerView: Math.min(4, sliceData.length),
          },
        }}
        loop={sliceData.length > 1}
      >
        {sliceData.map(idx => (
          <SwiperSlide key={idx.id}>
            <a href={idx.website || "#null"} target={idx.website ? "_blank" : "_self"} rel="noreferrer">
              <img 
                src={idx.img} 
                alt={idx.name || "Sponsor"} 
                className="img-fluid d-block mx-auto" 
                style={{
                  width: "230px", 
                  height: "125px", 
                  objectFit: "contain", 
                  display: "block", 
                  margin: "0 auto", 
                  verticalAlign: "middle"
                }} 
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  return (
    <div className='wrapper'>
      <section className="partner">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="block-text center">
                <h6 className="sub-heading">
                  <span>Sponsor</span>
                </h6>
                <h3 className="heading">
                  Our Honourable Sponsors 
                </h3>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#3b82f6', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : (
                <>
                  {/* Dynamic sections based on sponsor array chunks */}
                  {renderSwiper(getSlice(16, 20))}
                  {renderSwiper(getSlice(20, 24))}
                  {renderSwiper(getSlice(24, 28))}
                  {renderSwiper(getSlice(28, 32))}
                  {renderSwiper(getSlice(0, 4))}
                  {renderSwiper(getSlice(4, 8))}
                  {renderSwiper(getSlice(8, 12))}
                  {renderSwiper(getSlice(12, 16))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Partners;