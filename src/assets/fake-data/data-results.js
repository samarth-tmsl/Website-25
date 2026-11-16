const AptiQuestImg = 'images2/resultimg/AptiQuest.webp';
const EducathonImg = '/images2/new/educathonPoster.webp';
const TrinayaniImg = 'images2/resultimg/trinayaniPoster.webp';
const UtsabDrishtiImg = 'images2/resultimg/UtsabDrishti.webp';

const logo = '/images2/new/newlogo.webp';

const results = [
  {
    id: 1,
    img: AptiQuestImg,
    type: 1,
    title: 'AptiQuest',
    avt: logo,
    name: 'Team Samarth',
    tag: '@TechTeam',
    winners: [
      { position: '1st', name: 'Taha Abdullah (CSBS)' },
      { position: '2nd', name: 'Rupayam Dey (BCA)' },
      { position: '3rd', name: 'Aryan Shukla (CSE - IoT)' },
      { position: '4th', name: 'Harsh Kumar Shaw (CSE)' },
      { position: '5th', name: 'Srijeet Chatterjee (CSE)' },
      { position: '6th', name: 'MD Shakib (AIML)' },
    ],
  },
  {
    id: 2,
    type: 2,
    img: EducathonImg,
    title: 'Educathon 2.0',
    avt: logo,
    name: 'Team Samarth',
    tag: '@TechTeam',
    winners: [
    {
      position: "1st",
      name: "🥇 localhost",
      college: "Amrita Vishwa Vidyapeetham, Andhra Pradesh",
    },
    {
      position: "2nd",
      name: "🥈 KonisBerg",
      college: "Jadavpur University, Kolkata",
    },
    {
      position: "3rd",
      name: "🥉 Chakravyuh",
      college: "Adamas University, Kolkata",
    },
    {
      position: "Special Mention",
      name: "pnpm_build",
      college: "Techno Main Salt Lake, Kolkata",
    },
    {
      position: "Special Mention",
      name: "SheCodes",
      college: "Heritage Institute of Technology, Kolkata",
    },
    ],
  },
  {
    id: 3,
    type: 2,
    img: TrinayaniImg,
    title: 'Trinayani',
    avt: logo,
    name: 'Team Samarth',
    tag: '@TechTeam',
    winners: [
      {
        position: '1st',
        name: 'SRIJA SARKAR (BCA, 1st Year)',
      },
      {
        position: '2nd',
        name: 'ARITRA GUHA (ECE, 2nd Year)',
      },
      {
        position: '3rd',
        name: 'RISHAV DAS (ECE, 2nd Year)',
      },
      {
        position: 'Special Mention 1',
        name: 'ARIT DHAR (BBA, 2nd Year)',
      },
      {
        position: 'Special Mention 2',
        name: 'INDRADIP DAS (ECE, 2nd Year)',
      },
      {
        position: 'Special Mention 3',
        name: 'SONALI KUMARI (ECS, 2nd Year)',
      },
    ],
  },
  {
    id: 4,
    type: 2,
    img: UtsabDrishtiImg,
    title: 'Utsab Drishti',
    avt: logo,
    name: 'Team Samarth',
    tag: '@TechTeam',
    winners: [
      {
        position: '1st',
        name: 'Soumyabrata Sahu',
        category: 'Photography',
      },
      {
        position: '2nd',
        name: 'Sayan Saha',
        category: 'Photography',
      },
      {
        position: '3rd',
        name: 'Anwesh Mukherjee',
        category: 'Photography',
      },
      {
        position: 'Special Mention',
        name: 'Sudip Haldar',
        category: 'Photography',
      },
      {
        position: 'Special Mention',
        name: 'Arit Dhar',
        category: 'Photography',
      },
      {
        position: 'Special Mention',
        name: 'Mousumio Ghosh',
        category: 'Photography',
      },
      {
        position: 'Special Mention',
        name: 'Soumyodeep Hazra',
        category: 'Photography',
      },
      {
        position: 'Special Mention',
        name: 'Suraj Banerjee',
        category: 'Photography',
      },
      {
        position: '1st',
        name: 'Subham Nandi',
        category: 'Videography',
      },
      {
        position: '2nd',
        name: 'Rahul Kr Shaw',
        category: 'Videography',
      },
      {
        position: '3rd',
        name: 'Debangi Das',
        category: 'Videography',
      },
      {
        position: 'Special Mention',
        name: 'Sayan Saha',
        category: 'Videography',
      },
    ],
  },
];

export default results;
