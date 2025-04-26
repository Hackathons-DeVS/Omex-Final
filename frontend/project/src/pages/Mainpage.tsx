import React, { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MindmapViewer } from '../components/MindmapViewer';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { NeonBorder } from '../components/NeonBorder';
import toast from 'react-hot-toast';

interface Mindmap {
  title: string;
  code: string;
}

const Mainpage = () => {
  // Local tokens state for this page
  const [tokens] = useState(0); // Initial tokens set to zero
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
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
    if (file.size > 500 * 1024) { // 500KB limit
      toast.error('File size should be less than 500KB');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setMindmaps([]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const startTime = Date.now();
      const response = await fetch('https://omex-final.onrender.com/api/mindmap/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      const endTime = Date.now();
      setProcessingTime((endTime - startTime) / 1000); // Convert to seconds
      setMindmaps(data.mindmaps);

      toast.success('Mindmap generated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload error: ${error.message || 'Unknown error occurred'}`);
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header>
        <div className="hidden md:flex items-center gap-4 ml-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
            <span className="text-sm font-medium text-black dark:text-white">{tokens} Tokens</span>
          </div>
        </div>
      </Header>
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-12 shadow-2xl mt-16 mb-16">
              <NeonBorder />
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-black dark:text-white">Upload Your Syllabus</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
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
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
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
        </div>
      </main>
      {mindmaps.length > 0 && (
        <div className="w-full max-w-5xl mx-auto px-6 pb-20">
          <MindmapViewer mindmaps={mindmaps} processingTime={processingTime ?? undefined} />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Mainpage;