import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NeonBorder } from '../components/NeonBorder';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {}

export const Quiz: React.FC<QuizProps> = () => {
  const { topicIndex, subtopicIndex } = useParams<{ topicIndex: string; subtopicIndex: string }>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    tokens: number;
    passed: boolean;
  } | null>(null);
  
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `/api/streaks/quiz/${topicIndex}/${subtopicIndex}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid quiz data received');
        }
        setQuestions(data.questions);
      } catch (error) {
        console.error('Quiz fetch error:', error);
        setError('Failed to load quiz questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (topicIndex && subtopicIndex) {
      fetchQuiz();
    }
  }, [topicIndex, subtopicIndex, token]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch(
        `/api/streaks/submit-quiz/${topicIndex}/${subtopicIndex}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers: currentAnswers })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const results = await response.json();
      setQuizResults(results);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Quiz submission error:', error);
      setError('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent relative z-10"></div>
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
          <button
            onClick={() => navigate('/study-streaks')}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Study Plan
          </button>
        </div>
      </div>
    );
  }

  if (quizSubmitted && quizResults) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-6 shadow-lg text-center">
            <NeonBorder />
            
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Quiz Results
            </h2>
            
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-black dark:text-white">
                Score: {quizResults.score}/{quizResults.total}
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Percentage: {quizResults.percentage.toFixed(1)}%
              </p>
              {quizResults.passed && (
                <div className="mt-6">
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    🎉 Congratulations! You passed!
                  </p>
                  <p className="text-purple-600 mt-2">
                    +{quizResults.tokens} tokens earned!
                  </p>
                </div>
              )}
              
              <div className="mt-8 space-x-4">
                <button
                  onClick={() => navigate('/study-streaks')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Back to Study Plan
                </button>
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setCurrentAnswers({});
                  }}
                  className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Retry Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {questions.map((question, index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-6 shadow-lg"
          >
            <NeonBorder />
            
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
              {index + 1}. {question.question}
            </h3>
            
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={currentAnswers[index] === option}
                    onChange={() => handleAnswerSelect(index, option)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(currentAnswers).length !== questions.length}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full disabled:opacity-50 enabled:hover:opacity-90 transition-opacity"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};