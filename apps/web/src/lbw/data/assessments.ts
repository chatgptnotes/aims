import type { Assessment } from '../types/brain-wellness'

// ADHD Rating Scale (Age-based as per masterplan)
export const adhdAssessment: Assessment = {
  id: 'adhd-rating-scale',
  title: 'ADHD Rating Scale',
  description: 'Comprehensive evaluation of attention, hyperactivity, and executive function symptoms',
  type: 'adhd',
  estimatedTime: 15,
  questions: [
    {
      id: 'adhd_1',
      text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_2',
      text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_3',
      text: 'How often do you have problems remembering appointments or obligations?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_4',
      text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_5',
      text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_6',
      text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_7',
      text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_8',
      text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_9',
      text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_10',
      text: 'How often do you misplace or have difficulty finding things at home or at work?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_11',
      text: 'How often are you distracted by activity or noise around you?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_12',
      text: 'How often do you leave your seat in meetings or other situations where you are expected to remain seated?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_13',
      text: 'How often do you feel restless or fidgety?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_14',
      text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_15',
      text: 'How often do you find yourself talking too much when you are in social situations?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_16',
      text: 'When you\'re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_17',
      text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'adhd_18',
      text: 'How often do you interrupt others when they are busy?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    }
  ],
  scoring: {
    maxScore: 54,
    categories: [
      {
        name: 'Minimal',
        range: [0, 13],
        description: 'Minimal likelihood of ADHD symptoms',
        color: 'green'
      },
      {
        name: 'Mild',
        range: [14, 23],
        description: 'Mild ADHD symptoms present',
        color: 'yellow'
      },
      {
        name: 'Moderate',
        range: [24, 35],
        description: 'Moderate ADHD symptoms that may benefit from intervention',
        color: 'orange'
      },
      {
        name: 'Severe',
        range: [36, 54],
        description: 'Significant ADHD symptoms requiring professional evaluation',
        color: 'red'
      }
    ]
  }
}

// GAD-7 (Generalized Anxiety Disorder Scale)
export const gad7Assessment: Assessment = {
  id: 'gad-7',
  title: 'GAD-7 Anxiety Scale',
  description: 'Generalized Anxiety Disorder scale to assess anxiety symptoms and severity',
  type: 'gad7',
  estimatedTime: 5,
  questions: [
    {
      id: 'gad7_1',
      text: 'Feeling nervous, anxious, or on edge',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_2',
      text: 'Not being able to stop or control worrying',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_3',
      text: 'Worrying too much about different things',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_4',
      text: 'Trouble relaxing',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_5',
      text: 'Being so restless that it\'s hard to sit still',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_6',
      text: 'Becoming easily annoyed or irritable',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'gad7_7',
      text: 'Feeling afraid as if something awful might happen',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    }
  ],
  scoring: {
    maxScore: 21,
    categories: [
      {
        name: 'Minimal',
        range: [0, 4],
        description: 'Minimal anxiety symptoms',
        color: 'green'
      },
      {
        name: 'Mild',
        range: [5, 9],
        description: 'Mild anxiety symptoms',
        color: 'yellow'
      },
      {
        name: 'Moderate',
        range: [10, 14],
        description: 'Moderate anxiety symptoms',
        color: 'orange'
      },
      {
        name: 'Severe',
        range: [15, 21],
        description: 'Severe anxiety symptoms',
        color: 'red'
      }
    ]
  }
}

// PSS (Perceived Stress Scale)
export const pssAssessment: Assessment = {
  id: 'pss-10',
  title: 'Perceived Stress Scale (PSS-10)',
  description: 'Measures your stress levels and coping mechanisms over the past month',
  type: 'pss',
  estimatedTime: 10,
  questions: [
    {
      id: 'pss_1',
      text: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'pss_2',
      text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'pss_3',
      text: 'In the last month, how often have you felt nervous and stressed?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'pss_4',
      text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'pss_5',
      text: 'In the last month, how often have you felt that things were going your way?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'pss_6',
      text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'pss_7',
      text: 'In the last month, how often have you been able to control irritations in your life?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'pss_8',
      text: 'In the last month, how often have you felt that you were on top of things?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'pss_9',
      text: 'In the last month, how often have you been angered because of things that happened that were outside of your control?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'pss_10',
      text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    }
  ],
  scoring: {
    maxScore: 40,
    categories: [
      {
        name: 'Low Stress',
        range: [0, 13],
        description: 'Low perceived stress levels',
        color: 'green'
      },
      {
        name: 'Moderate Stress',
        range: [14, 26],
        description: 'Moderate perceived stress levels',
        color: 'yellow'
      },
      {
        name: 'High Stress',
        range: [27, 40],
        description: 'High perceived stress levels requiring attention',
        color: 'red'
      }
    ]
  }
}

// Memory Assessment (Cognitive)
export const memoryAssessment: Assessment = {
  id: 'memory-assessment',
  title: 'Memory & Cognitive Assessment',
  description: 'Evaluate your working memory, recall abilities, and cognitive processing speed',
  type: 'memory',
  estimatedTime: 20,
  questions: [
    {
      id: 'memory_1',
      text: 'How often do you forget where you put something like keys, wallet, or important documents?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'memory_2',
      text: 'How often do you forget appointments, meetings, or important dates?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'memory_3',
      text: 'How often do you have trouble remembering names of people you meet?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'memory_4',
      text: 'How often do you walk into a room and forget why you went there?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'memory_5',
      text: 'How would you rate your ability to remember details from conversations?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Very Poor', max: 'Excellent' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'memory_6',
      text: 'How would you rate your ability to learn new information quickly?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Very Poor', max: 'Excellent' },
      required: true,
      weight: -1 // Reverse scored
    }
  ],
  scoring: {
    maxScore: 30,
    categories: [
      {
        name: 'Excellent',
        range: [6, 12],
        description: 'Excellent memory function',
        color: 'green'
      },
      {
        name: 'Good',
        range: [13, 18],
        description: 'Good memory function',
        color: 'yellow'
      },
      {
        name: 'Fair',
        range: [19, 24],
        description: 'Fair memory function - room for improvement',
        color: 'orange'
      },
      {
        name: 'Needs Improvement',
        range: [25, 30],
        description: 'Memory function could benefit from training',
        color: 'red'
      }
    ]
  }
}

