import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import menus from "../../pages/menu";
import logo from "/samarthw.webp";
import "./styles.scss";

const Header = () => {
  const [scroll, setScroll] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [exploreSubMenuActive, setExploreSubMenuActive] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 300);
    });
    return () => {
      setScroll({});
    };
  }, []);

  const handleMenuActive = () => {
    setMenuActive(!menuActive);
  };

  const handleDropdown = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  const toggleExploreSubMenu = () => {
    setExploreSubMenuActive(!exploreSubMenuActive);
  };

  const location = useLocation();
  const menuListRef = useRef(null);
  const itemRefs = useRef([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pillStyle, setPillStyle] = useState({
    opacity: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [underlineStyle, setUnderlineStyle] = useState({
    opacity: 0,
    left: 0,
    top: 0,
    width: 0,
  });

  const activeRouteIdx = menus.findIndex((item) => {
    if (item.links && item.links === location.pathname) return true;
    if (item.namesub && item.namesub.some((sub) => sub.links === location.pathname)) {
      return true;
    }
    return false;
  });

  const measureItem = useCallback((targetIdx) => {
    const listEl = menuListRef.current;
    const itemEl = targetIdx >= 0 ? itemRefs.current[targetIdx] : null;
    if (!listEl || !itemEl) return null;

    const innerEl = itemEl.querySelector('.explore') || itemEl;
    const listRect = listEl.getBoundingClientRect();
    const itemRect = innerEl.getBoundingClientRect();
    return { listRect, itemRect };
  }, []);

  const updateIndicators = useCallback(() => {
    if (hoveredIdx !== null) {
      const measured = measureItem(hoveredIdx);
      if (measured) {
        const { listRect, itemRect } = measured;
        const padX = 14;
        const padY = 8;
        setPillStyle({
          opacity: 1,
          left: itemRect.left - listRect.left - padX,
          top: itemRect.top - listRect.top - padY,
          width: itemRect.width + padX * 2,
          height: itemRect.height + padY * 2,
        });
      }
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }

    const activeMeasured = measureItem(activeRouteIdx);
    if (activeMeasured) {
      const { listRect, itemRect } = activeMeasured;
      setUnderlineStyle({
        opacity: 1,
        left: itemRect.left - listRect.left,
        top: itemRect.bottom - listRect.top + 6,
        width: itemRect.width,
      });
    } else {
      setUnderlineStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredIdx, activeRouteIdx, measureItem]);

  useEffect(() => {
    updateIndicators();
  }, [updateIndicators, scroll]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicators);
    return () => window.removeEventListener("resize", updateIndicators);
  }, [updateIndicators]);

  const handleCloseMenu = () => {
    setMenuActive(false);
    setActiveIndex(null);
  };

  return (
    <header id="header_main" className={`header ${scroll ? "is-fixed" : ""}`}>
      <div className="container big">
        <div className="row">
          <div className="col-12">
            <div className="header__body">
              <div className="header__logo">
                <Link to="/">
                  <img
                    id="site-logo"
                    className="custom-logo"
                    src={logo}
                    alt="logo"
                  />
                </Link>
                <Link to="/" className="logo-text" style={{ textDecoration: 'none' }}>
                  SAMARTH
                </Link>
              </div>

              <div className="header__right">
                <nav
                  id="main-nav"
                  className={`main-nav ${menuActive ? "active" : ""}`}
                  // style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <ul
                    ref={menuListRef}
                    id="menu-primary-menu"
                    className="menu"
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{ position: 'relative', display: 'flex', gap: '1.8rem', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 }}
                  >
                    <span
                      className="menu-pill-indicator"
                      aria-hidden="true"
                      style={{
                        opacity: pillStyle.opacity,
                        width: `${pillStyle.width}px`,
                        height: `${pillStyle.height}px`,
                        transform: `translate3d(${pillStyle.left}px, ${pillStyle.top}px, 0)`,
                      }}
                    />
                    <span
                      className="menu-active-underline"
                      aria-hidden="true"
                      style={{
                        opacity: underlineStyle.opacity,
                        width: `${underlineStyle.width}px`,
                        transform: `translate3d(${underlineStyle.left}px, ${underlineStyle.top}px, 0)`,
                      }}
                    />
                  
                    {menus.map((data, idx) => (
                      <li
                        key={idx}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onClick={() => handleDropdown(idx)}
                        className={`menu-item ${data.namesub ? "menu-item-has-children" : ""
                          } ${activeIndex === idx || activeRouteIdx === idx ? "active" : ""}`}>
                        <div className={`explore ${data.name === "Explore" ? 'flex-column':''}`}>
                          {data.name === "Explore" ? (
                            <div className="d-flex flex-row">
                            <a onClick={toggleExploreSubMenu}>
                              {data.name}
                              
                            </a>
                            {data.namesub &&
                              data.namesub.some((sub) => sub.isNew) && (
                                <span className="new-text">NEW</span>
                              )}
                            </div>
                          ) : data.external ? (
                            <a href={data.external} target="_blank" rel="noopener noreferrer">
                              {data.name}
                            </a>
                          ) : (
                            <Link to={data.links} onClick={handleCloseMenu}>
                              {data.name}
                            </Link>
                          )}
                          {data.namesub && (
                            <ul
                              className={`sub-menu ${activeIndex === idx && exploreSubMenuActive ? "active" : ""
                                }`}
                            >
                              {data.namesub.map((submenu) => (
                                <li key={submenu.id} className="menu-item">
                                  <NavLink to={submenu.links} onClick={handleCloseMenu}>
                                    {submenu.sub}
                                    {submenu.isNew ? <span className="new-text my-auto">NEW</span> : <></>}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          )}
                           {data.isNew &&
                            <span className="new-text">NEW</span>
                          }
                        </div>
                        
                      </li>
                    ))}
                  </ul>
                </nav>
                <div
                  className={`mobile-button ${menuActive ? "active" : ""}`}
                  onClick={handleMenuActive}
                >
                  <span></span>
                </div>
              </div>

              <div className="header__action">
                <Link to="#" className="search-btn">
                  {/* Search icon SVG */}
                </Link>
                <Link to="/contact" className="action-btn">
                  <span>Join Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
