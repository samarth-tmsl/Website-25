import React from 'react';
import PageTitle from '../components/pagetitle/PageTitle_Explore';
import dataAchievers from '../assets/fake-data/data-achievers';

function Achievers() {
  return (
    <div className="page-achievers wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <PageTitle 
        title="Achievers" 
        desc="Celebrating the outstanding accomplishments of our community members" 
      />

      <section className="achievers-content" style={{ padding: '80px 0', minHeight: '60vh' }}>
        <div className="container">

          {/* Achievers Grid */}
          <div className="row justify-content-center">
            {dataAchievers.map((achiever, idx) => {
              return (
                <div key={idx} className="col-xl-3 col-md-6 mb-5" style={{ marginBottom: '40px' }}>
                  <div 
                    className="achiever-card"
                    style={{
                      background: 'transparent',
                      padding: '10px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      const container = e.currentTarget.querySelector('.avatar-container');
                      if (container) {
                        container.style.transform = 'scale(1.05)';
                        container.style.boxShadow = '0 12px 30px rgba(92, 39, 254, 0.6)';
                        container.style.borderColor = '#DEC7FF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const container = e.currentTarget.querySelector('.avatar-container');
                      if (container) {
                        container.style.transform = 'scale(1)';
                        container.style.boxShadow = '0 8px 20px rgba(92, 39, 254, 0.3)';
                        container.style.borderColor = '#5C27FE';
                      }
                    }}
                  >
                    {/* Avatar */}
                    <div 
                      className="avatar-container" 
                      style={{ 
                        width: '145px', 
                        height: '145px', 
                        borderRadius: '50%', 
                        overflow: 'hidden',
                        border: '6px solid #5C27FE',
                        boxShadow: '0 8px 20px rgba(92, 39, 254, 0.3)',
                        background: '#16124b',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img 
                        src={achiever.img} 
                        alt={achiever.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    {/* Info */}
                    <h4 style={{ 
                      color: '#DEC7FF', 
                      fontSize: '18px', 
                      fontWeight: '800', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      marginTop: '18px',
                      marginBottom: '6px'
                    }}>
                      {achiever.name}
                    </h4>
                    
                    <p style={{ 
                      color: '#ffffff', 
                      fontSize: '15px', 
                      fontWeight: '700',
                      lineHeight: '1.4',
                      margin: 0,
                      opacity: 0.95
                    }}>
                      {achiever.milestone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Achievers;
