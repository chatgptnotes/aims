import type { QuoteContent, VideoContent, ArticleContent, BreathworkContent, NutritionContent, TaskContent, ImprovementFocus } from '../types/brain-wellness'

// Sample daily quotes
export const sampleQuotes: QuoteContent[] = [
  {
    id: 'quote-1',
    text: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    category: 'wellness',
    mood: 'inspiring'
  },
  {
    id: 'quote-2',
    text: 'Your brain is not fixed. With focused practice, you can literally rewire it.',
    author: 'Dr. Michael Merzenich',
    category: 'adhd',
    mood: 'empowering'
  },
  {
    id: 'quote-3',
    text: 'Memory is the architecture of the future.',
    author: 'Dr. Karim Nader',
    category: 'memory',
    mood: 'motivational'
  },
  {
    id: 'quote-4',
    text: 'Between stimulus and response there is a space. In that space is our power to choose our response.',
    author: 'Viktor Frankl',
    category: 'stress',
    mood: 'calming'
  },
  {
    id: 'quote-5',
    text: 'You have been assigned this mountain to show others it can be moved.',
    author: 'Mel Robbins',
    category: 'wellness',
    mood: 'empowering'
  }
]

// Sample video content
export const sampleVideos: VideoContent[] = [
  {
    id: 'video-1',
    title: '5-Minute Focus Meditation',
    description: 'A guided meditation specifically designed to enhance attention and focus for ADHD minds.',
    url: 'https://example.com/focus-meditation',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    duration: 300,
    category: 'adhd',
    difficulty: 'beginner',
    tags: ['meditation', 'focus', 'attention', 'mindfulness']
  },
  {
    id: 'video-2',
    title: 'Memory Palace Technique',
    description: 'Learn the ancient memory palace technique to dramatically improve your recall abilities.',
    url: 'https://example.com/memory-palace',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    duration: 720,
    category: 'memory',
    difficulty: 'intermediate',
    tags: ['memory', 'techniques', 'learning', 'cognitive training']
  },
  {
    id: 'video-3',
    title: 'Box Breathing for Stress Relief',
    description: 'Master the Navy SEAL breathing technique for instant stress relief and emotional regulation.',
    url: 'https://example.com/box-breathing',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
    duration: 480,
    category: 'stress',
    difficulty: 'beginner',
    tags: ['breathing', 'stress relief', 'calm', 'anxiety']
  },
  {
    id: 'video-4',
    title: 'Morning Mood Boost Routine',
    description: 'A 10-minute morning routine designed to elevate your mood and energy for the day.',
    url: 'https://example.com/mood-boost',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    duration: 600,
    category: 'wellness',
    difficulty: 'beginner',
    tags: ['morning routine', 'mood', 'energy', 'positivity']
  }
]

