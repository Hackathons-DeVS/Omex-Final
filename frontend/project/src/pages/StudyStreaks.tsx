import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NeonBorder } from '../components/NeonBorder';
import { StudyHeader } from '../components/StudyHeader';
import { Footer } from '../components/Footer';
import { QuizModal } from '../components/QuizModal';
import { Coins } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string | number;
}

interface Subtopic {
  name: string;
  duration_minutes: number;
  quiz: QuizQuestion[];
}

interface Topic {
  topic: string;
  duration_minutes: number;
  subtopics: Subtopic[];
}

interface StudyPlan {
  study_plan: Topic[];
  tokens: number;
}

export const StudyStreaks: React.FC = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{ topicIndex: number; subtopicIndex: number; questions: QuizQuestion[] } | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const mindmapsData = sessionStorage.getItem('current_mindmaps');
    if (!mindmapsData) {
      navigate('/');
      return;
    }

    const generateStudyPlan = async () => {
      try {
        setError(null);
        const mindmaps = JSON.parse(mindmapsData);
        
        // Format mindmap data for the backend
        const formattedData = {
          mindmaps: mindmaps.map((mindmap: any) => ({
            title: mindmap.title,
            content: mindmap.code
          }))
        };

        const response = await fetch('/api/streaks/initialize', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedData)
        });

        // Handle both JSON and redirect responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to generate study plan');
          }
          if (data.study_plan) {
            setStudyPlan(data);
            setTokens(data.tokens || 0);
          } else {
            throw new Error('Invalid study plan data received');
          }
        } else {
          // If it's not JSON, it might be a redirect
          const text = await response.text();
          if (text.includes('Please upload a PDF first')) {
            navigate('/');
          } else {
            throw new Error('Unexpected response from server');
          }
        }
      } catch (error) {
        console.error('Error generating study plan:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    generateStudyPlan();
  }, [token, navigate]);

  const startQuiz = (topicIndex: number, subtopicIndex: number) => {
    const questions = studyPlan?.study_plan[topicIndex]?.subtopics[subtopicIndex]?.quiz || [];
    setCurrentQuiz({ topicIndex, subtopicIndex, questions });
    setIsQuizModalOpen(true);
  };

  const handleQuizComplete = (newTokens: number) => {
    if (currentQuiz) {
      const quizKey = `${currentQuiz.topicIndex}-${currentQuiz.subtopicIndex}`;
      setCompletedQuizzes(prev => new Set([...prev, quizKey]));
      setTokens(newTokens);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent relative z-10"></div>
        </div>
        <div className="text-center space-y-3 relative z-10">
          <p className="text-base text-purple-600 dark:text-purple-400 font-medium">Generating your personalized study plan...</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 px-4 py-2 rounded-full inline-block">
            Please don't refresh <span className="animate-pulse">⚡</span>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">Failed to generate study plan. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudyHeader tokens={tokens} />
      <main className="flex-grow container mx-auto px-4 py-36 max-w-[60%]">        
        <div className="mb-20 text-center">
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
            Your Study Plan
          </h1>
        </div>

        <div className="space-y-12">
          {studyPlan.study_plan.map((topic, topicIndex) => (
            <div key={topicIndex} className="relative bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-8 shadow-lg">
              <NeonBorder />
              
              <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
                {topic.topic}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({topic.duration_minutes} mins)
                </span>
              </h2>

              <div className="flex flex-col space-y-6 items-center">
                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <div 
                    key={subtopicIndex}
                    className="relative bg-white/50 dark:bg-black/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800 w-[85%] mx-auto"
                  >
                  <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                    {subtopic.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                    Estimated: {subtopic.duration_minutes} mins
                  </p>
                  <button
                    onClick={() => startQuiz(topicIndex, subtopicIndex)}
                    className={`w-full px-4 py-3 rounded-lg transition-all ${completedQuizzes.has(`${topicIndex}-${subtopicIndex}`) 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90'} text-white`}
                  >
                    {completedQuizzes.has(`${topicIndex}-${subtopicIndex}`) ? 'Completed ✓' : 'Start Quiz'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </main>
      <Footer />
      {currentQuiz && (
        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={() => {
            setIsQuizModalOpen(false);
            setCurrentQuiz(null);
          }}
          onQuizComplete={handleQuizComplete}
          questions={currentQuiz.questions}
          topicIndex={currentQuiz.topicIndex}
          subtopicIndex={currentQuiz.subtopicIndex}
        />
      )}
    </div>
  );
};