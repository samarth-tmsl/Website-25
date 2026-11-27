import React , {useState} from 'react';



function Speciality(props) {

    const {data} = props;

    const [dataBlock] = useState(
        {
            subheading: 'Our Aim',
            desc: "To build students' confidence, communication and leadership, and to guide them towards competitive exams like UPSC, WBCS, SSC, Banking, Railway, GATE and CAT, through events such as extempore, group discussions, mock interviews and quizzes.",
            
        }
    )
    return (
        <section className="speciality" style={{ marginTop: '-120px' }}>
                <div className="shape right"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="block-text center">
                                <h6 className="sub-heading"><span>{dataBlock.subheading}</span></h6>
                                    <p className="">{dataBlock.desc}</p>
                            </div>
                        </div>
                        {
                            data.map(idx => (
                                <div key={idx.id} className="col-xl-3 col-md-6">
                                    <div className="speciality-box" >
                                        <div className="icon">
                                            <img src={idx.img} alt="Cyfonii" />
                                        </div>
                                        <h5 className="title">{idx.title}</h5>
                                        <p>{idx.desc}</p>
                                        <h3 className="number">0{idx.id}</h3>
                                    </div>
                                </div>
                            ))
                        }
                        
                    </div>
                </div>
            </section>

    );
}

export default Speciality;
