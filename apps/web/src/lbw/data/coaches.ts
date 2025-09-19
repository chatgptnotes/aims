import { Coach, TimeSlot, ImprovementFocus } from '../types/brain-wellness'

export const sampleCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'Dr. Sarah Chen',
    title: 'Brain Performance Coach',
    specialty: ['adhd', 'memory'] as ImprovementFocus[],
    bio: 'Dr. Chen specializes in ADHD management and cognitive enhancement with 15 years of experience in neuropsychology. She has helped over 500 clients improve their focus and executive function.',
    imageUrl: '/avatars/sarah-chen.jpg',
    rating: 4.9,
    totalSessions: 250,
    certifications: [
      'Ph.D. Neuropsychology',
      'Certified ADHD Coach',
      'Brain Training Specialist',
      'Executive Function Coach'
    ],
    languages: ['English', 'Mandarin'],
    pricing: [
      {
        sessionType: 'Brain Coaching Session',
        price: 80,
        duration: 60
      },
      {
        sessionType: 'ADHD Strategy Session',
        price: 90,
        duration: 75
      },
      {
        sessionType: 'Executive Function Training',
        price: 100,
        duration: 90
      }
    ],
    availability: generateAvailability('coach-1')
  },
  {
    id: 'coach-2',
    name: 'Michael Rodriguez',
    title: 'Nervous System Specialist',
    specialty: ['stress', 'wellness'] as ImprovementFocus[],
    bio: 'Michael is a trauma-informed nervous system coach with expertise in stress management and emotional regulation. He uses somatic approaches and mindfulness techniques.',
    imageUrl: '/avatars/michael-rodriguez.jpg',
    rating: 4.8,
    totalSessions: 180,
    certifications: [
      'M.A. Clinical Psychology',
      'Trauma-Informed Coach',
      'Somatic Experiencing Practitioner',
      'Mindfulness Teacher'
    ],
    languages: ['English', 'Spanish'],
    pricing: [
      {
        sessionType: 'Nervous System Coaching',
        price: 90,
        duration: 60
      },
      {
        sessionType: 'Stress Management Session',
        price: 85,
        duration: 60
      },
      {
        sessionType: 'Trauma Recovery Support',
        price: 110,
        duration: 90
      }
    ],
    availability: generateAvailability('coach-2')
  },
  {
    id: 'coach-3',
    name: 'Dr. Lisa Thompson',
    title: 'Neurofeedback Expert',
    specialty: ['adhd', 'memory', 'stress'] as ImprovementFocus[],
    bio: 'Dr. Thompson is a leading expert in qEEG analysis and neurofeedback training. She has conducted over 1000 brain maps and specializes in personalized brain training protocols.',
    imageUrl: '/avatars/lisa-thompson.jpg',
    rating: 4.9,
    totalSessions: 320,
    certifications: [
      'Ph.D. Neuroscience',
      'BCIA Certified Neurofeedback',
      'qEEG Diplomat',
      'Brain Mapping Specialist'
    ],
    languages: ['English', 'French'],
    pricing: [
      {
        sessionType: 'qEEG Consultation',
        price: 150,
        duration: 90
      },
      {
        sessionType: 'Brain Map Analysis',
        price: 120,
        duration: 60
      },
      {
        sessionType: 'Neurofeedback Planning',
        price: 100,
        duration: 75
      }
    ],
    availability: generateAvailability('coach-3')
  }
]

function generateAvailability(coachId: string): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startDate = new Date()
  
  // Generate availability for next 30 days
  for (let i = 1; i <= 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Skip weekends for simplicity
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    // Generate time slots for each day (9 AM to 5 PM)
    const timeSlots = [
      { hour: 9, minute: 0 },
      { hour: 10, minute: 30 },
      { hour: 12, minute: 0 },
      { hour: 13, minute: 30 },
      { hour: 15, minute: 0 },
      { hour: 16, minute: 30 }
    ]
    
    timeSlots.forEach((time) => {
      const slotDate = new Date(date)
      slotDate.setHours(time.hour, time.minute, 0, 0)
      
      // Some randomness for availability
      const isAvailable = Math.random() > 0.3
      
      slots.push({
        id: `${coachId}-${date.toISOString().split('T')[0]}-${time.hour}-${time.minute}`,
        datetime: slotDate.toISOString(),
        duration: 60,
        available: isAvailable,
        timeZone: 'America/New_York'
      })
    })
  }
  
  return slots
}

export const getCoachById = (id: string): Coach | undefined => {
  return sampleCoaches.find(coach => coach.id === id)
}

export const getCoachesBySpecialty = (specialty: ImprovementFocus): Coach[] => {
  return sampleCoaches.filter(coach => 
    coach.specialty.includes(specialty)
  )
}

export const getAvailableTimeSlots = (coachId: string, date?: string): TimeSlot[] => {
  const coach = getCoachById(coachId)
  if (!coach) return []
  
  let slots = coach.availability.filter(slot => slot.available)
  
  if (date) {
    const targetDate = new Date(date).toDateString()
    slots = slots.filter(slot => 
      new Date(slot.datetime).toDateString() === targetDate
    )
  }
  
  return slots.sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  )
}
