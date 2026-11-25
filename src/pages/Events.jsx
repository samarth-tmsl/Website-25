import React, { useState, useEffect } from "react";

import PageTitle from "../components/pagetitle/PageTitle_Explore";

import Project3 from "../components/project/Project3";
import ProjectPast from '../components/project/ProjectPast';
import dataOfPast from '../assets/fake-data/data-past';

import YearlyEvents from '../components/eventhead/YearlyEvents';
import dataEventsYearly from '../assets/fake-data/data-events-yearly';

import { api } from '../services/api';

function Events(props) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState(dataOfPast);
  const [loading, setLoading] = useState(true);
  const [hasDynamicData, setHasDynamicData] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.getEvents();
        if (data && data.length > 0) {
          const upcoming = data.filter(e => e.status === 'UPCOMING' || e.status === 'ONGOING');
          const past = data.filter(e => e.status === 'COMPLETED');
          
          if (upcoming.length > 0) {
            setUpcomingEvents(upcoming.map(e => ({
              id: e.id,
              img: e.poster,
              title: e.title,
              text: e.description,
              date: e.date,
              venue: e.venue,
              link: e.registrationUrl
            })));
          }
          
          if (past.length > 0) {
            setPastEvents(past.map(e => ({
              id: e.id,
              img: e.poster,
              title: e.title,
              text: e.description,
              date: e.date,
              venue: e.venue
            })));
          }
          setHasDynamicData(true);
        }
      } catch (err) {
        console.warn("Failed to load events database, falling back to static structures.", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="wrapper">
      <PageTitle title="Events" desc="Explore Our Exciting Events Here" />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#3b82f6', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : hasDynamicData ? (
        <>
          <YearlyEvents data={dataEventsYearly} />

          {/* Dynamic Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <section className="tf-section project s2">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <div className="block-text center">
                      <h6 className="sub-heading"><span>Live / Upcoming</span></h6>
                      <h3 className="heading">Events Happening Now</h3>
                    </div>
                  </div>
                  <Project3 data={upcomingEvents} />
                </div>
              </div>
            </section>
          )}

          {/* Dynamic Past Events Section */}
          <section className="tf-section project s2">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="block-text center">
                    <h6 className="sub-heading"><span>Timeline</span></h6>
                    <h3 className="heading">Our Past Events</h3>
                  </div>
                </div>
                <ProjectPast data={pastEvents} />
              </div>
            </div>
          </section>

        </>
      ) : (
        // Static Fallbacks
        <YearlyEvents data={dataEventsYearly} />
      )}
    </div>
  );
}

export default Events;
