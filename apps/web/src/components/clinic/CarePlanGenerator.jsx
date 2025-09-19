import React, { useState, useEffect } from 'react';
import {
  Heart, Brain, Activity, Target, Calendar, CheckCircle,
  AlertTriangle, Info, Download, Share, Edit, Save,
  TrendingUp, Shield, Clock, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import NeuroSenseService from '../../services/neuroSenseService';

const CarePlanGenerator = ({ patient, neuroSenseReport, onSave, onClose }) => {
  const [carePlan, setCarePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);

  useEffect(() => {
    if (neuroSenseReport?.carePlan) {
      setCarePlan(neuroSenseReport.carePlan);
      setEditedPlan(neuroSenseReport.carePlan);
      setLoading(false);
    } else if (patient) {
      generateCarePlan();
    }
  }, [neuroSenseReport, patient]);

  const generateCarePlan = async () => {
    try {
      setLoading(true);

      // Simulate care plan generation if no NeuroSense report
      const mockRiskAssessment = {
        riskLevel: 'Medium',
        riskFactors: ['Age-related changes', 'Lifestyle factors'],
        followUpRequired: true
      };

      const generatedPlan = await NeuroSenseService.generateCarePlan(mockRiskAssessment, patient);
      setCarePlan(generatedPlan);
      setEditedPlan(generatedPlan);
    } catch (error) {
      console.error('Failed to generate care plan:', error);
      toast.error('Failed to generate care plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCarePlan = async () => {
    try {
      setLoading(true);

      const carePlanData = {
        id: `careplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        clinicId: patient.clinicId,
        neuroSenseReportId: neuroSenseReport?.reportId,
        carePlan: editedPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        version: 1
      };

      await DatabaseService.add('care_plans', carePlanData);
      toast.success('Care plan saved successfully');

      if (onSave) {
        onSave(carePlanData);
      }
    } catch (error) {
      console.error('Failed to save care plan:', error);
      toast.error('Failed to save care plan');
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (index, newGoal) => {
    const updated = { ...editedPlan };
    updated.goals[index] = newGoal;
    setEditedPlan(updated);
  };

  const addGoal = () => {
    const updated = { ...editedPlan };
    updated.goals.push('New goal');
    setEditedPlan(updated);
  };

  const removeGoal = (index) => {
    const updated = { ...editedPlan };
    updated.goals.splice(index, 1);
    setEditedPlan(updated);
  };

  const updateIntervention = (index, newIntervention) => {
    const updated = { ...editedPlan };
    updated.interventions[index] = newIntervention;
    setEditedPlan(updated);
  };

  const addIntervention = () => {
    const updated = { ...editedPlan };
    updated.interventions.push('New intervention');
    setEditedPlan(updated);
  };

  const removeIntervention = (index) => {
    const updated = { ...editedPlan };
    updated.interventions.splice(index, 1);
    setEditedPlan(updated);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Care Plan</h3>
            <p className="text-gray-600">Creating personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!carePlan) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Personalized Care Plan</h2>
                <p className="text-blue-100">Patient: {patient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {editMode ? 'View Mode' : 'Edit Mode'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Goals Section */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Treatment Goals</h3>
              {editMode && (
                <button
                  onClick={addGoal}
                  className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Add Goal
                </button>
              )}
            </div>
            <div className="space-y-3">
              {editedPlan.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  {editMode ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeGoal(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800">{goal}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interventions Section */}
          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Recommended Interventions</h3>
              {editMode && (
                <button
                  onClick={addIntervention}
                  className="ml-auto px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Add Intervention
                </button>
              )}
            </div>
            <div className="space-y-3">
              {editedPlan.interventions.map((intervention, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-green-600 flex-shrink-0" />
                  {editMode ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={intervention}
                        onChange={(e) => updateIntervention(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => removeIntervention(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800">{intervention}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Section */}
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Monitoring Plan</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Follow-up Schedule
                </h4>
                <p className="text-gray-700 mb-4">{carePlan.monitoring.frequency}</p>

                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Monitoring Parameters
                </h4>
                <ul className="space-y-1">
                  {carePlan.monitoring.parameters.map((param, index) => (
                    <li key={index} className="text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      {param}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alerts & Warnings
                </h4>
                {carePlan.monitoring.alerts.length > 0 ? (
                  <ul className="space-y-1">
                    {carePlan.monitoring.alerts.map((alert, index) => (
                      <li key={index} className="text-orange-700 bg-orange-100 px-3 py-2 rounded-lg text-sm">
                        {alert}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No specific alerts required</p>
                )}
              </div>
            </div>
          </div>

          {/* Lifestyle Recommendations */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-900">Lifestyle Recommendations</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Exercise</h4>
                  <p className="text-gray-700">{carePlan.lifestyle.exercise}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Sleep</h4>
                  <p className="text-gray-700">{carePlan.lifestyle.sleep}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Nutrition</h4>
                  <p className="text-gray-700">{carePlan.lifestyle.nutrition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Stress Management</h4>
                  <p className="text-gray-700">{carePlan.lifestyle.stress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {/* Implement download */}}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={() => {/* Implement share */}}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleSaveCarePlan}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Care Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlanGenerator;