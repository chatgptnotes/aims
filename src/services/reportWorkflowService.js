/**
 * Standardized Report Generation Workflow Service
 * Orchestrates the complete data flow: EDF Upload → P&ID Pro → AIMS → Care Plan
 */

import DatabaseService from './databaseService';
import PIDProService from './pidProService';
import AIMSService from './aimsService';
import StorageService from './storageService';
import toast from 'react-hot-toast';

class ReportWorkflowService {
  constructor() {
    this.workflows = new Map(); // Track active workflows
  }

  /**
   * Start complete EDF processing workflow
   * @param {File} edfFile - The EDF file to process
   * @param {Object} patientInfo - Supervisor information
   * @param {string} clinicId - Clinic identifier
   * @returns {Promise<string>} Workflow ID for tracking
   */
  async startEDFProcessingWorkflow(edfFile, patientInfo, clinicId) {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('START: Starting EDF processing workflow:', workflowId);

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
          pidProcessing: { status: 'pending', startedAt: null, completedAt: null },
          aimsAnalysis: { status: 'pending', startedAt: null, completedAt: null },
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
      console.error('ERROR: Failed to start workflow:', error);
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

      // Step 2: Process through P&ID Pro
      await this.executePIDProcessing(workflowId, edfFile, patientInfo);

      // Step 3: Analyze through AIMS
      await this.executeAIMSAnalysis(workflowId, patientInfo);

      // Step 4: Generate care plan
      await this.executeCarePlanGeneration(workflowId, patientInfo);

      // Step 5: Finalize and save report
      await this.executeReportFinalization(workflowId, clinicId, patientInfo);

      console.log('SUCCESS: Workflow completed successfully:', workflowId);

    } catch (error) {
      console.error('ERROR: Workflow failed:', workflowId, error);
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
      // Upload to Supabase Storage
      const fileName = `edf-files/${clinicId}/${patientInfo.id}/${edfFile.name}`;
      const uploadResult = await StorageService.uploadFile(edfFile, fileName, {
        clinicId,
        patientId: patientInfo.id,
        workflowId
      });

      // Save file record
      const fileRecord = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        fileName: edfFile.name,
        fileSize: edfFile.size,
        fileType: 'EDF',
        storagePath: uploadResult.path,
        storageUrl: uploadResult.url,
        patientId: patientInfo.id,
        clinicId,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };

      // Try to save file record (optional - continue even if fails)
      try {
        await DatabaseService.add('uploaded_files', fileRecord);
        console.log('SUCCESS: File record saved to database');
      } catch (error) {
        console.warn('WARNING: Could not save file record to database (table may not exist yet):', error.message);
      }

