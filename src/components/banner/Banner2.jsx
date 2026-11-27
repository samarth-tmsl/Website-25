import React, { useState } from 'react';
import Button from '../button/Button';

function Banner2() {
    const [dataBlock] = useState(
        {
            subheading: 'Samarth',
            heading: 'Empowering Youth For The Future',
            desc: 'SAMARTH is the educational society of Techno Main Salt Lake, founded in 2019. SAMARTH literally means Competent, strong and powerful.'
        }
    )
    return (
        <section className="banner s2">
            <div className="shape"></div>
            <div className="shape right"></div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="block-text center">
                            <h6 className="sub-heading"><span>{dataBlock.subheading}</span></h6>
                            <h2 className="heading pd">{dataBlock.heading}</h2>
                            <p className="mb-34">{dataBlock.desc}</p>

                            <Button title='Get Connected' link='/contact' />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Banner2;