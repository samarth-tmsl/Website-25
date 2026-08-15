import React, { useState, useEffect } from 'react';
import dataCard from '../assets/fake-data/data-card';
import dataCard2 from '../assets/fake-data/data-card2';

import Banner2 from '../components/banner/Banner2';
import Counter from '../components/counter/Counter';

import Speciality from '../components/speciality/Speciality';
import dataBox from '../assets/fake-data/data-box';
import Project from '../components/project/Project';
import dataProject from '../assets/fake-data/dataProject';
import Testimonials from '../components/testimonials/Testimonials';
import dataTestimonials from '../assets/fake-data/data-testimonials';

// --- Announcement Notification ---
import Notification from '../components/notification/Notification';
import { api } from '../services/api';
// -------------------------------------------

function Home(props) {
    const [announcement, setAnnouncement] = useState(null);

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const list = await api.getAnnouncements();
                if (list && list.length > 0) {
                    // Pick the highest priority active announcement
                    setAnnouncement(list[0]);
                }
            } catch (err) {
                console.warn("Failed to load active announcements.", err);
            }
        }
        fetchAnnouncements();
    }, []);

    return (
        <div className='home-2 wrapper'>
                {/* --- Dynamic Announcement Notification --- */}
                {announcement && (
                    <Notification 
                        message={announcement.content} 
                        link={announcement.link}
                    />
                )}
                {/* ------------------------------------------- */}

                 {/* <Banner2 data={dataCard1} /> */}
                <Banner2 data={dataCard2} />

                <Speciality data={dataBox} />


                <Testimonials data={dataTestimonials} />

                <Counter />  

                <Project data={dataProject} />

        </div>
    );
}

export default Home;
