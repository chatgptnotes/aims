/**
 * Standardized Report Generation Workflow Service
 * Orchestrates the complete data flow: EDF Upload → qEEG Pro → NeuroSense → Care Plan
 */

import DatabaseService from './databaseService';
import QEEGProService from './qeegProService';
import NeuroSenseService from './neuroSenseService';
import AWSS3Service from './awsS3Service';
import toast from 'react-hot-toast';

class ReportWorkflowService {
  constructor() {
    this.workflows = new Map(); // Track active workflows
  }

  /**
   * Start complete EDF processing workflow
   * @param {File} edfFile - The EDF file to process
   * @param {Object} patientInfo - Patient information
   * @param {string} clinicId - Clinic identifier
   * @returns {Promise<string>} Workflow ID for tracking
   */
  async startEDFProcessingWorkflow(edfFile, patientInfo, clinicId) {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('🚀 Starting EDF processing workflow:', workflowId);

      // Initialize workflow tracking
      const workflow = {
        id: workflowId,
        patientId: patientInfo.id,
        patientName: patientInfo.name,
        clinicId,
        fileName: edfFile.name,
        fileSize: edfFile.size,
        status: 'started',
        steps: {
          fileUpload: { status: 'pending', startedAt: null, completedAt: null },
          qeegProcessing: { status: 'pending', startedAt: null, completedAt: null },
          neuroSenseAnalysis: { status: 'pending', startedAt: null, completedAt: null },
          carePlanGeneration: { status: 'pending', startedAt: null, completedAt: null },
          reportFinalization: { status: 'pending', startedAt: null, completedAt: null }
        },
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 8 * 60 * 1000).toISOString(), // 8 minutes
        results: {}
      };

      this.workflows.set(workflowId, workflow);
      await this.saveWorkflowToDatabase(workflow);

      // Start the async processing pipeline
      this.executeWorkflowSteps(workflowId, edfFile, patientInfo, clinicId);

