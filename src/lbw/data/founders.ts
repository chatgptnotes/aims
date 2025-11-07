// Limitless Brain Lab Founders and Research Information

export interface Founder {
  id: string
  name: string
  title: string
  role: string
  imageUrl: string
  bio: string
  education: string[]
  achievements: string[]
  specialties: string[]
  languages: string[]
  publications: string
  patients: string
  awards: string[]
  currentPositions: string[]
  yearsExperience: number
}

export interface CompanyInfo {
  name: string
  mission: string
  locations: string[]
  founded: number
  researchFocus: string[]
  keyMetrics: {
    brainsMapped: number
    studentsHelped: number
    seminarsDelivered: number
    livesImpacted: number
    countriesServed: number
  }
  services: string[]
  methodology: string[]
}

export const founders: Founder[] = [
  {
    id: 'dr-sweta-adatia',
    name: 'Dr. Sweta Adatia',
    title: 'Founder & Chief Scientist',
    role: 'Neurologist, Brain Performance Expert, Author',
    imageUrl: '/images/founders/dr-sweta-adatia.jpg',
    bio: `Dr. Sweta Adatia is a highly accomplished neurologist and the driving force behind Limitless Brain Lab. She is internationally recognized for her pioneering work in mapping peak performer brains and developing neuroscience-based tools for human optimization. With over 21 years of neurological expertise across five countries and three continents, she uniquely bridges ancient wisdom with modern neuroscience.`,
    education: [
      'MBBS (2003) - Saurashtra University, India (13+ gold medals and prizes)',
      'MD in Medicine (2006) - Saurashtra University, India',
      'DNB in Neurology (2007-2010) - Lilavati Hospital and Research Centre, Mumbai',
      'Stroke Fellowship (2013) - University of Calgary, Canada',
      'MBA in Healthcare (2017-2020) - University of Cambridge, UK (Scholarship recipient)',
      'Fellowship of the American College of Physicians (FACP, 2020) - USA',
      'Visharad (BA equivalent) in Harmonium',
      'Advanced Pranic Healing and Pranic Psychotherapy Training',
      'Hypnotherapy and Past Life Regression Training - Dr. Brian Weiss',
      'Neurofeedback Training - California, USA'
    ],
    achievements: [
      'Mapped over 1,000 brains of peak performers globally',
      'Developed 10 proprietary Cognitive Metrics for brain assessment',
      'Published 50+ research papers in medical journals',
      'Authored multiple neurology books including "Future Ready Now" (Amazon global bestseller)',
      'Positively impacted over 50,000 lives through clinical practice',
      'Helped map over 5,000 students\' careers through MyBrainDesign tool',
      'Delivered 200+ seminars on neuroscience applications',
      'Enrolled 1,000+ students in neuroscience-based transformation courses',
      'TEDx speaker and international keynote presenter',
      'Invited to work with UN NCD program for 90 low and medium income countries (2021)'
    ],
    specialties: [
      'Precision Brain Mapping',
      'Peak Performance Neuroscience',
      'Neurofeedback and Cognitive Assessments',
      'Career Guidance Through Brain Design',
      'Integrative Brain Care',
      'Stroke and Neurological Disorders',
      'Migraines and Headache Management',
      'Parkinson\'s Disease Treatment',
      'Multiple Sclerosis Care',
      'Mood Disorders and Mental Health',
      'Neuro-meditation and Mindfulness',
      'Ancient Wisdom Integration with Modern Science'
    ],
    languages: [
      'English',
      'Hindi',
      'Gujarati',
      'Marathi',
      'Arabic',
      'French',
      'Spanish'
    ],
    publications: '50+ research papers and multiple neurology books',
    patients: '50,000+ lives positively impacted',
    awards: [
      'Best Neurologist Award - UAE (2022)',
      '13+ Gold Medals and Prizes during MBBS',
      'Cambridge MBA Scholarship Recipient',
      'Fellowship of American College of Physicians',
      'National Level Table Tennis Championships Competitor',
      'Forbes Recognition for MyBrainDesign Tool as "Must-do for 21st Century Success"'
    ],
    currentPositions: [
      'Specialist Neurologist - Gargash Hospital, Dubai (2023-Present)',
      'Founder - Limitless Brain Lab',
      'Creator - MyBrainDesign Assessment Tool',
      'Director - Limitless Brain Academy',
      'International Keynote Speaker',
      'Brain Coach and Career Counselor'
    ],
    yearsExperience: 21
  }
]