// Sample articles
export const sampleArticles: ArticleContent[] = [
  {
    id: 'article-1',
    title: 'Understanding Your ADHD Brain: A Neuroscience Perspective',
    excerpt: 'Discover how your ADHD brain works differently and why these differences are actually strengths waiting to be unlocked.',
    content: `# Understanding Your ADHD Brain: A Neuroscience Perspective

Your ADHD brain isn't broken—it's beautifully different. Recent neuroscience research reveals that ADHD brains have unique strengths and capabilities that, when properly understood and supported, can become powerful assets.

## The ADHD Brain Difference

ADHD brains show distinct patterns in several key areas:

### 1. Prefrontal Cortex
The "CEO" of your brain develops differently, affecting executive functions like planning, organization, and impulse control.

### 2. Dopamine Pathways
Your brain's reward system operates at different baseline levels, making motivation and sustained attention more challenging but also enabling hyperfocus states.

### 3. Default Mode Network
The brain's "idle" state is more active, leading to increased creativity and innovative thinking.

## Your Strengths

- **Hyperfocus**: Ability to achieve intense concentration on interesting tasks
- **Creativity**: Enhanced divergent thinking and problem-solving
- **Resilience**: Developed coping strategies from navigating challenges
- **Empathy**: Often increased emotional sensitivity and understanding

## Optimization Strategies

1. Work with your natural rhythms
2. Create external structure to support internal organization
3. Use movement and fidgeting as focus tools
4. Leverage hyperfocus periods for important work
5. Practice self-compassion and celebrate small wins

Remember: You're not broken. You're becoming limitless.`,
    readTime: 5,
    category: 'adhd',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600',
    author: 'Dr. Sarah Johnson, Neuroscientist',
    publishedAt: '2024-01-15T10:00:00Z',
    tags: ['neuroscience', 'ADHD', 'brain health', 'strengths']
  },
  {
    id: 'article-2',
    title: 'The Science of Memory: How to Train Your Brain to Remember',
    excerpt: 'Learn evidence-based techniques to enhance your memory and cognitive performance through targeted training.',
    content: `# The Science of Memory: How to Train Your Brain to Remember

Memory isn't fixed—it's a skill that can be developed and strengthened through understanding and practice.

## Types of Memory

### Working Memory
Your brain's scratchpad for holding and manipulating information temporarily.

### Long-term Memory
- **Declarative**: Facts and events you can consciously recall
- **Procedural**: Skills and habits that become automatic

## Memory Enhancement Techniques

### 1. Spaced Repetition
Review information at increasing intervals to strengthen neural pathways.

### 2. Elaborative Encoding
Connect new information to existing knowledge for deeper processing.

### 3. Memory Palace Method
Use spatial memory to create vivid, memorable journeys.

### 4. Dual Coding
Combine visual and verbal information for enhanced recall.

## Daily Memory Boosters

- **Get quality sleep** (7-9 hours) for memory consolidation
- **Exercise regularly** to increase BDNF (brain-derived neurotrophic factor)
- **Practice mindfulness** to improve attention and encoding
- **Stay socially connected** for cognitive stimulation
- **Learn new skills** to build neural plasticity

## Nutrition for Memory

- Omega-3 fatty acids (fish, walnuts)
- Antioxidants (berries, dark chocolate)
- B vitamins (leafy greens, eggs)
- Adequate hydration

Your memory is more powerful than you think—train it like the muscle it is!`,
    readTime: 7,
    category: 'memory',
    imageUrl: 'https://images.unsplash.com/photo-1586888036932-5d14de7a6893?w=600',
    author: 'Dr. Michael Chen, Cognitive Scientist',
    publishedAt: '2024-01-14T14:30:00Z',
    tags: ['memory', 'cognitive training', 'neuroscience', 'learning']
  }
]

// Sample breathwork exercises
export const sampleBreathwork: BreathworkContent[] = [
  {
    id: 'breathwork-1',
    title: '4-7-8 Calming Breath',
    description: 'A powerful breathing technique to activate your parasympathetic nervous system and reduce anxiety.',
    technique: 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts',
    duration: 10,
    instructions: [
      'Sit comfortably with your back straight',
      'Place the tip of your tongue behind your upper front teeth',
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth for 8 counts',
      'Repeat 3-7 times'
    ],
    audioUrl: 'https://example.com/audio/478-breathing',
    difficulty: 'beginner',
    benefits: [
      'Reduces anxiety and stress',
      'Improves sleep quality',
      'Lowers blood pressure',
      'Enhances emotional regulation'
    ]
  },
  {
    id: 'breathwork-2',
    title: 'Box Breathing for Focus',
    description: 'Navy SEAL breathing technique to enhance concentration and mental clarity.',
    technique: 'Equal counts for inhale, hold, exhale, hold (4-4-4-4)',
    duration: 5,
    instructions: [
      'Sit upright with feet flat on the floor',
      'Inhale slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 5-10 minutes'
    ],
    difficulty: 'beginner',
    benefits: [
      'Improves focus and concentration',
      'Reduces stress and anxiety',
      'Enhances emotional stability',
      'Increases mental resilience'
    ]
  }
]

