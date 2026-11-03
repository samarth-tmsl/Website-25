import React, { useState } from 'react';
import { FiArrowUpRight, FiBookOpen, FiFileText, FiFolder, FiMap } from 'react-icons/fi';
import examResources from '../../assets/fake-data/exam-resources';
import './ExamResourceLibrary.scss';

const resourceCategories = [
  { key: 'pyq', title: 'Previous-Year Questions', detail: 'Practice past questions and get familiar with question patterns.', Icon: FiFileText },
  { key: 'materials', title: 'Study Resources', detail: 'Browse curated study materials and notes for your preparation.', Icon: FiFolder },
  { key: 'syllabus', title: 'Syllabus', detail: 'Review exam topics and plan your subject coverage.', Icon: FiBookOpen },
  { key: 'roadmap', title: 'Preparation Roadmap', detail: 'Follow a structured plan for practice and revision.', Icon: FiMap },
];

const preparationHighlights = [
  {
    title: 'Exam Structure',
    detail: 'Understand the stages and format of your chosen examination.',
  },
  {
    title: 'Eligibility',
    detail: 'Check the latest official notification for eligibility requirements.',
  },
  {
    title: 'Subject Coverage',
    detail: 'Use the syllabus to identify topics and organise your study plan.',
  },
  {
    title: 'Paper Practice',
    detail: 'Work through previous-year questions to build familiarity.',
  },
];

function ExamResourceLibrary() {
  const [selectedExam, setSelectedExam] = useState(examResources[0]);

  return (
    <main className="exam-resource-library">
      <div className="exam-resource-library__glow" aria-hidden="true" />
      <div className="exam-resource-library__inner">
        <nav className="exam-resource-library__exam-nav" aria-label="Choose an exam">
          {examResources.map((exam) => (
            <button
              className={`exam-resource-library__exam-tab ${selectedExam.name === exam.name ? 'active' : ''}`}
              type="button"
              key={exam.name}
              onClick={() => setSelectedExam(exam)}
              aria-pressed={selectedExam.name === exam.name}
            >
              {exam.name}
            </button>
          ))}
        </nav>

        <section className="exam-resource-library__overview" aria-labelledby="exam-resource-title">
          <span className="exam-resource-library__badge">{selectedExam.category}</span>
          <h1 id="exam-resource-title">What is {selectedExam.name}?</h1>
          <p>{selectedExam.overview}</p>
        </section>

        <section className="exam-resource-library__section" aria-labelledby="exam-resource-highlights">
          <h2 id="exam-resource-highlights">What’s New?</h2>
          <div className="exam-resource-library__highlights">
            {preparationHighlights.map(({ title, detail }, index) => (
              <article className="exam-resource-library__highlight" key={title}>
                <span className="exam-resource-library__highlight-marker" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="exam-resource-library__section" aria-labelledby="exam-resource-careers">
          <h2 id="exam-resource-careers">Career Options</h2>
          <div className="exam-resource-library__careers">
            {selectedExam.careers.map((career, index) => (
              <article className="exam-resource-library__career" key={career}>
                <span className="exam-resource-library__career-number">0{index + 1}</span>
                <h3>{career}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="exam-resource-library__section" aria-labelledby="exam-resource-collections">
          <h2 id="exam-resource-collections">Preparation Resources</h2>
          <div className="exam-resource-library__resource-grid">
            {resourceCategories.map(({ key, title, detail, Icon }) => (
              <article className="exam-resource-library__resource" key={key}>
                <div className="exam-resource-library__resource-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div className="exam-resource-library__resource-copy">
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <a
                  className="exam-resource-library__open"
                  href={selectedExam.resources[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${title} for ${selectedExam.name}`}
                >
                  <span>Explore</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ExamResourceLibrary;
