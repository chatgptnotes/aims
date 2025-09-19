import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface QEEGFile {
  id: string
  name: string
  uploadDate: string
  status: 'pending' | 'processing' | 'analyzed' | 'error'
  size: string
  type: string
}

interface QEEGUploadProps {
  onUploadComplete?: (file: QEEGFile) => void
}

export default function QEEGUpload({ onUploadComplete }: QEEGUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<QEEGFile[]>([
    {
      id: '1',
      name: 'baseline_qeeg_20250115.edf',
      uploadDate: '2025-01-15',
      status: 'analyzed',
      size: '2.4 MB',
      type: 'EDF'
    },
    {
      id: '2', 
      name: 'followup_qeeg_20250110.edf',
      uploadDate: '2025-01-10',
      status: 'processing',
      size: '2.1 MB',
      type: 'EDF'
    }
  ])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.edf') && 
          !file.name.toLowerCase().endsWith('.eeg') &&
          !file.name.toLowerCase().endsWith('.bdf')) {
        alert(`File ${file.name} is not a supported qEEG file format. Please upload .edf, .eeg, or .bdf files.`)
        continue
      }
      
      // Simulate upload process
      const newFile: QEEGFile = {
        id: Date.now().toString() + i,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      }
      
      setUploadedFiles(prev => [newFile, ...prev])
      
      // Simulate processing delay
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, status: 'processing' } : f)
        )
        
        // Simulate analysis completion
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'analyzed' } : f)
          )
          
          if (onUploadComplete) {
            onUploadComplete({ ...newFile, status: 'analyzed' })
          }
        }, 3000)
      }, 1000)
    }
    
    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getStatusColor = (status: QEEGFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'analyzed': return 'bg-green-100 text-green-700'
      case 'error': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: QEEGFile['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'processing': return '🔄'
      case 'analyzed': return '✅'
      case 'error': return '❌'
      default: return '📄'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload qEEG Files</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-brain-500 bg-brain-50' 
              : 'border-gray-300 hover:border-brain-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-4xl mb-4">🧠</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop your qEEG files here' : 'Upload qEEG Files'}
          </h4>
          <p className="text-gray-600 mb-4">
            Drag and drop your .edf, .eeg, or .bdf files here, or click to browse
          </p>
          
          <input
            type="file"
            multiple
            accept=".edf,.eeg,.bdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="qeeg-upload"
            disabled={isUploading}
          />
          
          <label htmlFor="qeeg-upload">
            <Button
              as="span"
              variant="brain"
              disabled={isUploading}
              className="cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Select Files'}
            </Button>
          </label>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Supported formats: EDF, EEG, BDF</p>
            <p>Maximum file size: 50MB per file</p>
          </div>
        </div>
      </Card>

      {/* File List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your qEEG Files</h3>
          <span className="text-sm text-gray-500">{uploadedFiles.length} files</span>
        </div>
        
        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📁</div>
            <p>No qEEG files uploaded yet</p>
            <p className="text-sm">Upload your first file to get started with analysis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getStatusIcon(file.status)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-600">
                      {file.type} • {file.size} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </span>
                  
                  {file.status === 'analyzed' && (
                    <Button variant="outline" className="text-sm">
                      View Analysis
                    </Button>
                  )}
                  
                  <button className="text-gray-400 hover:text-red-600">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analysis Summary */}
      {uploadedFiles.filter(f => f.status === 'analyzed').length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-brain-50 rounded-lg">
              <div className="text-2xl font-bold text-brain-600 mb-1">
                {uploadedFiles.filter(f => f.status === 'analyzed').length}
              </div>
              <div className="text-sm text-gray-600">Files Analyzed</div>
            </div>
            
            <div className="text-center p-4 bg-wellness-50 rounded-lg">
              <div className="text-2xl font-bold text-wellness-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Improvement Areas</div>
            </div>
            
            <div className="text-center p-4 bg-calm-50 rounded-lg">
              <div className="text-2xl font-bold text-calm-600 mb-1">85%</div>
              <div className="text-sm text-gray-600">Protocol Adherence</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">+15%</div>
              <div className="text-sm text-gray-600">Progress Score</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="brain" className="mr-3">
              Generate Report
            </Button>
            <Button variant="outline">
              Schedule Consultation
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

