import React, { useState, useEffect } from 'react';
import PageTitle from '../components/pagetitle/PageTitle_Explore';
import dataAchievers from '../assets/fake-data/data-achievers';

function Achievers() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeAchiever, setActiveAchiever] = useState(null);

  const categories = ['All', 'Placements', 'Open Source', 'Hackathons'];

  const filteredAchievers = selectedCategory === 'All'
    ? dataAchievers
    : dataAchievers.filter(a => a.category === selectedCategory);

  const handleOpenDetail = (achiever) => {
    setActiveAchiever(achiever);
  };

  const handleCloseDetail = () => {
    setActiveAchiever(null);
  };

  useEffect(() => {
    if (activeAchiever) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeAchiever]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="page-achievers wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <PageTitle 
        title="Achievers" 
        desc="Celebrating the outstanding accomplishments of our community members" 
      />

      <section className="achievers-content" style={{ padding: '80px 0', minHeight: '60vh' }}>
        <div className="container">
          
          {/* Category Filter Tabs */}
          <div className="row justify-content-center mb-5" style={{ marginBottom: '45px' }}>
            <div className="col-12 text-center">
              <div 
                className="filter-tabs" 
                style={{ 
                  display: 'inline-flex', 
                  flexWrap: 'wrap',
                  justifyContent: 'center', 
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {categories.map(cat => (
                  <span
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '25px',
                      border: 'none',
                      background: selectedCategory === cat 
                        ? 'linear-gradient(135deg, #5C27FE 0%, #DEC7FF 100%)' 
                        : 'transparent',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedCategory === cat 
                        ? '0 4px 15px rgba(92, 39, 254, 0.4)' 
                        : 'none',
                      userSelect: 'none'
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Achievers Grid */}
          <div className="row justify-content-center">
            {filteredAchievers.length > 0 ? (
              filteredAchievers.map((achiever) => (
                <div key={achiever.id} className="col-xl-3 col-md-6 mb-4" style={{ marginBottom: '30px' }}>
                  <div 
                    className="achiever-card"
                    style={{
                      background: '#0e1122',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '24px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.borderColor = 'rgba(92, 39, 254, 0.6)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(92, 39, 254, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    }}
                    onClick={() => handleOpenDetail(achiever)}
                  >
                    <div>
                      {/* Avatar */}
                      <div 
                        className="avatar-container" 
                        style={{ 
                          width: '110px', 
                          height: '110px', 
                          margin: '0 auto 20px', 
                          borderRadius: '50%', 
                          overflow: 'hidden',
                          border: '3px solid rgba(92, 39, 254, 0.3)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                          background: '#16124b'
                        }}
                      >
                        <img 
                          src={achiever.img} 
                          alt={achiever.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>

                      {/* Info */}
                      <h4 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                        {achiever.name}
                      </h4>
                      <h6 style={{ color: '#DEC7FF', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        {achiever.milestone}
                      </h6>
                      <p style={{ color: '#ffffff', opacity: '0.6', fontSize: '13px', marginBottom: '16px' }}>
                        {achiever.organization}
                      </p>
                    </div>

                    {/* Bottom Info / Category Badge */}
                    <div>
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '12px', color: '#a5a6f6', background: 'rgba(165, 166, 246, 0.1)', padding: '4px 12px', borderRadius: '12px', fontWeight: '500' }}>
                          {achiever.department}
                        </span>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                          {achiever.batch}
                        </div>
                      </div>

                      {/* CTA Action button inside card */}
                      <div 
                        style={{ 
                          fontSize: '13px', 
                          color: '#5C27FE', 
                          fontWeight: '600', 
                          textTransform: 'uppercase', 
                          letterSpacing: '1px' 
                        }}
                      >
                        View Story
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center" style={{ padding: '40px' }}>
                <p style={{ color: '#ccc', fontSize: '16px' }}>No achievers found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal Popup Details */}
      {activeAchiever && (
        <div
          onClick={handleCloseDetail}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(14, 17, 34, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0e1122',
              border: '1px solid rgba(92, 39, 254, 0.3)',
              borderRadius: '20px',
              padding: '40px',
              width: '100%',
              maxWidth: '550px',
              color: '#ffffff',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(92, 39, 254, 0.3)',
              textAlign: 'center'
            }}
          >
            {/* Close Button */}
            <span
              onClick={handleCloseDetail}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              &times;
            </span>

            {/* Modal Avatar */}
            <div 
              style={{ 
                width: '120px', 
                height: '120px', 
                margin: '0 auto 20px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '4px solid #5C27FE',
                boxShadow: '0 4px 20px rgba(92, 39, 254, 0.4)'
              }}
            >
              <img 
                src={activeAchiever.img} 
                alt={activeAchiever.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* Achievement details */}
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              {activeAchiever.name}
            </h3>
            <h5 style={{ color: '#DEC7FF', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {activeAchiever.milestone}
            </h5>
            <p style={{ color: '#ffffff', opacity: '0.6', fontSize: '14px', marginBottom: '20px' }}>
              {activeAchiever.organization}
            </p>

            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '25px',
                textAlign: 'left',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#e2e8f0'
              }}
            >
              {activeAchiever.description}
            </div>

            {/* Footer with meta & socials */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '20px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: '#a5a6f6', background: 'rgba(165, 166, 246, 0.1)', padding: '4px 10px', borderRadius: '10px' }}>
                  {activeAchiever.department}
                </span>
                <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
                  {activeAchiever.batch}
                </span>
              </div>

              {/* Social Links */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <a 
                  href={activeAchiever.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0077b5';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* LinkedIn SVG */}
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a 
                  href={activeAchiever.github} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* GitHub SVG */}
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievers;
