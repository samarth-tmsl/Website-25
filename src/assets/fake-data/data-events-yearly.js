import dataSafalya26 from './data-safalya26';
import dataOfPast from './data-past';
import dataItem from './data-item';
import dataItem2 from './data-item2';
import dataItem3 from './data-item3';



const dataEventsYearly = [
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