// Sample nutrition content
export const sampleNutrition: NutritionContent[] = [
  {
    id: 'nutrition-1',
    title: 'Brain-Boosting Omega-3 Smoothie',
    description: 'A delicious smoothie packed with omega-3s and antioxidants to support cognitive function.',
    type: 'recipe',
    content: 'This smoothie combines the brain-boosting power of omega-3 rich ingredients with antioxidants for optimal cognitive support.',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    category: 'memory',
    ingredients: [
      '1 cup blueberries (fresh or frozen)',
      '1 tablespoon chia seeds',
      '1/4 avocado',
      '1 cup almond milk',
      '1 tablespoon almond butter',
      '1 teaspoon honey (optional)',
      '1/2 teaspoon vanilla extract'
    ],
    instructions: [
      'Add all ingredients to a high-speed blender',
      'Blend until smooth and creamy',
      'Add ice if desired for a thicker consistency',
      'Pour into a glass and enjoy immediately'
    ]
  },
  {
    id: 'nutrition-2',
    title: 'ADHD-Friendly Protein Power Bowl',
    description: 'A balanced meal designed to support sustained energy and focus throughout the day.',
    type: 'recipe',
    content: 'This protein-rich bowl provides steady energy release and supports neurotransmitter production for better focus.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    category: 'adhd',
    ingredients: [
      '1 cup quinoa, cooked',
      '4 oz grilled chicken or salmon',
      '1/2 avocado, sliced',
      '1 cup steamed broccoli',
      '1/4 cup pumpkin seeds',
      '2 tablespoons olive oil',
      '1 tablespoon lemon juice',
      'Sea salt and pepper to taste'
    ],
    instructions: [
      'Prepare quinoa according to package instructions',
      'Grill protein of choice and season with herbs',
      'Steam broccoli until tender-crisp',
      'Assemble all ingredients in a bowl',
      'Drizzle with olive oil and lemon juice',
      'Season with salt and pepper'
    ]
  }
]

// Sample daily tasks
export const sampleTasks: TaskContent[] = [
  {
    id: 'task-1',
    title: 'Morning Intention Setting',
    description: 'Start your day with clarity and purpose by setting three key intentions.',
    type: 'journal',
    estimatedTime: 5,
    instructions: [
      'Find a quiet space to sit with your journal',
      'Take three deep breaths to center yourself',
      'Write down your answer to: "How do I want to feel today?"',
      'List three specific intentions for the day',
      'Identify one potential challenge and how you\'ll handle it',
      'Close with a positive affirmation'
    ],
    category: 'wellness',
    difficulty: 'easy'
  },
  {
    id: 'task-2',
    title: 'Focus Enhancement Exercise',
    description: 'A simple cognitive exercise to improve sustained attention and concentration.',
    type: 'cognitive_training',
    estimatedTime: 10,
    instructions: [
      'Set a timer for 10 minutes',
      'Choose a single point to focus on (candle flame, dot on wall)',
      'Maintain focus on this point without letting your mind wander',
      'When you notice your attention drifting, gently return to the point',
      'Note how many times your mind wandered (no judgment)',
      'Track your progress over time'
    ],
    category: 'adhd',
    difficulty: 'medium'
  },
  {
    id: 'task-3',
    title: 'Memory Garden Visualization',
    description: 'Create a mental garden to practice visualization and strengthen memory pathways.',
    type: 'meditation',
    estimatedTime: 15,
    instructions: [
      'Sit comfortably and close your eyes',
      'Imagine you are creating a beautiful garden in your mind',
      'Add specific details: colors, textures, smells, sounds',
      'Place important memories or information as flowers in your garden',
      'Walk through your garden, visiting each "memory flower"',
      'Practice returning to this garden daily to strengthen the visualization'
    ],
    category: 'memory',
    difficulty: 'medium'
  }
]

// Function to get personalized content based on user's improvement focus
export function getPersonalizedDailyContent(improvementFocus: ImprovementFocus): {
  quote: QuoteContent
  video: VideoContent
  article: ArticleContent
  breathwork: BreathworkContent
  nutrition: NutritionContent
  task: TaskContent
} {
  // Select content based on primary focus or general if 'all' is selected
  const primaryFocus = improvementFocus === 'wellness' ? 'wellness' : improvementFocus
  
  const quote = sampleQuotes.find(q => q.category === primaryFocus) || sampleQuotes[0]
  const video = sampleVideos.find(v => v.category === primaryFocus) || sampleVideos[0]
  const article = sampleArticles.find(a => a.category === primaryFocus) || sampleArticles[0]
  const breathwork = sampleBreathwork[Math.floor(Math.random() * sampleBreathwork.length)]
  const nutrition = sampleNutrition.find(n => n.category === primaryFocus) || sampleNutrition[0]
  const task = sampleTasks.find(t => t.category === primaryFocus) || sampleTasks[0]

  return {
    quote,
    video,
    article,
    breathwork,
    nutrition,
    task
  }
}
