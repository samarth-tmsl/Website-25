import React from 'react';
import dataClashOfCreativity2027 from '../../assets/fake-data/data-clash-of-creativity';
import samarthLogo from '/images2/new/whitelogo.webp';

const registrationUrl = 'https://forms.gle/9znU6Z3Dpk1C8ST1A';

function ClashOfCreativity2027() {
    return (
        <section className="nft clash-of-creativity-2027" style={{ marginTop: '-60px' }}>
            <div className="shape"></div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="block-text center">
                            <h3 className="heading pd p-5">CLASH OF CREATIVITY</h3>
                        </div>
                    </div>

                    {dataClashOfCreativity2027.map(event => (
                        <div key={event.id} className="col-xl-3 col-md-6">
                            <div className="nft-item">
                                <div className="card-media">
                                    <img src={event.img} alt={event.title} />
                                </div>
                                <div className="card-title" style={{ textAlign: 'center' }}>
                                    <span className="h5" style={{ fontSize: '18px' }}>{event.title}</span>
                                </div>
                                <div className="meta-info">
                                    <div className="author">
                                        <div className="avatar">
                                            <img src={samarthLogo} alt="Samarth" />
                                        </div>
                                        <div className="info">
                                            <span>Organized By</span>
                                            <span className="h6" style={{ fontWeight: 600, fontSize: '14px' }}>
                                                {event.ownedBy}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="wishlist-button heart" aria-hidden="true">
                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 13 13"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            stroke="white"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M11.75 4.3125C11.75 2.86292 10.5256 1.6875 9.01533 1.6875C7.88658 1.6875 6.91708 2.34433 6.5 3.28175C6.08292 2.34433 5.11342 1.6875 3.98408 1.6875C2.475 1.6875 1.25 2.86292 1.25 4.3125C1.25 8.52417 6.5 11.3125 6.5 11.3125C6.5 11.3125 11.75 8.52417 11.75 4.3125Z" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="button-place-bid" style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <a
                                        href={registrationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn"
                                        style={{
                                            width: '50%',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            padding: '0',
                                            backdropFilter: 'none'
                                        }}
                                    >
                                        <span style={{ whiteSpace: 'nowrap' }}>Register Now</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ClashOfCreativity2027;
