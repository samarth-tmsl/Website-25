import React from 'react';
import ExamResourceLibrary from '../components/resources/ExamResourceLibrary';
import PageTitle from '../components/pagetitle/PageTitle_Explore';

const Exam = () => {
  return (
    <div className="wrapper">
      <PageTitle title="NIRMAAN" desc="Prepare Smarter. Start for Free." />
      <ExamResourceLibrary />
    </div>
  );
};

export default Exam;
