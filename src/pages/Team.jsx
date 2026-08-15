import React, { useState, useEffect } from 'react';

import PageTitle from '../components/pagetitle/PageTitle_Explore';

import Team2 from '../components/team/Team2';
import dataTeam from '../assets/fake-data/dataTeam';

import Team3 from '../components/team/Team3';
import dataTeam2 from '../assets/fake-data/dataTeam2';

import Team4 from '../components/team/Team4';
import dataTeam3 from '../assets/fake-data/dataTeam3';

import { api } from '../services/api';

function Team(props) {
    const [faculty, setFaculty] = useState(dataTeam);
    const [heads, setHeads] = useState(dataTeam2);
    const [coHeads, setCoHeads] = useState(dataTeam3);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const data = await api.getTeam();
                if (data && data.length > 0) {
                    // Map key fields for components (e.g. img: image URL)
                    const mapped = data.map(m => ({
                        ...m,
                        img: m.image,
                        links: {
                            link1: m.linkedin,
                            link2: m.github
                        }
                    }));

                    const facultyList = mapped.filter(m => 
                        m.wing === 'Committee' || 
                        m.position.toLowerCase().includes('advisor') || 
                        m.position.toLowerCase().includes('professor') || 
                        m.position.toLowerCase().includes('dr.')
                    );
                    
                    const headsList = mapped.filter(m => 
                        m.position === 'President' || 
                        m.position === 'Vice President' || 
                        m.position === 'General Secretary' || 
                        m.position === 'Treasurer' || 
                        m.position === 'Head'
                    );

                    const coHeadsList = mapped.filter(m => 
                        m.position === 'Joint Secretary' || 
                        m.position === 'Co-Head' || 
                        m.position === 'Co-Convenor' ||
                        m.position === 'Member' // fallback category
                    );

                    if (facultyList.length > 0) setFaculty(facultyList);
                    if (headsList.length > 0) setHeads(headsList);
                    if (coHeadsList.length > 0) setCoHeads(coHeadsList);
                }
            } catch (err) {
                console.warn("Failed to load dynamic team database, falling back to static files.", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeam();
    }, []);

    return (
        <div className='page-team wrapper'>

            <PageTitle title='Our Team' desc='The People Who Make Everything Happen' />

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#3b82f6', animation: 'spin 1s linear infinite' }}></div>
                </div>
            ) : (
                <>
                    <Team2 data={faculty} />
                    <Team3 data={heads} />
                    <Team4 data={coHeads} />
                </>
            )}
            
        </div>
    );
}

export default Team;
