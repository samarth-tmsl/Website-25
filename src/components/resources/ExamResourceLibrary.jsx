import React, { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiBookOpen, FiMessageCircle, FiX } from 'react-icons/fi';
import examResources from '../../assets/fake-data/exam-resources';
import studyExams from '../../assets/fake-data/study-exams';
import './ExamResourceLibrary.scss';

const whatsappGroupConfig = {
  sharedExclusions: ['CAT', 'SSC CGL', 'UPSC'],
  shared: [
    {
      label: 'Main NIRMAAN 2027 Aspirants Group',
      url: 'https://chat.whatsapp.com/KGiEu8lbT2wKegPGLcR0LJ?s=cl&p=a&iam=2',
    },
  ],
  exams: {
    CAT: [
      {
        label: 'NIRMAAN CAT Aspirants',
        url: 'https://chat.whatsapp.com/C4JKrKjSwdHA64N9ahQ2LC?s=cl&p=a&iam=2',
      },
    ],
    UPSC: [
      {
        label: 'NIRMAAN UPSC Aspirants',
        url: 'https://chat.whatsapp.com/EoTGCmOheWHFFO1GZX0lxs?s=cl&p=a&iam=2',
      },
    ],
    'SSC CGL': [
      {
        label: 'NIRMAAN SSC Aspirants',
        url: 'https://chat.whatsapp.com/Hn2CCa9mdwyJYblGLFeXVh?s=cl&p=a&iam=2',
      },
    ],
  },
  gate: {
    'GATE CS/IT': [
      {
        label: 'GATE CS/IT-specific group',
        url: 'https://chat.whatsapp.com/Dyt3ciPNPJEExmfSbi6tB6?s=cl&p=a&iam=2',
      },
    ],
    'GATE ECE': [
      {
        label: 'GATE ECE-specific group',
        url: 'https://chat.whatsapp.com/G4sttU6JueTJZe9ItEFiiv?s=cl&p=a&iam=2',
      },
    ],
  },
};

const resourceLinks = Object.fromEntries(
  examResources.map(({ name, resources }) => [name, resources]),
);

