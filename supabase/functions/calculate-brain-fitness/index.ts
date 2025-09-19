import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrainMetrics {
  alpha: number;
  beta: number;
  theta: number;
  delta: number;
  gamma: number;
  coherence: number;
  asymmetry: number;
  peak_frequency: number;
}

interface AssessmentScores {
  adhd?: number;
  gad7?: number;
  pss?: number;
  memory?: number;
  mood?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { patientId } = await req.json();

    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get latest EEG report metrics
    const { data: eegReport, error: eegError } = await supabase
      .from('eeg_reports')
      .select('metrics')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (eegError && eegError.code !== 'PGRST116') {
      throw eegError;
    }

    // Get latest assessments
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('assessment_type, score')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (assessmentError) {
      throw assessmentError;
    }

    // Get daily progress stats
    const { data: dailyProgress, error: progressError } = await supabase
      .from('daily_progress')
      .select('mood_rating, stress_level, focus_level, energy_level, sleep_hours')
      .eq('patient_id', patientId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (progressError) {
      throw progressError;
    }

    // Calculate brain fitness score
    let brainFitnessScore = 70; // Base score

    // Factor in EEG metrics if available (0-30 points)
    if (eegReport?.metrics) {
      const metrics = eegReport.metrics as BrainMetrics;

      // Alpha power (relaxation/focus balance)
      const alphaScore = Math.min(metrics.alpha * 10, 10);

      // Beta/Alpha ratio (attention)
      const betaAlphaRatio = metrics.beta / (metrics.alpha || 1);
      const attentionScore = Math.min((2 - Math.abs(betaAlphaRatio - 1.5)) * 5, 10);

      // Coherence (brain connectivity)
      const coherenceScore = Math.min(metrics.coherence * 10, 10);

      brainFitnessScore += alphaScore + attentionScore + coherenceScore;
    }

    // Factor in assessment scores (0-20 points)
    const assessmentScores: AssessmentScores = {};
    assessments?.forEach(a => {
      assessmentScores[a.assessment_type as keyof AssessmentScores] = a.score;
    });

    if (Object.keys(assessmentScores).length > 0) {
      // Normalize and invert scores (lower is better for most assessments)
      let assessmentPoints = 0;

      if (assessmentScores.adhd !== undefined) {
        assessmentPoints += Math.max(0, 5 - (assessmentScores.adhd / 18) * 5);
      }
      if (assessmentScores.gad7 !== undefined) {
        assessmentPoints += Math.max(0, 5 - (assessmentScores.gad7 / 21) * 5);
      }
      if (assessmentScores.pss !== undefined) {
        assessmentPoints += Math.max(0, 5 - (assessmentScores.pss / 40) * 5);
      }
      if (assessmentScores.memory !== undefined) {
        assessmentPoints += (assessmentScores.memory / 100) * 5;
      }

      brainFitnessScore += Math.min(assessmentPoints, 20);
    }

    // Factor in daily progress trends (0-20 points)
    if (dailyProgress && dailyProgress.length > 0) {
      const avgMood = dailyProgress.reduce((acc, d) => acc + (d.mood_rating || 0), 0) / dailyProgress.length;
      const avgStress = dailyProgress.reduce((acc, d) => acc + (d.stress_level || 0), 0) / dailyProgress.length;
      const avgFocus = dailyProgress.reduce((acc, d) => acc + (d.focus_level || 0), 0) / dailyProgress.length;
      const avgEnergy = dailyProgress.reduce((acc, d) => acc + (d.energy_level || 0), 0) / dailyProgress.length;
      const avgSleep = dailyProgress.reduce((acc, d) => acc + (d.sleep_hours || 0), 0) / dailyProgress.length;

      // Calculate progress score
      const moodScore = (avgMood / 10) * 4;
      const stressScore = Math.max(0, 4 - (avgStress / 10) * 4);
      const focusScore = (avgFocus / 10) * 4;
      const energyScore = (avgEnergy / 10) * 4;
      const sleepScore = Math.min((avgSleep / 8) * 4, 4); // Optimal sleep is 7-9 hours

      brainFitnessScore += moodScore + stressScore + focusScore + energyScore + sleepScore;
    }

    // Ensure score is within 0-100 range
    brainFitnessScore = Math.round(Math.max(0, Math.min(100, brainFitnessScore)));

    // Update patient record with brain fitness score
    const { error: updateError } = await supabase
      .from('patients')
      .update({ brain_fitness_score: brainFitnessScore })
      .eq('id', patientId);

    if (updateError) {
      throw updateError;
    }

    // Generate insights based on score
    const insights = [];
    if (brainFitnessScore >= 80) {
      insights.push('Excellent brain fitness! Continue your current wellness practices.');
    } else if (brainFitnessScore >= 60) {
      insights.push('Good brain fitness with room for improvement in specific areas.');
    } else {
      insights.push('Brain fitness needs attention. Consider targeted interventions.');
    }

    // Add specific insights based on metrics
    if (eegReport?.metrics) {
      const metrics = eegReport.metrics as BrainMetrics;
      if (metrics.theta > 0.3) {
        insights.push('Elevated theta waves suggest potential attention challenges.');
      }
      if (metrics.asymmetry > 0.2) {
        insights.push('Frontal asymmetry detected - may indicate mood imbalance.');
      }
    }

    // Add assessment-based insights
    if (assessmentScores.adhd && assessmentScores.adhd > 9) {
      insights.push('ADHD assessment indicates moderate to severe symptoms.');
    }
    if (assessmentScores.gad7 && assessmentScores.gad7 > 10) {
      insights.push('Anxiety levels are elevated - consider stress management techniques.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        brainFitnessScore,
        insights,
        metrics: {
          eeg: eegReport?.metrics || null,
          assessments: assessmentScores,
          dailyProgress: dailyProgress?.length || 0,
        },
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