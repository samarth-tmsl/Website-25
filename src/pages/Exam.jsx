import React from 'react';
import ExamResourceLibrary from '../components/resources/ExamResourceLibrary';
import PageTitle from '../components/pagetitle/PageTitle_Explore';

const Exam = () => {
  return (
    <div className="wrapper">
      <PageTitle title="NIRMAAN Prepare Smarter. Start for Free." desc="Explore Our Exam Preparation Resources Here" />
      <ExamResourceLibrary />
    </div>
  );
};

export default Exam;
