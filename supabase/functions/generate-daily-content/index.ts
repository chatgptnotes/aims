import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentTemplate {
  type: 'exercise' | 'meditation' | 'education' | 'assessment' | 'activity';
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  focus_areas: string[];
  instructions?: string[];
  resources?: { type: string; url: string; }[];
}

const contentLibrary: ContentTemplate[] = [
  // Meditation content
  {
    type: 'meditation',
    title: 'Mindful Breathing',
    description: 'A guided breathing exercise to center your mind and reduce stress',
    duration: 10,
    difficulty: 'easy',
    focus_areas: ['stress', 'anxiety', 'focus'],
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes or soften your gaze',
      'Take a deep breath in through your nose for 4 counts',
      'Hold for 4 counts',
      'Exhale through your mouth for 6 counts',
      'Repeat for 10 cycles',
    ],
  },
  {
    type: 'meditation',
    title: 'Body Scan Relaxation',
    description: 'Progressive relaxation technique to release physical tension',
    duration: 15,
    difficulty: 'medium',
    focus_areas: ['stress', 'sleep', 'anxiety'],
    instructions: [
      'Lie down comfortably',
      'Start by focusing on your toes',
      'Tense and relax each muscle group',
      'Move progressively up your body',
      'End with whole-body relaxation',
    ],
  },
  // Cognitive exercises
  {
    type: 'exercise',
    title: 'Dual N-Back Training',
    description: 'Working memory exercise to improve cognitive flexibility',
    duration: 20,
    difficulty: 'hard',
    focus_areas: ['memory', 'focus', 'adhd'],
    instructions: [
      'Remember both position and audio sequences',
      'Press when current matches n steps back',
      'Start with n=2 and increase difficulty',
    ],
  },
  {
    type: 'exercise',
    title: 'Stroop Task',
    description: 'Attention and processing speed exercise',
    duration: 10,
    difficulty: 'medium',
    focus_areas: ['adhd', 'focus', 'processing'],
    instructions: [
      'Name the color of the text, not the word',
      'Respond as quickly and accurately as possible',
      'Track your improvement over time',
    ],
  },
  // Educational content
  {
    type: 'education',
    title: 'Understanding Your Brain Waves',
    description: 'Learn about different brain wave frequencies and their functions',
    duration: 15,
    difficulty: 'easy',
    focus_areas: ['education', 'awareness'],
    resources: [
      { type: 'article', url: '/resources/brain-waves-101' },
      { type: 'video', url: '/resources/eeg-explained' },
    ],
  },
  {
    type: 'education',
    title: 'Sleep Hygiene Basics',
    description: 'Essential tips for improving sleep quality',
    duration: 10,
    difficulty: 'easy',
    focus_areas: ['sleep', 'recovery', 'wellness'],
    resources: [
      { type: 'checklist', url: '/resources/sleep-checklist' },
    ],
  },
  // Activities
  {
    type: 'activity',
    title: 'Gratitude Journaling',
    description: 'Write three things you are grateful for today',
    duration: 5,
    difficulty: 'easy',
    focus_areas: ['mood', 'depression', 'wellness'],
    instructions: [
      'Think of three positive things from today',
      'Write them down with specific details',
      'Reflect on why you are grateful for each',
    ],
  },
  {
    type: 'activity',
    title: 'Creative Expression',
    description: 'Engage in a creative activity to stimulate right brain',
    duration: 30,
    difficulty: 'medium',
    focus_areas: ['creativity', 'mood', 'stress'],
    instructions: [
      'Choose: drawing, music, writing, or crafts',
      'Set a timer and create without judgment',
      'Focus on the process, not the outcome',
    ],
  },
];

