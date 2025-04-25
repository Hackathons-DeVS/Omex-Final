import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check } from 'lucide-react';
import { Button } from './Button';
import { NeonBorder } from './NeonBorder';
import { MindmapViewer } from './MindmapViewer';
import toast from 'react-hot-toast';

export function FileUpload() {
  const [mindmaps, setMindmaps] = useState([]);
  const [processingTime, setProcessingTime] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const validateFile = (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size should be less than 10MB');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/mindmap/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      if (data.mindmaps && data.mindmaps.length > 0) {
        toast.success('Mindmap generated successfully!');
        setMindmaps(data.mindmaps);
        setProcessingTime(data.processingTime);
      } else {
        throw new Error('No mindmaps generated');
      }
    } catch (error) {
      toast.error('Failed to process syllabus');
      console.error(error);
    } finally {
      setLoading(false);
    }
};

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          <NeonBorder />


          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-black dark:text-white">Upload Your Syllabus</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload your PDF file to get started with personalized learning
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-black dark:text-white" />
                  <span className="text-sm font-medium text-black dark:text-white">{file.name}</span>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-black dark:text-white" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-full">
                    <Upload className="h-6 w-6 text-black dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      Drag and drop your PDF file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Only PDF files are supported (max 10MB)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {file && (
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    Process Syllabus
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {mindmaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <MindmapViewer mindmaps={mindmaps} processingTime={processingTime} />
        </motion.div>
      )}
    </div>
  );
}