      // HOT: CREATE IMMEDIATE REPORT ENTRY - User can see it right away!
      // Don't set id - let database generate UUID automatically
      const immediateReport = {
        // id will be auto-generated by database (uuid_generate_v4())
        clinic_id: clinicId,
        patient_id: patientInfo.id,
        file_name: edfFile.name,
        file_path: uploadResult.path,
        status: 'processing',
        // Store extra data in JSONB report_data column
        report_data: {
          title: edfFile.name.replace(/\.(edf|eeg|bdf)$/i, ''),
          type: 'EEG/P&ID Analysis',
          report_type: 'eeg_analysis',
          patient_name: patientInfo.name,
          workflow_id: workflowId,
          file_size: edfFile.size,
          file_url: uploadResult.url,
          processing_status: 'uploaded',
          processing_step: 'File uploaded - Analysis in progress',
          progress: 20,
          uploaded_at: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        const createdReport = await DatabaseService.add('reports', immediateReport);
        const reportId = createdReport.id; // Get auto-generated UUID from database
        console.log('SUCCESS: Immediate report entry created:', reportId);
        workflow.results.reportId = reportId; // Store for later update
      } catch (error) {
        console.error('ERROR: Failed to create immediate report entry:', error);
        console.error('Error details:', error.message);
        // Don't throw - continue workflow even if report entry fails
      }

      workflow.steps.fileUpload.status = 'completed';
      workflow.steps.fileUpload.completedAt = new Date().toISOString();
      workflow.results.fileUpload = fileRecord;

      await this.updateWorkflowInDatabase(workflow);
      console.log('SUCCESS: File upload completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.fileUpload.status = 'failed';
      workflow.steps.fileUpload.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 2: Process through P&ID Pro
   */
  async executePIDProcessing(workflowId, edfFile, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.pidProcessing.status = 'processing';
    workflow.steps.pidProcessing.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      // Update report progress - P&ID processing started
      const reportId = workflow.results.reportId;
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);
          await DatabaseService.update('reports', reportId, {
            status: 'processing',
            report_data: {
              ...currentReport.report_data,
              processing_status: 'pid_processing',
              processing_step: 'P&ID Pro analysis in progress',
              progress: 40
            },
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.warn('WARNING: Could not update report progress:', error.message);
        }
      }

      // Submit to P&ID Pro
      const pidResult = await PIDProService.uploadForProcessing(edfFile, {
        patientId: patientInfo.id,
        patientName: patientInfo.name,
        clinicId: workflow.clinicId
      });

      // Wait for processing to complete (in real implementation, this would be a webhook/polling)
      await this.waitForPIDCompletion(pidResult.jobId);

      // Download results
      const pidReport = await PIDProService.downloadReport(pidResult.jobId);

      workflow.steps.pidProcessing.status = 'completed';
      workflow.steps.pidProcessing.completedAt = new Date().toISOString();
      workflow.results.pidProcessing = {
        jobId: pidResult.jobId,
        report: pidReport
      };

      // Update report progress - P&ID completed
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);
          await DatabaseService.update('reports', reportId, {
            status: 'processing',
            report_data: {
              ...currentReport.report_data,
              processing_status: 'pid_completed',
              processing_step: 'P&ID analysis completed',
              progress: 60,
              pid_job_id: pidResult.jobId
            },
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.warn('WARNING: Could not update report progress:', error.message);
        }
      }

      await this.updateWorkflowInDatabase(workflow);
      console.log('SUCCESS: P&ID processing completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.pidProcessing.status = 'failed';
      workflow.steps.pidProcessing.error = error.message;
      await this.updateWorkflowInDatabase(workflow);
      throw error;
    }
  }

  /**
   * Step 3: Analyze through AIMS
   */
  async executeAIMSAnalysis(workflowId, patientInfo) {
    const workflow = this.workflows.get(workflowId);
    workflow.steps.aimsAnalysis.status = 'processing';
    workflow.steps.aimsAnalysis.startedAt = new Date().toISOString();
    await this.updateWorkflowInDatabase(workflow);

    try {
      // Update report progress - AIMS analysis started
      const reportId = workflow.results.reportId;
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);
          await DatabaseService.update('reports', reportId, {
            status: 'processing',
            report_data: {
              ...currentReport.report_data,
              processing_status: 'aims_analyzing',
              processing_step: 'AIMS AI analysis in progress',
              progress: 70
            },
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.warn('WARNING: Could not update report progress:', error.message);
        }
      }

      const pidReport = workflow.results.pidProcessing.report;

      // Process through AIMS algorithms
      const aimsResult = await AIMSService.processPIDReport(pidReport, patientInfo);

      // Save AIMS report
      const savedReport = await AIMSService.saveProcessedReport(
        aimsResult,
        workflow.clinicId,
        patientInfo.id
      );

      workflow.steps.aimsAnalysis.status = 'completed';
      workflow.steps.aimsAnalysis.completedAt = new Date().toISOString();
      workflow.results.aimsAnalysis = {
        reportId: savedReport.id,
        standardizedReport: aimsResult.standardizedReport,
        riskAssessment: aimsResult.riskAssessment,
        recommendations: aimsResult.recommendations
      };

      // Update report progress - AIMS completed
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);
          await DatabaseService.update('reports', reportId, {
            status: 'processing',
            report_data: {
              ...currentReport.report_data,
              processing_status: 'aims_completed',
              processing_step: 'AIMS analysis completed',
              progress: 85,
              aims_report_id: savedReport.id
            },
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.warn('WARNING: Could not update report progress:', error.message);
        }
      }

