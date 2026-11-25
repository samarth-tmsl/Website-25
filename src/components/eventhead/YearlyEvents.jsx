import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import samarthLogo from '/images2/new/whitelogo.webp';

YearlyEvents.propTypes = {
  data: PropTypes.array,
};

function YearlyEvents({ data = [] }) {
  const [likedItems, setLikedItems] = useState([]);

  const handleLikeClick = (e, itemId) => {
    e.preventDefault();
    setLikedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <section className="nft" style={{ paddingTop: '50px' }}>
      <div className="shape"></div>
      <div className="container">
        {data.map((group, groupIdx) => (
          <div
            key={group.year || groupIdx}
            className="event-year-group"
            style={{
              marginBottom: groupIdx !== data.length - 1 ? '70px' : '30px',
            }}
          >
            {group.year && (
              <div className="row">
                <div className="col-12">
                  <div className="block-text center" style={{ marginTop: '10px', marginBottom: '40px' }}>
                    <h6 className="sub-heading"><span>Academic Year</span></h6>
                    <h3 className="heading pd" style={{ fontSize: '32px', marginBottom: '15px' }}>
                      {group.year}
                    </h3>
                    <div
                      style={{
                        width: '80px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                        margin: '12px auto 0',
                        borderRadius: '2px',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="row justify-content-center">
              {group.events.map((item) => (
                <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-8 col-11">
                  <div className="nft-item">
                    <div className="card-media">
                      <Link to="#">
                        <img src={item.img} alt={item.title} />
                      </Link>
                    </div>
                    <div className="card-title" style={{ textAlign: 'center' }}>
                      <Link to="#" className="h5">
                        {item.title}
                      </Link>
                    </div>
                    <div className="meta-info">
                      <div className="author">
                        <div className="avatar">
                          <img src={samarthLogo} alt="Samarth" />
                        </div>
                        <div className="info">
                          <span>Organized By</span>
                          <Link to="#" className="h6">
                            {item.ownedBy || 'Samarth'}
                          </Link>
                        </div>
                      </div>
                      <Link
                        to="#"
                        className={`wishlist-button heart ${likedItems.includes(item.id) ? 'red' : ''}`}
                        onClick={(e) => handleLikeClick(e, item.id)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill={likedItems.includes(item.id) ? 'red' : 'none'}
                          xmlns="http://www.w3.org/2000/svg"
                          stroke={likedItems.includes(item.id) ? 'red' : 'white'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            d="M11.75 4.3125C11.75 2.86292 10.5256 1.6875 9.01533 1.6875C7.88658 1.6875 6.91708 2.34433 6.5 3.28175C6.08292 2.34433 5.11342 1.6875 3.98408 1.6875C2.475 1.6875 1.25 2.86292 1.25 4.3125C1.25 8.52417 6.5 11.3125 6.5 11.3125C6.5 11.3125 11.75 8.52417 11.75 4.3125Z"
                            stroke={likedItems.includes(item.id) ? 'red' : 'white'}
                          />
                        </svg>
                        {item.likes && <span className="number-like"> {item.likes}</span>}
                      </Link>
                    </div>

                    {(item.link || item.rulebook) && (
                      <div className="button-place-bid" style={{ width: '100%', display: 'flex', gap: '10px' }}>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn"
                            style={{
                              width: item.rulebook ? '50%' : '100%',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '0',
                              backdropFilter: 'none',
                            }}
                          >
                            <span style={{ whiteSpace: 'nowrap' }}>Register Now</span>
                          </a>
                        )}
                        {item.rulebook && (
                          <a
                            href={item.rulebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn"
                            style={{
                              width: item.link ? '50%' : '100%',
                              justifyContent: 'center',
                              background: '#ffd700',
                              backgroundColor: '#ffd700',
                              border: '1px solid #ffd700',
                              padding: '0',
                              backdropFilter: 'none',
                            }}
                          >
                            <span style={{ color: '#000', background: '#ffd700', backgroundColor: '#ffd700', whiteSpace: 'nowrap' }}>
                              Rulebook
                            </span>
                          </a>
                        )}
                      </div>
                    )}

                    {!item.link && !item.rulebook && item.statusText && (
                      <div className="button-place-bid" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <span
                          aria-disabled="true"
                          className="action-btn"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: '0',
                            backdropFilter: 'none',
                            opacity: 0.65,
                            cursor: 'not-allowed',
                            pointerEvents: 'none',
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap' }}>{item.statusText}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default YearlyEvents;