      return workflowId;
    } catch (error) {
      console.error('❌ Failed to start workflow:', error);
      throw new Error(`Workflow initialization failed: ${error.message}`);
    }
  }

  /**
   * Execute workflow steps sequentially
   */
  async executeWorkflowSteps(workflowId, edfFile, patientInfo, clinicId) {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) throw new Error('Workflow not found');

      // Step 1: Upload EDF file to S3
      await this.executeFileUpload(workflowId, edfFile, patientInfo, clinicId);

      // Step 2: Process through qEEG Pro
      await this.executeQEEGProcessing(workflowId, edfFile, patientInfo);

      // Step 3: Analyze through NeuroSense
      await this.executeNeuroSenseAnalysis(workflowId, patientInfo);

      // Step 4: Generate care plan
      await this.executeCarePlanGeneration(workflowId, patientInfo);

      // Step 5: Finalize and save report
      await this.executeReportFinalization(workflowId, clinicId, patientInfo);

      console.log('✅ Workflow completed successfully:', workflowId);

    } catch (error) {
      console.error('❌ Workflow failed:', workflowId, error);
      await this.markWorkflowAsFailed(workflowId, error.message);
    }
  }

  /**
   * Step 1: Upload EDF file to S3
   */
  async executeFileUpload(workflowId, edfFile, patientInfo, clinicId) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.fileUpload.status = 'processing';
    workflow.steps.fileUpload.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      // Upload to S3
      const s3Key = `edf-files/${clinicId}/${patientInfo.id}/${edfFile.name}`;
      const uploadResult = await AWSS3Service.uploadFile(edfFile, s3Key);

      // Save file record
      const fileRecord = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        fileName: edfFile.name,
        fileSize: edfFile.size,
        fileType: 'EDF',
        s3Key,
        s3Url: uploadResult.url,
        patientId: patientInfo.id,
        clinicId,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };

      await DatabaseService.add('uploaded_files', fileRecord);

      workflow.steps.fileUpload.status = 'completed';
      workflow.steps.fileUpload.completedAt = new Date().toISOString();
      workflow.results.fileUpload = fileRecord;

      await this.updateWorkflowInDatabase(workflow);
      console.log('✅ File upload completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.fileUpload.status = 'failed';
      workflow.steps.fileUpload.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 2: Process through qEEG Pro
   */
  async executeQEEGProcessing(workflowId, edfFile, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.qeegProcessing.status = 'processing';
    workflow.steps.qeegProcessing.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      // Submit to qEEG Pro
      const qeegResult = await QEEGProService.uploadForProcessing(edfFile, {
        patientId: patientInfo.id,
        patientName: patientInfo.name,
        clinicId: workflow.clinicId
      });

      // Wait for processing to complete (in real implementation, this would be a webhook/polling)
      await this.waitForQEEGCompletion(qeegResult.jobId);

      // Download results
      const qeegReport = await QEEGProService.downloadReport(qeegResult.jobId);

      workflow.steps.qeegProcessing.status = 'completed';
      workflow.steps.qeegProcessing.completedAt = new Date().toISOString();
      workflow.results.qeegProcessing = {
        jobId: qeegResult.jobId,
        report: qeegReport
      };

      await this.updateWorkflowInDatabase(workflow);
      console.log('✅ qEEG processing completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.qeegProcessing.status = 'failed';
      workflow.steps.qeegProcessing.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 3: Analyze through NeuroSense
   */
  async executeNeuroSenseAnalysis(workflowId, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.neuroSenseAnalysis.status = 'processing';
    workflow.steps.neuroSenseAnalysis.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      const qeegReport = workflow.results.qeegProcessing.report;

      // Process through NeuroSense algorithms
      const neuroSenseResult = await NeuroSenseService.processQEEGReport(qeegReport, patientInfo);

      // Save NeuroSense report
      const savedReport = await NeuroSenseService.saveProcessedReport(
        neuroSenseResult,
        workflow.clinicId,
        patientInfo.id
      );

      workflow.steps.neuroSenseAnalysis.status = 'completed';
      workflow.steps.neuroSenseAnalysis.completedAt = new Date().toISOString();
      workflow.results.neuroSenseAnalysis = {
        reportId: savedReport.id,
        standardizedReport: neuroSenseResult.standardizedReport,
        riskAssessment: neuroSenseResult.riskAssessment,
        recommendations: neuroSenseResult.recommendations
      };

      await this.updateWorkflowInDatabase(workflow);
      console.log('✅ NeuroSense analysis completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.neuroSenseAnalysis.status = 'failed';
      workflow.steps.neuroSenseAnalysis.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 4: Generate care plan
   */
  async executeCarePlanGeneration(workflowId, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.carePlanGeneration.status = 'processing';
    workflow.steps.carePlanGeneration.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      const neuroSenseResults = workflow.results.neuroSenseAnalysis;

      // Generate personalized care plan
      const carePlan = await NeuroSenseService.generateCarePlan(
        neuroSenseResults.riskAssessment,
        patientInfo
      );

      // Save care plan
      const carePlanData = {
        id: `careplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        patientId: patientInfo.id,
        clinicId: workflow.clinicId,
        neuroSenseReportId: neuroSenseResults.reportId,
        carePlan,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await DatabaseService.add('care_plans', carePlanData);

      workflow.steps.carePlanGeneration.status = 'completed';
      workflow.steps.carePlanGeneration.completedAt = new Date().toISOString();
      workflow.results.carePlanGeneration = carePlanData;

      await this.updateWorkflowInDatabase(workflow);
      console.log('✅ Care plan generation completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.carePlanGeneration.status = 'failed';
      workflow.steps.carePlanGeneration.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 5: Finalize and save complete report
   */
  async executeReportFinalization(workflowId, clinicId, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.reportFinalization.status = 'processing';
    workflow.steps.reportFinalization.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      // Compile final report with all components
      const finalReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        type: 'complete_eeg_analysis',
        patientId: patientInfo.id,
        patientName: patientInfo.name,
        clinicId,
        originalFile: workflow.results.fileUpload,
        qeegReport: workflow.results.qeegProcessing.report,
        neuroSenseAnalysis: workflow.results.neuroSenseAnalysis,
        carePlan: workflow.results.carePlanGeneration.carePlan,
        processingWorkflow: {
          workflowId,
          totalProcessingTime: this.calculateProcessingTime(workflow),
          completedSteps: Object.keys(workflow.steps).length,
          qualityScore: this.calculateQualityScore(workflow)
        },
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      // Save final report
      await DatabaseService.add('reports', finalReport);

      // Update patient status
      await this.updatePatientStatus(patientInfo.id, 'report_completed');

      // Update clinic usage
      await this.updateClinicUsage(clinicId);

      workflow.steps.reportFinalization.status = 'completed';
      workflow.steps.reportFinalization.completedAt = new Date().toISOString();
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.results.finalReport = finalReport;

      await this.updateWorkflowInDatabase(workflow);
      console.log('✅ Report finalization completed for workflow:', workflowId);

      // Notify completion
      this.notifyWorkflowCompletion(workflow, finalReport);

    } catch (error) {
      workflow.steps.reportFinalization.status = 'failed';
      workflow.steps.reportFinalization.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow identifier
   * @returns {Promise<Object>} Current workflow status
   */
  async getWorkflowStatus(workflowId) {
    try {
      // Check memory first
      if (this.workflows.has(workflowId)) {
        return this.workflows.get(workflowId);
      }

      // Load from database
      const workflow = await DatabaseService.findById('workflows', workflowId);
      if (workflow) {
        this.workflows.set(workflowId, workflow);
      }

      return workflow;
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      return null;
    }
  }

  /**
   * Cancel workflow
   * @param {string} workflowId - Workflow to cancel
   */
  async cancelWorkflow(workflowId) {
    try {
      const workflow = this.workflows.get(workflowId);
      if (workflow && workflow.status !== 'completed') {
        workflow.status = 'cancelled';
        workflow.cancelledAt = new Date().toISOString();

        await this.updateWorkflowInDatabase(workflow);
        console.log('🚫 Workflow cancelled:', workflowId);
      }
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
    }
  }

  /**
   * Helper methods
   */
  async waitForQEEGCompletion(jobId, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await QEEGProService.checkProcessingStatus(jobId);

      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error(`qEEG processing failed: ${status.message}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('qEEG processing timeout');
  }

  calculateProcessingTime(workflow) {
    const start = new Date(workflow.startedAt);
    const end = new Date();
    return Math.round((end - start) / 1000); // seconds
  }

  calculateQualityScore(workflow) {
    let score = 100;

    // Deduct points for failed steps
    Object.values(workflow.steps).forEach(step => {
      if (step.status === 'failed') score -= 20;
    });

    // Deduct points for long processing time
    const processingTime = this.calculateProcessingTime(workflow);
    if (processingTime > 600) score -= 10; // More than 10 minutes

    return Math.max(0, score);
  }

  async updatePatientStatus(patientId, status) {
    try {
      await DatabaseService.update('patients', patientId, {
        lastReportStatus: status,
        lastReportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update patient status:', error);
    }
  }

  async updateClinicUsage(clinicId) {
    try {
      const clinic = await DatabaseService.findById('clinics', clinicId);
      if (clinic) {
        await DatabaseService.update('clinics', clinicId, {
          reportsUsed: (clinic.reportsUsed || 0) + 1,
          lastReportDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to update clinic usage:', error);
    }
  }

  notifyWorkflowCompletion(workflow, finalReport) {
    // In a real implementation, this would send notifications
    console.log('📧 Workflow completion notification:', {
      workflowId: workflow.id,
      patientName: workflow.patientName,
      reportId: finalReport.id,
      processingTime: this.calculateProcessingTime(workflow)
    });

    // Show success toast
    toast.success(`Report completed for ${workflow.patientName}`, {
      duration: 5000
    });
  }

  async markWorkflowAsFailed(workflowId, errorMessage) {
    try {
      const workflow = this.workflows.get(workflowId);
      if (workflow) {
        workflow.status = 'failed';
        workflow.error = errorMessage;
        workflow.failedAt = new Date().toISOString();
        await this.updateWorkflowInDatabase(workflow);

        toast.error(`Workflow failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Failed to mark workflow as failed:', error);
    }
  }

  async saveWorkflowToDatabase(workflow) {
    try {
      await DatabaseService.add('workflows', workflow);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }

  async updateWorkflowInDatabase(workflow) {
    try {
      await DatabaseService.update('workflows', workflow.id, workflow);
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  }

  /**
   * Get all workflows for a clinic
   * @param {string} clinicId - Clinic identifier
   * @returns {Promise<Array>} List of workflows
   */
  async getClinicWorkflows(clinicId) {
    try {
      const workflows = await DatabaseService.get('workflows');
      return workflows.filter(w => w.clinicId === clinicId)
                     .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    } catch (error) {
      console.error('Failed to get clinic workflows:', error);
      return [];
    }
  }
}

export default new ReportWorkflowService();