import dataClashOfCreativity from './data-clash-of-creativity';
import dataSafalya26 from './data-safalya26';
import dataOfPast from './data-past';
import dataItem from './data-item';
import dataItem2 from './data-item2';
import dataItem3 from './data-item3';

const TrinayaniImg = '/images2/resultimg/trinayaniPoster.webp';
const UtsabDrishtiImg = '/images2/resultimg/UtsabDrishti.webp';

const cocRegistrationUrl = 'https://forms.gle/9znU6Z3Dpk1C8ST1A';
const cocRulebookUrl = '/docs/RULE_BOOK_Clash_of_creativity.pdf';

const dataEventsYearly = [
  {
    year: '2026-2027',
    events: [
      ...dataClashOfCreativity.map((item) => ({
        ...item,
        id: `coc-${item.id}`,
        link: cocRegistrationUrl,
        rulebook: cocRulebookUrl,
      })),
      {
        id: 'trinayani-2026',
        img: TrinayaniImg,
        title: 'Trinayani',
        ownedBy: 'Samarth',
        statusText: 'Event Ended',
      },
      {
        id: 'utsab-drishti-2026',
        img: UtsabDrishtiImg,
        title: 'Utsab Drishti',
        ownedBy: 'Samarth',
        statusText: 'Event Ended',
      },
    ],
  },
  {
    year: '2025-2026',
    events: dataSafalya26.map(({ link, rulebook, ...item }) => ({
      ...item,
      id: `safalya26-${item.id}`,
    })),
  },
  {
    year: '2023-2024',
    events: dataOfPast.map(({ link, ...item }) => ({
      ...item,
      id: `past-${item.id}`,
    })),
  },
  {
    year: '2022-2023',
    events: [
      ...dataItem.map((item) => ({
        ...item,
        id: `safalya23-${item.id}`,
      })),
      ...dataItem2.map((item) => ({
        ...item,
        id: `special-${item.id}`,
      })),
      ...dataItem3.map((item) => ({
        ...item,
        id: `other-${item.id}`,
      })),
    ],
  },
];

export default dataEventsYearly;
