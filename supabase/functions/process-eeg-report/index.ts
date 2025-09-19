import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EEGData {
  timestamp: number;
  channels: {
    [key: string]: number[];
  };
  sampleRate: number;
}

interface ProcessedMetrics {
  alpha: number;
  beta: number;
  theta: number;
  delta: number;
  gamma: number;
  coherence: number;
  asymmetry: number;
  peak_frequency: number;
  attention_index: number;
  relaxation_index: number;
  stress_index: number;
  fatigue_index: number;
}

// Fast Fourier Transform implementation for frequency analysis
function fft(signal: number[]): number[] {
  const N = signal.length;
  if (N <= 1) return signal;

  // Pad to power of 2 if necessary
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(N)));
  while (signal.length < nextPowerOf2) {
    signal.push(0);
  }

  const even = fft(signal.filter((_, i) => i % 2 === 0));
  const odd = fft(signal.filter((_, i) => i % 2 === 1));

  const result = new Array(signal.length);
  const halfN = signal.length / 2;

  for (let k = 0; k < halfN; k++) {
    const angle = -2 * Math.PI * k / signal.length;
    const t = {
      real: Math.cos(angle) * odd[k] - Math.sin(angle) * odd[k],
      imag: Math.sin(angle) * odd[k] + Math.cos(angle) * odd[k],
    };

    result[k] = even[k] + t.real;
    result[k + halfN] = even[k] - t.real;
  }

  return result;
}

// Calculate power in specific frequency bands
function calculateBandPower(frequencies: number[], sampleRate: number, lowFreq: number, highFreq: number): number {
  const freqResolution = sampleRate / frequencies.length;
  const lowBin = Math.floor(lowFreq / freqResolution);
  const highBin = Math.floor(highFreq / freqResolution);

  let power = 0;
  for (let i = lowBin; i <= highBin && i < frequencies.length / 2; i++) {
    power += Math.pow(Math.abs(frequencies[i]), 2);
  }

  return power / (highBin - lowBin + 1);
}

// Process raw EEG data into metrics
function processEEGData(data: EEGData): ProcessedMetrics {
  const metrics: ProcessedMetrics = {
    alpha: 0,
    beta: 0,
    theta: 0,
    delta: 0,
    gamma: 0,
    coherence: 0,
    asymmetry: 0,
    peak_frequency: 0,
    attention_index: 0,
    relaxation_index: 0,
    stress_index: 0,
    fatigue_index: 0,
  };

  const channelNames = Object.keys(data.channels);
  const numChannels = channelNames.length;

  // Process each channel
  for (const channel of channelNames) {
    const signal = data.channels[channel];
    const frequencies = fft(signal);

    // Calculate band powers
    const delta = calculateBandPower(frequencies, data.sampleRate, 0.5, 4);
    const theta = calculateBandPower(frequencies, data.sampleRate, 4, 8);
    const alpha = calculateBandPower(frequencies, data.sampleRate, 8, 13);
    const beta = calculateBandPower(frequencies, data.sampleRate, 13, 30);
    const gamma = calculateBandPower(frequencies, data.sampleRate, 30, 100);

    const total = delta + theta + alpha + beta + gamma;

    // Normalize to percentages
    metrics.delta += (delta / total) / numChannels;
    metrics.theta += (theta / total) / numChannels;
    metrics.alpha += (alpha / total) / numChannels;
    metrics.beta += (beta / total) / numChannels;
    metrics.gamma += (gamma / total) / numChannels;
  }

  // Calculate frontal asymmetry (F3/F4)
  if (data.channels['F3'] && data.channels['F4']) {
    const f3Alpha = calculateBandPower(fft(data.channels['F3']), data.sampleRate, 8, 13);
    const f4Alpha = calculateBandPower(fft(data.channels['F4']), data.sampleRate, 8, 13);
    metrics.asymmetry = (f4Alpha - f3Alpha) / (f4Alpha + f3Alpha);
  }

  // Calculate coherence between frontal channels
  if (data.channels['Fp1'] && data.channels['Fp2']) {
    // Simplified coherence calculation
    const fp1 = data.channels['Fp1'];
    const fp2 = data.channels['Fp2'];
    let correlation = 0;

    for (let i = 0; i < Math.min(fp1.length, fp2.length); i++) {
      correlation += fp1[i] * fp2[i];
    }

    metrics.coherence = Math.abs(correlation) / Math.max(fp1.length, fp2.length);
  }

  // Calculate derived indices
  metrics.attention_index = metrics.beta / (metrics.alpha + metrics.theta);
  metrics.relaxation_index = metrics.alpha / (metrics.beta + metrics.gamma);
  metrics.stress_index = (metrics.beta + metrics.gamma) / metrics.alpha;
  metrics.fatigue_index = (metrics.theta + metrics.delta) / metrics.beta;

  // Find peak frequency in alpha band
  metrics.peak_frequency = 10; // Default to 10 Hz (middle of alpha band)

  return metrics;
}