      await this.updateWorkflowInDatabase(workflow);
      console.log('SUCCESS: AIMS analysis completed for workflow:', workflowId);

    } catch (error) {
      workflow.steps.aimsAnalysis.status = 'failed';
      workflow.steps.aimsAnalysis.error = error.message;
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
      // Update report progress - Care plan generation started
      const reportId = workflow.results.reportId;
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);
          await DatabaseService.update('reports', reportId, {
            status: 'processing',
            report_data: {
              ...currentReport.report_data,
              processing_status: 'careplan_generating',
              processing_step: 'Generating personalized care plan',
              progress: 90
            },
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.warn('WARNING: Could not update report progress:', error.message);
        }
      }

      const aimsResults = workflow.results.aimsAnalysis;

      // Generate personalized care plan
      const carePlan = await AIMSService.generateCarePlan(
        aimsResults.riskAssessment,
        patientInfo
      );

      // Save care plan
      const carePlanData = {
        id: `careplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        patientId: patientInfo.id,
        clinicId: workflow.clinicId,
        aimsReportId: aimsResults.reportId,
        carePlan,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await DatabaseService.add('care_plans', carePlanData);

      workflow.steps.carePlanGeneration.status = 'completed';
      workflow.steps.carePlanGeneration.completedAt = new Date().toISOString();
      workflow.results.carePlanGeneration = carePlanData;

      await this.updateWorkflowInDatabase(workflow);
      console.log('SUCCESS: Care plan generation completed for workflow:', workflowId);

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
      // Get the report ID created during file upload
      const reportId = workflow.results.reportId;

      // UPDATE existing report instead of creating new one
      if (reportId) {
        try {
          const currentReport = await DatabaseService.findById('reports', reportId);

          // Compile final report data with all components
          const finalReportData = {
            status: 'completed',
            report_data: {
              ...currentReport.report_data,
              // Processing results
              workflow_id: workflowId,
              type: 'complete_eeg_analysis',
              report_type: 'complete_eeg_analysis',
              original_file: workflow.results.fileUpload,
              pid_report: workflow.results.pidProcessing?.report || null,
              aims_analysis: workflow.results.aimsAnalysis || null,
              care_plan: workflow.results.carePlanGeneration?.carePlan || null,
              processing_workflow: {
                workflowId,
                totalProcessingTime: this.calculateProcessingTime(workflow),
                completedSteps: Object.keys(workflow.steps).length,
                qualityScore: this.calculateQualityScore(workflow)
              },
              // Final status
              processing_status: 'completed',
              processing_step: 'Analysis completed successfully',
              progress: 100,
              completed_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          };

          await DatabaseService.update('reports', reportId, finalReportData);
          console.log('SUCCESS: Report updated with complete analysis:', reportId);
        } catch (error) {
          console.error('ERROR: Failed to update final report:', error);
          throw error;
        }
      } else {
        // Fallback: Create new report if no reportId found (shouldn't happen)
        console.warn('WARNING: No reportId found in workflow, creating new report');
        const newReport = {
          // id will be auto-generated by database
          clinic_id: clinicId,
          patient_id: patientInfo.id,
          file_name: workflow.fileName || 'unknown',
          file_path: workflow.results.fileUpload?.storagePath || '',
          status: 'completed',
          report_data: {
            workflow_id: workflowId,
            type: 'complete_eeg_analysis',
            completed_at: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await DatabaseService.add('reports', newReport);
      }

      // Update supervisor status
      await this.updatePatientStatus(patientInfo.id, 'report_completed');

      // Update clinic usage
      await this.updateClinicUsage(clinicId);

      workflow.steps.reportFinalization.status = 'completed';
      workflow.steps.reportFinalization.completedAt = new Date().toISOString();
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.results.finalReport = { id: reportId, ...finalReportData };

      await this.updateWorkflowInDatabase(workflow);
      console.log('SUCCESS: Report finalization completed for workflow:', workflowId);

      // Notify completion
      this.notifyWorkflowCompletion(workflow, { id: reportId, ...finalReportData });

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
        console.log(' Workflow cancelled:', workflowId);
      }
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
    }
  }

  /**
   * Helper methods
   */
  async waitForPIDCompletion(jobId, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await PIDProService.checkProcessingStatus(jobId);

      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error(`P&ID processing failed: ${status.message}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('P&ID processing timeout');
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
      console.error('Failed to update supervisor status:', error);
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
    console.log('EMAIL: Workflow completion notification:', {
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
      console.log('SUCCESS: Workflow saved to database:', workflow.id);
    } catch (error) {
      // Workflow tracking is optional - continue even if database save fails
      console.warn('WARNING: Could not save workflow to database (table may not exist yet):', error.message);
      console.log('INFO: Workflow will continue processing without database tracking');
    }
  }

  async updateWorkflowInDatabase(workflow) {
    try {
      await DatabaseService.update('workflows', workflow.id, workflow);
      console.log('SUCCESS: Workflow updated in database:', workflow.id);
    } catch (error) {
      // Workflow tracking is optional - continue even if database update fails
      console.warn('WARNING: Could not update workflow in database (table may not exist yet):', error.message);
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