// Mood Assessment
export const moodAssessment: Assessment = {
  id: 'mood-assessment',
  title: 'Mood & Emotional Regulation Assessment',
  description: 'Comprehensive mood evaluation including depression and emotional regulation',
  type: 'mood',
  estimatedTime: 12,
  questions: [
    {
      id: 'mood_1',
      text: 'Over the past two weeks, how often have you been bothered by little interest or pleasure in doing things?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'mood_2',
      text: 'Over the past two weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 3,
      scaleLabels: { min: 'Not at all', max: 'Nearly every day' },
      required: true,
      weight: 1
    },
    {
      id: 'mood_3',
      text: 'How often do you experience sudden mood changes that feel difficult to control?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    },
    {
      id: 'mood_4',
      text: 'How would you rate your overall emotional stability?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Very Unstable', max: 'Very Stable' },
      required: true,
      weight: -1 // Reverse scored
    },
    {
      id: 'mood_5',
      text: 'How often do you feel overwhelmed by your emotions?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 4,
      scaleLabels: { min: 'Never', max: 'Very Often' },
      required: true,
      weight: 1
    }
  ],
  scoring: {
    maxScore: 20,
    categories: [
      {
        name: 'Stable',
        range: [0, 5],
        description: 'Stable mood and emotional regulation',
        color: 'green'
      },
      {
        name: 'Mild Concerns',
        range: [6, 10],
        description: 'Mild mood concerns',
        color: 'yellow'
      },
      {
        name: 'Moderate Concerns',
        range: [11, 15],
        description: 'Moderate mood concerns requiring attention',
        color: 'orange'
      },
      {
        name: 'Significant Concerns',
        range: [16, 20],
        description: 'Significant mood concerns requiring professional support',
        color: 'red'
      }
    ]
  }
}

export const allAssessments = [
  adhdAssessment,
  gad7Assessment,
  pssAssessment,
  memoryAssessment,
  moodAssessment
]

export function getAssessmentById(id: string): Assessment | undefined {
  return allAssessments.find(assessment => assessment.id === id)
}

