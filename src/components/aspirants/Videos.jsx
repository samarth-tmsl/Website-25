import React from "react";
import PropTypes from "prop-types";

Videos.propTypes = {
  data: PropTypes.array,
};

function Videos(props) {
  const { data } = props;

  return (
    <div className="videos video-grid" role="list">
      {data.map((obj) => (
        <article className="video-card" key={obj.id} role="listitem">
          <a className="video-thumb-link" href={obj.url} target="_blank" rel="noopener noreferrer" aria-label={obj.title}>
            <div className="video-thumb" aria-hidden="true">
              <img src={obj.thumbnail} alt="" loading="lazy" />
              <div className="play-overlay" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7L8 5z" fill="white"/>
                </svg>
              </div>
            </div>
          </a>

          <div className="video-meta">
            <a className="video-title" href={obj.url} target="_blank" rel="noopener noreferrer">
              <p>{obj.title}</p>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default Videos;