function renderInline(text) {
  return text.replace(/\\_/g, '_').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function getActionResource(label) {
  if (/syllabus/i.test(label)) return 'syllabus';
  if (/resources/i.test(label)) return 'materials';
  if (/PYQs/i.test(label)) return 'pyq';
  if (/roadmap/i.test(label)) return 'roadmap';
  return null;
}

function renderWhatsAppGroups(groups) {
  if (!groups || groups.length === 0) return null;

  return (
    <div className="exam-resource-library__whatsapp">
      <h3 className="exam-resource-library__modal-heading">Connect with NIRMAAN Aspirants</h3>
      <p className="exam-resource-library__whatsapp-description">
        Join the WhatsApp communities to connect with fellow aspirants and access the respective preparation groups.
      </p>
      <div className="exam-resource-library__whatsapp-grid">
        {groups.map((group) => (
          <a
            key={group.url}
            className="exam-resource-library__whatsapp-link"
            href={group.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="exam-resource-library__whatsapp-icon" aria-hidden="true">
              <FiMessageCircle />
            </span>
            <span>{group.label}</span>
            <FiArrowUpRight aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

function renderExamContent(markdown, resources) {
  const lines = markdown.replace(/\\_/g, '_').split('\n');
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();

    if (!line || /^\|\s*-+\s*\|$/.test(line)) {
      index += 1;
      continue;
    }

    const heading = line.match(/^#\s+(.+)$/);
    if (heading) {
      blocks.push({ type: 'heading', text: heading[1] });
      index += 1;
      continue;
    }

    const tagline = line.match(/^\|\s*\*(.+)\*\s*\|$/);
    if (tagline) {
      blocks.push({ type: 'tagline', text: tagline[1] });
      index += 1;
      continue;
    }

    const action = line.match(/^\*{0,2}Button:\*{0,2}\s*(.+?)\s*→(?:\s*\{\{[^}]+\}\})?$/);
    if (action) {
      const resource = getActionResource(action[1]);
      blocks.push({
        type: 'action',
        text: action[1],
        href: resource ? resources?.[resource] : null,
      });
      index += 1;
      continue;
    }

    const firstItem = line.match(/^(\*|\d+\.)\s+(.+)$/);
    if (firstItem) {
      const ordered = /^\d/.test(firstItem[1]);
      const items = [];

      while (index < lines.length) {
        const item = lines[index].trim().match(/^(\*|\d+\.)\s+(.+)$/);
        if (!item || /^\d/.test(item[1]) !== ordered) break;
        items.push(item[2]);
        index += 1;
      }

      blocks.push({ type: ordered ? 'ordered-list' : 'list', items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#\s|\* |\d+\.|\|\s*\*|\*{0,2}Button:)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks.map((block, index) => {
    if (block.type === 'heading') {
      return <h3 className="exam-resource-library__modal-heading" key={index}>{block.text}</h3>;
    }

    if (block.type === 'tagline') {
      return <p className="exam-resource-library__modal-tagline" key={index}>{renderInline(block.text)}</p>;
    }

    if (block.type === 'list' || block.type === 'ordered-list') {
      const List = block.type === 'ordered-list' ? 'ol' : 'ul';
      return (
        <List className="exam-resource-library__modal-list" key={index}>
          {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </List>
      );
    }

    if (block.type === 'action') {
      return block.href ? (
        <a
          className="exam-resource-library__modal-action"
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          key={index}
        >
          {block.text} <FiArrowUpRight aria-hidden="true" />
        </a>
      ) : (
        <span className="exam-resource-library__modal-action exam-resource-library__modal-action--unavailable" key={index}>
          {block.text} <FiArrowUpRight aria-hidden="true" />
        </span>
      );
    }

    return <p className="exam-resource-library__modal-copy" key={index}>{renderInline(block.text)}</p>;
  });
}

function ExamResourceLibrary() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef(null);
  const closeTimer = useRef(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedExam && !dialog.open) dialog.showModal();
    if (!selectedExam && dialog.open) dialog.close();

    return () => window.clearTimeout(closeTimer.current);
  }, [selectedExam]);

  useEffect(() => {
    if (!selectedExam) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedExam]);

  const closeModal = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setSelectedExam(null);
      setIsClosing(false);
      isClosingRef.current = false;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
  };

  return (
    <main className="exam-resource-library">
      <div className="exam-resource-library__inner">
        <section className="exam-resource-library__intro" aria-labelledby="study-exam-heading">
          <span className="exam-resource-library__eyebrow"><FiBookOpen aria-hidden="true" /> NIRMAAN EXAM LIBRARY</span>
          <h1 id="study-exam-heading">Your next chapter starts here.</h1>
          <p>Explore exam details and find the resources to move your preparation forward.</p>
        </section>

        <section className="exam-resource-library__grid" aria-label="Available examinations">
          {studyExams.map((exam) => {
            const tagline = exam.content.match(/^\|\s*\*(.+)\*\s*\|$/m)?.[1];
            const subtitle = exam.content.split(/\n\s*\n/, 1)[0].replace(/\*\*/g, '');
            return (
              <article className="exam-resource-library__card" key={exam.name}>
                <span className="exam-resource-library__card-icon" aria-hidden="true">
                  <FiBookOpen />
                </span>
                <span className="exam-resource-library__badge">{exam.category}</span>
                <h2>{exam.name}</h2>
                <p>{tagline || subtitle}</p>
                <button
                  className="exam-resource-library__open"
                  type="button"
                  onClick={() => setSelectedExam(exam)}
                  aria-haspopup="dialog"
                  aria-label={`View ${exam.name} exam details`}
                >
                  View Exam <FiArrowUpRight aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </section>
      </div>

      <dialog
        className={`exam-resource-library__dialog${isClosing ? ' is-closing' : ''}`}
        ref={dialogRef}
        aria-labelledby="exam-resource-dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        {selectedExam && (
          <div className="exam-resource-library__modal">
            <header className="exam-resource-library__modal-header">
              <div>
                <span className="exam-resource-library__badge">{selectedExam.category}</span>
                <h2 id="exam-resource-dialog-title">{selectedExam.name}</h2>
              </div>
              <button
                className="exam-resource-library__close"
                type="button"
                onClick={closeModal}
                aria-label="Close exam details"
              >
                <FiX aria-hidden="true" />
              </button>
            </header>
            <div className="exam-resource-library__modal-body">
              {renderExamContent(selectedExam.content, resourceLinks[selectedExam.resourceName])}
              {renderWhatsAppGroups([
                ...(whatsappGroupConfig.sharedExclusions.includes(selectedExam.name) ? [] : whatsappGroupConfig.shared),
                ...(whatsappGroupConfig.exams[selectedExam.name] || whatsappGroupConfig.gate[selectedExam.name] || []),
              ])}
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}

export default ExamResourceLibrary;