export function calculateAssessmentScore(assessment: Assessment, responses: Record<string, number>): {
  score: number
  category: string
  insights: string[]
  recommendations: string[]
} {
  let totalScore = 0
  
  assessment.questions.forEach(question => {
    const response = responses[question.id]
    if (response !== undefined) {
      const weight = question.weight || 1
      if (weight < 0) {
        // Reverse scoring
        const maxValue = question.scaleMax || 5
        totalScore += (maxValue - response) * Math.abs(weight)
      } else {
        totalScore += response * weight
      }
    }
  })

  // Find the appropriate category
  const category = assessment.scoring.categories.find(cat => 
    totalScore >= cat.range[0] && totalScore <= cat.range[1]
  ) || assessment.scoring.categories[0]

  // Generate insights and recommendations based on assessment type and score
  const insights = generateInsights(assessment.type, totalScore, assessment.scoring.maxScore)
  const recommendations = generateRecommendations(assessment.type, category.name.toLowerCase())

  return {
    score: totalScore,
    category: category.name,
    insights,
    recommendations
  }
}

function generateInsights(assessmentType: string, score: number, maxScore: number): string[] {
  const percentage = (score / maxScore) * 100
  
  switch (assessmentType) {
    case 'adhd':
      if (percentage < 25) {
        return [
          'Your responses suggest minimal ADHD-related symptoms',
          'You appear to have good attention and focus abilities',
          'Executive function seems to be functioning well'
        ]
      } else if (percentage < 50) {
        return [
          'You show some mild ADHD-related symptoms',
          'Focus and organization may occasionally be challenging',
          'Some executive function areas could benefit from support'
        ]
      } else if (percentage < 75) {
        return [
          'Moderate ADHD symptoms are present in your responses',
          'Attention, focus, and organization are significant challenges',
          'Executive function difficulties are impacting daily life'
        ]
      } else {
        return [
          'Your responses indicate significant ADHD-related symptoms',
          'Attention, hyperactivity, and executive function are major challenges',
          'Professional evaluation and support would be highly beneficial'
        ]
      }
    
    case 'gad7':
      if (percentage < 25) {
        return [
          'Minimal anxiety symptoms detected',
          'You appear to manage stress and worry effectively',
          'Anxiety does not seem to significantly impact your daily life'
        ]
      } else if (percentage < 50) {
        return [
          'Mild anxiety symptoms are present',
          'Some worry and nervousness may affect your daily activities',
          'Stress management techniques could be helpful'
        ]
      } else if (percentage < 75) {
        return [
          'Moderate anxiety levels detected',
          'Worry and anxiety are significantly impacting your life',
          'Professional support and coping strategies would be beneficial'
        ]
      } else {
        return [
          'High levels of anxiety symptoms',
          'Anxiety is severely impacting your daily functioning',
          'Professional help is strongly recommended'
        ]
      }
    
    case 'pss':
      if (percentage < 35) {
        return [
          'Low perceived stress levels',
          'You handle life\'s challenges effectively',
          'Good stress management and coping skills'
        ]
      } else if (percentage < 65) {
        return [
          'Moderate stress levels detected',
          'Some challenges in managing life\'s demands',
          'Stress reduction techniques could be helpful'
        ]
      } else {
        return [
          'High perceived stress levels',
          'Significant difficulty managing life\'s demands',
          'Stress is likely impacting your health and well-being'
        ]
      }
    
    case 'memory':
      if (percentage < 40) {
        return [
          'Excellent memory and cognitive function',
          'Strong recall and retention abilities',
          'Cognitive processing appears to be functioning well'
        ]
      } else if (percentage < 60) {
        return [
          'Good memory function with minor concerns',
          'Some occasional memory lapses are normal',
          'Overall cognitive function is healthy'
        ]
      } else if (percentage < 80) {
        return [
          'Fair memory function with room for improvement',
          'Memory challenges may be affecting daily activities',
          'Cognitive training could be beneficial'
        ]
      } else {
        return [
          'Memory function shows significant challenges',
          'Memory difficulties are impacting daily life',
          'Cognitive enhancement strategies are recommended'
        ]
      }
    
    case 'mood':
      if (percentage < 25) {
        return [
          'Stable mood and emotional regulation',
          'Good emotional resilience and coping skills',
          'Mental health appears to be in good condition'
        ]
      } else if (percentage < 50) {
        return [
          'Mild mood concerns detected',
          'Some emotional regulation challenges may be present',
          'Mood management techniques could be helpful'
        ]
      } else if (percentage < 75) {
        return [
          'Moderate mood concerns requiring attention',
          'Emotional regulation is challenging',
          'Professional support would be beneficial'
        ]
      } else {
        return [
          'Significant mood and emotional concerns',
          'Emotional regulation is severely impacted',
          'Professional mental health support is strongly recommended'
        ]
      }
    
    default:
      return ['Assessment completed successfully']
  }
}