export const companyInfo: CompanyInfo = {
  name: 'Limitless Brain Lab',
  mission: 'Bridging ancient wisdom with modern neuroscience to unlock and elevate brain performance through personalized insights and peak performer brain mapping.',
  locations: [
    'Cambridge, United Kingdom',
    'Mumbai, India', 
    'Dubai, United Arab Emirates'
  ],
  founded: 2013,
  researchFocus: [
    'Peak Performer Brain Mapping',
    'Cognitive Enhancement Protocols',
    'Ancient Wisdom Integration',
    'Neurofeedback Applications',
    'Career Optimization Through Brain Design',
    'Neuroplasticity and Brain Training',
    'Meditation and Mindfulness Neuroscience',
    'Integrative Neurological Care'
  ],
  keyMetrics: {
    brainsMapped: 1000,
    studentsHelped: 5000,
    seminarsDelivered: 200,
    livesImpacted: 50000,
    countriesServed: 5
  },
  services: [
    'Precision Brain Mapping',
    'Neurofeedback and Cognitive Assessments', 
    'Career Guidance Through Brain Design',
    'Integrative Brain Care',
    'Educational Workshops and Seminars',
    'MyBrainDesign Assessment Tool',
    'Neuroscience-Based Coaching',
    'Peak Performance Training',
    'Neurological Condition Treatment',
    'Brain Optimization Programs'
  ],
  methodology: [
    'Proprietary 10 Cognitive Metrics Assessment',
    'Peak Performer Brain Pattern Analysis',
    'Integration of Ancient Wisdom with Modern Science',
    'Collaborative International Research',
    'Holistic Brain-Body-Mind Approach',
    'Evidence-Based Neurofeedback Protocols',
    'Personalized Brain Training Programs',
    'Cross-Cultural Neuroscience Studies'
  ]
}

export const researchHighlights = [
  {
    title: 'Peak Performer Brain Mapping',
    description: 'Comprehensive study of over 1,000 high achiever brains to identify neural patterns of success',
    impact: 'Development of 10 proprietary Cognitive Metrics for brain performance assessment'
  },
  {
    title: 'MyBrainDesign Tool Development', 
    description: 'Creation of Forbes-recognized assessment tool for career optimization based on brain preferences',
    impact: 'Over 5,000 students\' careers successfully mapped and guided'
  },
  {
    title: 'Ancient Wisdom Integration',
    description: 'Scientific validation of traditional practices like pranayama and meditation for cognitive enhancement',
    impact: 'Bridge between 5,000-year-old wisdom and cutting-edge neuroscience'
  },
  {
    title: 'Global Neuroscience Education',
    description: 'International seminars and workshops making neuroscience accessible for personal transformation',
    impact: '200+ seminars delivered, 1,000+ students enrolled in transformation courses'
  },
  {
    title: 'Integrative Neurological Care',
    description: 'Holistic treatment approach combining conventional neurology with complementary therapies',
    impact: '50,000+ lives positively impacted across 5 countries and 3 continents'
  }
]

export const collaborations = [
  {
    organization: 'University of Cambridge',
    type: 'Academic Partnership',
    focus: 'Healthcare MBA and Neuroscience Research'
  },
  {
    organization: 'University of Calgary',
    type: 'Clinical Fellowship',
    focus: 'Stroke Research and Treatment'
  },
  {
    organization: 'Neethling Brain Instrument (NBI)',
    type: 'Technology Partnership', 
    focus: 'Brain Assessment Tool Development'
  },
  {
    organization: 'United Nations',
    type: 'Global Health Initiative',
    focus: 'NCD Program for 90 Low and Medium Income Countries'
  },
  {
    organization: 'American College of Physicians',
    type: 'Professional Fellowship',
    focus: 'Medical Excellence and Research Standards'
  }
]