function selectDailyContent(
  focusAreas: string[],
  previousContent: any[],
  assessmentScores: any
): ContentTemplate[] {
  const selectedContent: ContentTemplate[] = [];
  const usedTypes = new Set<string>();

  // Prioritize content based on assessment scores
  const priorities: string[] = [];

  if (assessmentScores?.adhd > 9) {
    priorities.push('adhd', 'focus');
  }
  if (assessmentScores?.gad7 > 10) {
    priorities.push('anxiety', 'stress');
  }
  if (assessmentScores?.pss > 20) {
    priorities.push('stress', 'relaxation');
  }
  if (assessmentScores?.mood < 5) {
    priorities.push('mood', 'depression');
  }

  // Add user's focus areas
  priorities.push(...(focusAreas || []));

  // Select diverse content types
  const contentTypes = ['meditation', 'exercise', 'education', 'activity'];

  for (const type of contentTypes) {
    const relevantContent = contentLibrary.filter(c => {
      if (c.type !== type) return false;
      if (usedTypes.has(c.title)) return false;

      // Check if content matches priorities
      const matchesPriority = c.focus_areas.some(area =>
        priorities.includes(area)
      );

      return matchesPriority || priorities.length === 0;
    });

    if (relevantContent.length > 0) {
      // Select random from relevant content
      const selected = relevantContent[
        Math.floor(Math.random() * relevantContent.length)
      ];
      selectedContent.push(selected);
      usedTypes.add(selected.title);
    }
  }

  // Ensure we have at least 3 pieces of content
  while (selectedContent.length < 3) {
    const remaining = contentLibrary.filter(c => !usedTypes.has(c.title));
    if (remaining.length === 0) break;

    const selected = remaining[
      Math.floor(Math.random() * remaining.length)
    ];
    selectedContent.push(selected);
    usedTypes.add(selected.title);
  }

  return selectedContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { patientId, date } = await req.json();

    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('improvement_focus, brain_fitness_score')
      .eq('id', patientId)
      .single();

    if (patientError) {
      throw patientError;
    }

    // Get recent assessments
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('assessment_type, score')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (assessmentError) {
      throw assessmentError;
    }

    // Get previous content to avoid repetition
    const { data: previousContent, error: previousError } = await supabase
      .from('daily_content')
      .select('content_data')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(7);

    if (previousError) {
      throw previousError;
    }

    // Process assessment scores
    const assessmentScores: any = {};
    assessments?.forEach(a => {
      if (!assessmentScores[a.assessment_type]) {
        assessmentScores[a.assessment_type] = a.score;
      }
    });

    // Select appropriate content
    const dailyContent = selectDailyContent(
      patient.improvement_focus || [],
      previousContent || [],
      assessmentScores
    );

    // Structure content data
    const contentData = {
      date: targetDate,
      brain_fitness_score: patient.brain_fitness_score,
      content: dailyContent,
      daily_tip: generateDailyTip(patient.brain_fitness_score),
      motivation_quote: getMotivationalQuote(),
    };

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from('daily_content')
      .upsert({
        patient_id: patientId,
        date: targetDate,
        content_data: contentData,
        viewed: false,
        completed: false,
      }, {
        onConflict: 'patient_id,date',
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: contentData,
        id: saved.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateDailyTip(brainFitnessScore: number): string {
  const tips = {
    high: [
      'Keep up your excellent brain fitness routine!',
      'Your consistency is paying off - maintain these healthy habits.',
      'Consider challenging yourself with harder cognitive exercises.',
    ],
    medium: [
      'Small improvements lead to big changes over time.',
      'Focus on one area of improvement this week.',
      'Track your progress to identify patterns.',
    ],
    low: [
      'Every journey starts with a single step.',
      'Be patient with yourself as you build new habits.',
      'Celebrate small wins along your wellness journey.',
    ],
  };

  const category = brainFitnessScore >= 80 ? 'high' :
                   brainFitnessScore >= 60 ? 'medium' : 'low';

  const categoryTips = tips[category];
  return categoryTips[Math.floor(Math.random() * categoryTips.length)];
}

function getMotivationalQuote(): string {
  const quotes = [
    'The mind is everything. What you think you become. - Buddha',
    'A healthy mind in a healthy body. - Juvenal',
    'The brain is wider than the sky. - Emily Dickinson',
    'Change your thoughts and you change your world. - Norman Vincent Peale',
    'The mind is not a vessel to be filled but a fire to be kindled. - Plutarch',
    'Where focus goes, energy flows. - Tony Robbins',
    'The only way to do great work is to love what you do. - Steve Jobs',
    'Your mind is a powerful thing. Fill it with positive thoughts.',
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}