function generateRecommendations(assessmentType: string, category: string): string[] {
  const baseRecommendations = {
    adhd: {
      minimal: [
        'Continue maintaining good organizational habits',
        'Consider time management techniques to optimize productivity',
        'Regular exercise can help maintain focus and attention'
      ],
      mild: [
        'Implement daily planning and organization systems',
        'Try mindfulness meditation for improved focus',
        'Consider cognitive behavioral strategies for executive function',
        'Regular exercise and adequate sleep are crucial'
      ],
      moderate: [
        'Work with a brain wellness coach for personalized strategies',
        'Consider QEEG brain mapping for detailed insights',
        'Implement structured daily routines and organization systems',
        'Cognitive training exercises may be beneficial',
        'Consult with a healthcare provider about treatment options'
      ],
      severe: [
        'Professional evaluation by a qualified healthcare provider is recommended',
        'Consider comprehensive QEEG brain mapping',
        'Work with specialized ADHD coaches and therapists',
        'Medication evaluation may be appropriate',
        'Implement comprehensive life management strategies'
      ]
    },
    gad7: {
      minimal: [
        'Continue current stress management practices',
        'Maintain regular exercise and healthy sleep habits',
        'Practice gratitude and mindfulness regularly'
      ],
      mild: [
        'Learn and practice relaxation techniques',
        'Consider mindfulness-based stress reduction',
        'Regular exercise and good sleep hygiene',
        'Limit caffeine and practice deep breathing'
      ],
      moderate: [
        'Work with a nervous system coach',
        'Consider cognitive behavioral therapy techniques',
        'Practice daily meditation and breathwork',
        'Professional counseling may be beneficial'
      ],
      severe: [
        'Seek professional mental health support immediately',
        'Consider therapy and possible medication evaluation',
        'Learn crisis management techniques',
        'Build a strong support network'
      ]
    },
    pss: {
      'low stress': [
        'Maintain current healthy coping strategies',
        'Continue regular self-care practices',
        'Share your successful stress management with others'
      ],
      'moderate stress': [
        'Implement stress reduction techniques like meditation',
        'Improve time management and organization',
        'Regular physical activity and relaxation',
        'Consider stress management coaching'
      ],
      'high stress': [
        'Priority focus on stress reduction is essential',
        'Professional stress management support recommended',
        'Learn and practice daily stress reduction techniques',
        'Consider nervous system coaching and therapy'
      ]
    },
    memory: {
      excellent: [
        'Continue current brain-healthy habits',
        'Maintain challenging cognitive activities',
        'Regular exercise and good nutrition support memory'
      ],
      good: [
        'Practice memory enhancement techniques',
        'Engage in regular cognitive challenges',
        'Maintain brain-healthy lifestyle habits'
      ],
      fair: [
        'Start cognitive training and memory exercises',
        'Consider brain nutrition optimization',
        'Practice memory techniques like memory palace',
        'Regular exercise improves cognitive function'
      ],
      'needs improvement': [
        'Comprehensive cognitive training program recommended',
        'Consider working with a brain wellness coach',
        'Optimize nutrition for brain health',
        'Rule out underlying causes with healthcare provider'
      ]
    },
    mood: {
      stable: [
        'Continue current emotional wellness practices',
        'Maintain healthy relationships and social connections',
        'Regular self-care and stress management'
      ],
      'mild concerns': [
        'Practice mood regulation techniques',
        'Regular exercise and good sleep hygiene',
        'Consider mindfulness and emotional intelligence training'
      ],
      'moderate concerns': [
        'Work with a mental health professional',
        'Learn emotional regulation strategies',
        'Consider mood tracking and lifestyle modifications',
        'Build strong social support networks'
      ],
      'significant concerns': [
        'Seek professional mental health support immediately',
        'Consider therapy and possible medication evaluation',
        'Develop crisis management plans',
        'Work with specialized mood disorder professionals'
      ]
    }
  }

  const recommendations = baseRecommendations[assessmentType as keyof typeof baseRecommendations]
  return (recommendations as any)?.[category] || [
    'Complete your assessment to receive personalized recommendations',
    'Work with our brain wellness coaches for personalized guidance',
    'Continue to track your progress over time'
  ]
}
