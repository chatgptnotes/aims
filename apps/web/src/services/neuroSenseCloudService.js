// NeuroSense Cloud Integration Service
// Handles real-time cloud processing, storage, and advanced analytics

import { createClient } from '@supabase/supabase-js';
import aiAnalysisService from './aiAnalysisService';

class NeuroSenseCloudService {
  constructor() {
    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('☁️ NeuroSense Cloud: Connected');
    } else {
      console.warn('⚠️ NeuroSense Cloud: Offline mode');
      this.supabase = null;
    }

    // Cloud endpoints and configuration
    this.config = {
      apiVersion: 'v2.1',
      endpoints: {
        upload: '/api/cloud/upload',
        process: '/api/cloud/process',
        analyze: '/api/cloud/analyze',
        reports: '/api/cloud/reports',
        protocols: '/api/cloud/protocols',
        storage: '/api/cloud/storage'
      },
      features: {
        realTimeProcessing: true,
        distributedAnalysis: true,
        autoBackup: true,
        cloudStorage: true,
        advancedAI: true
      }
    };

    // Initialize cloud storage
    this.initializeCloudStorage();
  }

  /**
   * Initialize cloud storage system
   */
  async initializeCloudStorage() {
    try {
      if (!this.supabase) {
        console.log('📁 Cloud Storage: Using local fallback');
        return;
      }

      // Create storage bucket if not exists
      const { data: buckets, error } = await this.supabase
        .storage
        .listBuckets();

      if (error) throw error;

      const requiredBuckets = ['eeg-files', 'reports', 'protocols', 'backups'];

      for (const bucketName of requiredBuckets) {
        const bucketExists = buckets.find(bucket => bucket.name === bucketName);

        if (!bucketExists) {
          const { error: createError } = await this.supabase
            .storage
            .createBucket(bucketName, { public: false });

          if (createError) {
            console.warn(`Failed to create bucket ${bucketName}:`, createError);
          } else {
            console.log(`✅ Created cloud bucket: ${bucketName}`);
          }
        }
      }

      console.log('☁️ Cloud storage initialized successfully');
    } catch (error) {
      console.error('❌ Cloud storage initialization failed:', error);
    }
  }

  /**
   * Upload EDF file to cloud for processing
   */
  async uploadEDFFile(file, patientId, sessionId, metadata = {}) {
    try {
      console.log('📤 Uploading EDF file to NeuroSense Cloud...');

      if (!this.supabase) {
        throw new Error('Cloud service not available');
      }

      // Generate unique file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${patientId}/${sessionId}/${timestamp}_${file.name}`;

      // Upload to cloud storage
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage
        .from('eeg-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            ...metadata,
            patientId: patientId,
            sessionId: sessionId,
            uploadedAt: new Date().toISOString(),
            fileSize: file.size,
            originalName: file.name
          }
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { data: recordData, error: recordError } = await this.supabase
        .from('cloud_files')
        .insert({
          file_path: fileName,
          patient_id: patientId,
          session_id: sessionId,
          file_size: file.size,
          original_name: file.name,
          storage_bucket: 'eeg-files',
          upload_status: 'completed',
          metadata: metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (recordError) throw recordError;

      console.log('✅ EDF file uploaded to cloud successfully');

      // Trigger cloud processing
      const processingJob = await this.startCloudProcessing(recordData.id, fileName);

      return {
        fileId: recordData.id,
        cloudPath: fileName,
        uploadData: uploadData,
        processingJob: processingJob
      };

    } catch (error) {
      console.error('❌ Cloud upload failed:', error);
      throw new Error(`Cloud upload failed: ${error.message}`);
    }
  }

  /**
   * Start cloud-based EEG processing
   */
  async startCloudProcessing(fileId, filePath) {
    try {
      console.log('⚡ Starting cloud processing...');

      // Create processing job record
      const { data: jobData, error: jobError } = await this.supabase
        .from('processing_jobs')
        .insert({
          file_id: fileId,
          file_path: filePath,
          job_type: 'eeg_analysis',
          status: 'queued',
          priority: 'normal',
          created_at: new Date().toISOString(),
          estimated_duration: 300 // 5 minutes
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Start async processing
      this.processInCloud(jobData.id, filePath);

      return {
        jobId: jobData.id,
        status: 'queued',
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to start cloud processing:', error);
      throw error;
    }
  }

  /**
   * Process EEG file in cloud (async)
   */
  async processInCloud(jobId, filePath) {
    try {
      // Update job status
      await this.updateJobStatus(jobId, 'processing', 'Cloud analysis in progress...');

      // Download file from cloud storage
      const { data: fileData, error: downloadError } = await this.supabase
        .storage
        .from('eeg-files')
        .download(filePath);

      if (downloadError) throw downloadError;

      // Convert blob to array buffer for processing
      const arrayBuffer = await fileData.arrayBuffer();

      // Get file metadata
      const { data: fileRecord } = await this.supabase
        .from('cloud_files')
        .select('*')
        .eq('file_path', filePath)
        .single();

      // Process with AI analysis service
      const analysisResult = await aiAnalysisService.processEDFFile(
        arrayBuffer,
        fileRecord.patient_id,
        fileRecord.session_id
      );

      // Store results in cloud
      const cloudResult = await this.storeAnalysisInCloud(jobId, analysisResult);

      // Generate reports
      const reports = await this.generateCloudReports(analysisResult);

      // Update job as completed
      await this.updateJobStatus(jobId, 'completed', 'Analysis completed successfully', {
        analysisId: cloudResult.id,
        reports: reports
      });

      console.log('✅ Cloud processing completed successfully');

    } catch (error) {
      console.error('❌ Cloud processing failed:', error);
      await this.updateJobStatus(jobId, 'failed', error.message);
    }
  }

  /**
   * Store analysis results in cloud database
   */
  async storeAnalysisInCloud(jobId, analysisResult) {
    try {
      const { data, error } = await this.supabase
        .from('cloud_analyses')
        .insert({
          job_id: jobId,
          patient_id: analysisResult.patientId,
          session_id: analysisResult.sessionId,
          analysis_data: analysisResult,
          algorithm_version: analysisResult.algorithmVersion,
          quality_score: analysisResult.qualityScore,
          processing_time: Date.now() - analysisResult.processingTime,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('☁️ Analysis results stored in cloud');
      return data;

    } catch (error) {
      console.error('❌ Failed to store analysis in cloud:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive cloud reports
   */
  async generateCloudReports(analysisResult) {
    try {
      const reports = [];

      // Generate PDF report
      const pdfReport = await this.generatePDFReport(analysisResult);
      if (pdfReport.path) {
        reports.push({
          type: 'pdf',
          name: 'Comprehensive QEEG Analysis',
          path: pdfReport.path,
          size: pdfReport.size
        });
      }

      // Generate detailed CSV data export
      const csvReport = await this.generateCSVReport(analysisResult);
      if (csvReport.path) {
        reports.push({
          type: 'csv',
          name: 'Raw Analysis Data',
          path: csvReport.path,
          size: csvReport.size
        });
      }

      // Generate interactive HTML report
      const htmlReport = await this.generateInteractiveReport(analysisResult);
      if (htmlReport.path) {
        reports.push({
          type: 'html',
          name: 'Interactive Analysis Report',
          path: htmlReport.path,
          size: htmlReport.size
        });
      }

      console.log(`📊 Generated ${reports.length} cloud reports`);
      return reports;

    } catch (error) {
      console.error('❌ Report generation failed:', error);
      return [];
    }
  }

  /**
   * Generate PDF report in cloud
   */
  async generatePDFReport(analysisResult) {
    try {
      // Create comprehensive PDF content
      const pdfContent = await this.createPDFContent(analysisResult);

      // Convert to blob
      const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });

      // Upload to cloud storage
      const fileName = `reports/${analysisResult.patientId}/${analysisResult.sessionId}/analysis_report.pdf`;

      const { data, error } = await this.supabase
        .storage
        .from('reports')
        .upload(fileName, pdfBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      return {
        path: fileName,
        size: pdfBlob.size,
        cloudData: data
      };

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      return { path: null };
    }
  }

  /**
   * Generate CSV data export
   */
  async generateCSVReport(analysisResult) {
    try {
      let csvContent = 'Electrode,Frequency_Band,Absolute_Power,Relative_Power,Dominant_Freq\n';

      // Extract frequency analysis data
      Object.entries(analysisResult.frequencyAnalysis).forEach(([electrode, analysis]) => {
        Object.entries(analysis.absolutePowers).forEach(([band, power]) => {
          const relativePower = analysis.relativePowers[band];
          const dominantFreq = analysis.dominantFrequency;

          csvContent += `${electrode},${band},${power.toFixed(4)},${relativePower.toFixed(2)},${dominantFreq.toFixed(2)}\n`;
        });
      });

      // Create blob and upload
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const fileName = `reports/${analysisResult.patientId}/${analysisResult.sessionId}/analysis_data.csv`;

      const { data, error } = await this.supabase
        .storage
        .from('reports')
        .upload(fileName, csvBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      return {
        path: fileName,
        size: csvBlob.size,
        cloudData: data
      };

    } catch (error) {
      console.error('❌ CSV generation failed:', error);
      return { path: null };
    }
  }

  /**
   * Generate interactive HTML report
   */
  async generateInteractiveReport(analysisResult) {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Interactive QEEG Analysis - ${analysisResult.patientId}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .chart { width: 100%; height: 400px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Interactive QEEG Analysis Report</h1>
    <p><strong>Patient:</strong> ${analysisResult.patientId}</p>
    <p><strong>Session:</strong> ${analysisResult.sessionId}</p>
    <p><strong>Analysis Date:</strong> ${new Date(analysisResult.timestamp).toLocaleDateString()}</p>

    <div class="section">
        <h2>Cognitive Metrics</h2>
        <div class="metric">
            <strong>Attention Score:</strong> ${analysisResult.cognitiveMetrics?.attention?.score || 'N/A'}
        </div>
        <div class="metric">
            <strong>Relaxation Score:</strong> ${analysisResult.cognitiveMetrics?.relaxation?.score || 'N/A'}
        </div>
        <div class="metric">
            <strong>Working Memory:</strong> ${analysisResult.cognitiveMetrics?.cognitive?.workingMemory || 'N/A'}
        </div>
    </div>

    <div class="section">
        <h2>Frequency Analysis</h2>
        <div id="frequencyChart" class="chart"></div>
    </div>

    <div class="section">
        <h2>Brain Connectivity</h2>
        <div id="connectivityChart" class="chart"></div>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        ${analysisResult.recommendations?.map(rec => `
            <div style="margin-bottom: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px;">
                <strong>${rec.category} (${rec.priority}):</strong> ${rec.recommendation}
                <br><small>Duration: ${rec.duration} | Expected: ${rec.expectedOutcome}</small>
            </div>
        `).join('') || '<p>No recommendations available</p>'}
    </div>

    <script>
        // Generate frequency analysis chart
        const electrodes = ${JSON.stringify(Object.keys(analysisResult.frequencyAnalysis || {}))};
        const bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

        const traces = bands.map(band => ({
            x: electrodes,
            y: electrodes.map(electrode =>
                ${JSON.stringify(analysisResult.frequencyAnalysis)}[electrode]?.relativePowers[band] || 0
            ),
            type: 'bar',
            name: band.charAt(0).toUpperCase() + band.slice(1)
        }));

        Plotly.newPlot('frequencyChart', traces, {
            title: 'Relative Power by Frequency Band',
            xaxis: { title: 'Electrodes' },
            yaxis: { title: 'Relative Power (%)' },
            barmode: 'group'
        });

        // Generate connectivity matrix
        const connectivityData = ${JSON.stringify(analysisResult.connectivityMaps || {})};
        const connections = Object.keys(connectivityData);
        const coherenceValues = connections.map(conn => connectivityData[conn].coherence);

        Plotly.newPlot('connectivityChart', [{
            x: connections,
            y: coherenceValues,
            type: 'bar',
            name: 'Coherence'
        }], {
            title: 'Brain Connectivity (Coherence)',
            xaxis: { title: 'Electrode Pairs' },
            yaxis: { title: 'Coherence Value' }
        });
    </script>
</body>
</html>`;

      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = `reports/${analysisResult.patientId}/${analysisResult.sessionId}/interactive_report.html`;

      const { data, error } = await this.supabase
        .storage
        .from('reports')
        .upload(fileName, htmlBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      return {
        path: fileName,
        size: htmlBlob.size,
        cloudData: data
      };

    } catch (error) {
      console.error('❌ Interactive report generation failed:', error);
      return { path: null };
    }
  }

  /**
   * Update processing job status
   */
  async updateJobStatus(jobId, status, message = '', results = null) {
    if (!this.supabase) return;

    try {
      const updateData = {
        status: status,
        status_message: message,
        updated_at: new Date().toISOString()
      };

      if (results) {
        updateData.results = results;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('processing_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

    } catch (error) {
      console.error('❌ Failed to update job status:', error);
    }
  }

  /**
   * Get processing job status
   */
  async getJobStatus(jobId) {
    if (!this.supabase) {
      return { status: 'offline', message: 'Cloud service not available' };
    }

    try {
      const { data, error } = await this.supabase
        .from('processing_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Failed to get job status:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Download report from cloud
   */
  async downloadCloudReport(reportPath, reportName = 'report') {
    try {
      if (!this.supabase) {
        throw new Error('Cloud service not available');
      }

      const { data, error } = await this.supabase
        .storage
        .from('reports')
        .download(reportPath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = reportName;
      link.click();

      URL.revokeObjectURL(url);

      console.log('✅ Report downloaded successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Download failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get patient's cloud analysis history
   */
  async getPatientCloudHistory(patientId, limit = 10) {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('cloud_analyses')
        .select(`
          *,
          processing_jobs (
            status,
            created_at,
            completed_at
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('❌ Failed to fetch cloud history:', error);
      return [];
    }
  }

  /**
   * Clean up old cloud files and analyses
   */
  async cleanupCloudStorage(daysOld = 90) {
    if (!this.supabase) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Clean up old files
      const { data: oldFiles } = await this.supabase
        .from('cloud_files')
        .select('file_path')
        .lt('created_at', cutoffDate.toISOString());

      if (oldFiles && oldFiles.length > 0) {
        const filePaths = oldFiles.map(file => file.file_path);

        const { error: deleteError } = await this.supabase
          .storage
          .from('eeg-files')
          .remove(filePaths);

        if (!deleteError) {
          await this.supabase
            .from('cloud_files')
            .delete()
            .lt('created_at', cutoffDate.toISOString());

          console.log(`🧹 Cleaned up ${filePaths.length} old cloud files`);
        }
      }

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Create PDF content (simplified implementation)
   */
  async createPDFContent(analysisResult) {
    // In a real implementation, this would use a PDF library like jsPDF or PDFKit
    // For now, returning a simple text representation
    return `PDF Report for ${analysisResult.patientId} - ${analysisResult.sessionId}
Generated: ${new Date(analysisResult.timestamp).toLocaleString()}

Cognitive Metrics:
- Attention: ${analysisResult.cognitiveMetrics?.attention?.score || 'N/A'}
- Relaxation: ${analysisResult.cognitiveMetrics?.relaxation?.score || 'N/A'}
- Working Memory: ${analysisResult.cognitiveMetrics?.cognitive?.workingMemory || 'N/A'}

Recommendations:
${analysisResult.recommendations?.map(rec => `- ${rec.category}: ${rec.recommendation}`).join('\n') || 'None'}

Quality Score: ${analysisResult.qualityScore}
Algorithm Version: ${analysisResult.algorithmVersion}`;
  }
}

// Create and export singleton instance
const neuroSenseCloudService = new NeuroSenseCloudService();
export default neuroSenseCloudService;