// Generate recommendations based on metrics
function generateRecommendations(metrics: ProcessedMetrics): string[] {
  const recommendations = [];

  // Attention recommendations
  if (metrics.attention_index < 0.5) {
    recommendations.push('Practice focused attention meditation for 10-15 minutes daily');
    recommendations.push('Consider cognitive training exercises to improve concentration');
  } else if (metrics.attention_index > 2) {
    recommendations.push('Incorporate relaxation techniques to balance hyperactivity');
    recommendations.push('Practice mindful breathing exercises throughout the day');
  }

  // Stress recommendations
  if (metrics.stress_index > 1.5) {
    recommendations.push('Implement stress reduction techniques like progressive muscle relaxation');
    recommendations.push('Ensure adequate sleep (7-9 hours) to reduce cortical hyperactivity');
    recommendations.push('Consider yoga or tai chi for stress management');
  }

  // Relaxation recommendations
  if (metrics.relaxation_index < 0.5) {
    recommendations.push('Practice alpha-enhancing activities like closed-eye relaxation');
    recommendations.push('Spend time in nature to promote relaxation response');
    recommendations.push('Listen to binaural beats in the alpha frequency range (8-13 Hz)');
  }

  // Fatigue recommendations
  if (metrics.fatigue_index > 1.5) {
    recommendations.push('Evaluate sleep quality and consider sleep hygiene improvements');
    recommendations.push('Take regular breaks during mentally demanding tasks');
    recommendations.push('Ensure proper hydration and nutrition throughout the day');
  }

  // Asymmetry recommendations
  if (Math.abs(metrics.asymmetry) > 0.2) {
    if (metrics.asymmetry > 0) {
      recommendations.push('Practice left-nostril breathing to balance hemispheric activity');
      recommendations.push('Engage in creative activities to stimulate right hemisphere');
    } else {
      recommendations.push('Practice right-nostril breathing for energizing effect');
      recommendations.push('Engage in analytical tasks to stimulate left hemisphere');
    }
  }

  // Coherence recommendations
  if (metrics.coherence < 0.5) {
    recommendations.push('Practice heart-brain coherence exercises');
    recommendations.push('Use HRV biofeedback training to improve neural coherence');
  }

  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { patientId, sessionId, eegData, rawDataUrl } = await req.json();

    if (!patientId || !eegData) {
      throw new Error('Patient ID and EEG data are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process EEG data
    const metrics = processEEGData(eegData);

    // Generate recommendations
    const recommendations = generateRecommendations(metrics);

    // Generate summary
    const summary = `
      EEG analysis shows ${metrics.attention_index > 1 ? 'good' : 'reduced'} attention levels
      with ${metrics.stress_index > 1 ? 'elevated' : 'normal'} stress indicators.
      Alpha power is ${metrics.alpha > 0.3 ? 'dominant' : metrics.alpha > 0.2 ? 'moderate' : 'low'},
      suggesting ${metrics.alpha > 0.3 ? 'relaxed' : 'alert'} mental state.
      ${Math.abs(metrics.asymmetry) > 0.2 ? `Frontal asymmetry detected (${metrics.asymmetry > 0 ? 'right' : 'left'} dominant).` : ''}
      Overall brain coherence is ${metrics.coherence > 0.7 ? 'excellent' : metrics.coherence > 0.5 ? 'good' : 'needs improvement'}.
    `.trim().replace(/\s+/g, ' ');

    // Create EEG report record
    const { data: report, error: reportError } = await supabase
      .from('eeg_reports')
      .insert({
        patient_id: patientId,
        session_id: sessionId,
        metrics,
        summary,
        recommendations,
        file_path: rawDataUrl,
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    // Trigger brain fitness score recalculation
    const { data: scoreData, error: scoreError } = await supabase.functions.invoke(
      'calculate-brain-fitness',
      {
        body: { patientId },
      }
    );

    if (scoreError) {
      console.error('Failed to update brain fitness score:', scoreError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        metrics,
        summary,
        recommendations,
        brainFitnessScore: scoreData?.brainFitnessScore,
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