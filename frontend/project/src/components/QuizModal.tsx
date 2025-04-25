// test code update
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonBorder } from './NeonBorder';
import { Coins } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string | number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  topicIndex: number;
  subtopicIndex: number;
  onQuizComplete: (newTokens: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  topicIndex,
  subtopicIndex,
  onQuizComplete
}) => {
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: number]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    tokens: number;
    passed: boolean;
    answers: { userAnswer: string; correctAnswer: string; isCorrect: boolean }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTokenAnimation, setShowTokenAnimation] = useState(false);
  const [tokensClaimed, setTokensClaimed] = useState(false);
  const [attemptedQuiz, setAttemptedQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Initialize the component when questions change
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      // Reset answers when questions change
      setCurrentAnswers({});
    }
  }, [isOpen, questions]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const modalElement = document.querySelector('.quiz-modal-container');
        if (modalElement) {
          if (modalElement.requestFullscreen) {
            await modalElement.requestFullscreen();
          }
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    try {
      let score = 0;
      const answers = questions.map((question, index) => {
        // Get user answer, defaulting to empty string if not answered
        const userAnswer = currentAnswers[index] || '';
        // Get correct answer from question (could be string or number)
        const correctAnswer = question.answer;
        
        let isCorrect = false;
        let correctAnswerText = ""; // Store the text representation of the correct answer
        
        // Parse the correct answer to handle both string and numeric indices
        const correctAnswerIndex = typeof correctAnswer === 'string' ? parseInt(correctAnswer) : correctAnswer;
        
        // Get the selected option's index by finding the matching option text
        const selectedOptionIndex = question.options.findIndex(
          option => option.trim().toLowerCase() === userAnswer.trim().toLowerCase()
        );

        // Compare the indices for scoring
        isCorrect = selectedOptionIndex === correctAnswerIndex;
        
        // Get the text representation of the correct answer for display
        if (correctAnswerIndex >= 0 && correctAnswerIndex < question.options.length) {
          correctAnswerText = question.options[correctAnswerIndex];
        } else {
          console.error(`Invalid answer index: ${correctAnswerIndex} for question ${index}`);
          correctAnswerText = "Invalid answer index";
        }

        if (isCorrect) score++;
            
        return {
          userAnswer: userAnswer,
          // Display the actual correct answer text
          correctAnswer: correctAnswerText,
          isCorrect
        };
      });

      const total = questions.length;
      const percentage = total > 0 ? (score / total) * 100 : 0;
      const passed = percentage >= 70;
      
      // Calculate tokens based on performance
      let tokens = 0;
      if (passed) {
        // Base tokens for passing
        tokens = 50;
        // Bonus tokens for high scores
        if (percentage >= 90) tokens += 50;
        else if (percentage >= 80) tokens += 30;
      }

      const results = {
        score,
        total,
        percentage,
        tokens,
        passed,
        answers
      };

      setQuizResults(results);
      setQuizSubmitted(true);
      setAttemptedQuiz(true);
      setQuizPassed(passed);
      // We'll handle token claiming with a button now instead of automatic completion
      // This allows for the animation to play when the user claims tokens
    } catch (error) {
      console.error('Quiz submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit quiz. Please try again.');
    }
  };

  const handleRetry = () => {
    setQuizSubmitted(false);
    setCurrentAnswers({});
    setQuizResults(null);
    setError(null);
    setTokensClaimed(false);
    setShowTokenAnimation(false);
    // Keep attemptedQuiz true so we know this is a retry
  };
  
  const handleClaimTokens = () => {
    if (quizResults && quizResults.passed && !tokensClaimed) {
      setShowTokenAnimation(true);
      // Calculate total tokens: base tokens + bonus tokens for correct answers
      const totalTokens = quizResults.tokens + quizResults.score;
      // Update token count in parent component
      onQuizComplete(totalTokens);
      setTokensClaimed(true);
      
      // Hide animation after it plays
      setTimeout(() => {
        setShowTokenAnimation(false);
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`quiz-modal-container relative w-full ${isFullscreen ? 'max-w-none h-screen' : 'max-w-3xl max-h-[90vh]'} overflow-y-auto bg-white dark:bg-black rounded-3xl shadow-2xl overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-600/50 hover:scrollbar-thumb-purple-600/70 dark:scrollbar-thumb-purple-400/50 dark:hover:scrollbar-thumb-purple-400/70 z-[102]`}
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none">
              <div className="absolute inset-0 rounded-3xl transition-opacity"></div>
            </div>
            
            <div className="p-8 relative z-10">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                >
                  {isFullscreen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5-5m0 0l5-5m-5 5h16m0-5l-5 5m0 0l5 5m-5-5H4" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </button>
                </div>
              ) : quizSubmitted && quizResults ? (
                <div className="text-center py-8 space-y-6">
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
                    {quizResults.passed ? (
                      <div className="mt-6">
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          🎉 Congratulations! You passed!
                        </p>
                        <p className="text-purple-600 mt-2">
                          {tokensClaimed ? (
                            <span>+{quizResults.tokens + quizResults.score} tokens earned! ({quizResults.tokens} base + {quizResults.score} bonus)</span>
                          ) : (
                            <span>You can earn {quizResults.tokens + quizResults.score} tokens! ({quizResults.tokens} base + {quizResults.score} bonus)</span>
                          )}
                        </p>
                        
                        {!tokensClaimed && (
                          <button
                            onClick={handleClaimTokens}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                          >
                            <Coins className="h-5 w-5" />
                            Claim Tokens
                          </button>
                        )}
                        
                        {tokensClaimed && (
                          <p className="text-green-500 mt-4 font-medium">Tokens claimed successfully!</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-600 dark:text-red-400 mt-6">
                        You need at least 70% to pass. Try again!
                      </p>
                    )}
                    
                    {quizResults.passed && (
                      <div className="mt-8 space-y-4 text-left">
                        <h3 className="text-xl font-semibold mb-4">Quiz Review:</h3>
                        {quizResults.answers.map((result, index) => (
                          <div key={index} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            <p className="font-medium mb-2">Question {index + 1}:</p>
                            <p className="text-gray-700 dark:text-gray-300">Your answer: {result.userAnswer || 'Not answered'}</p>
                            <p className={`${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Correct answer: {result.correctAnswer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 space-x-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Continue
                    </button>
                    <button
                      onClick={handleRetry}
                      className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      Retry Quiz
                    </button>
                  </div>
                  
                  {/* Token Animation */}
                  {showTokenAnimation && (
                    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-8 rounded-full shadow-lg flex items-center justify-center"
                        >
                          <Coins className="h-16 w-16 text-white" />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 whitespace-nowrap bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-bold"
                        >
                          +{quizResults.tokens + quizResults.score} Tokens!
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {quizPassed ? 'Quiz Completed' : (attemptedQuiz ? 'Retry Quiz' : 'Quiz')}
                  </h2>
                  
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="bg-white/50 dark:bg-black/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
                    >
                      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
                        {index + 1}. {question.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center p-4 rounded-xl cursor-pointer bg-white/30 dark:bg-black/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all transform hover:scale-[1.02] border border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold mr-4">
                              {String.fromCharCode(65 + optionIndex)} {/* A, B, C, etc. */}
                            </div>
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={currentAnswers[index] === option}
                              onChange={() => handleAnswerSelect(index, option)}
                              className="hidden"
                            />
                            <span className={`flex-grow text-lg ${currentAnswers[index] === option ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {option}
                            </span>
                            {currentAnswers[index] === option && (
                              <div className="ml-3 text-purple-600 dark:text-purple-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
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
                      {attemptedQuiz ? 'Submit Again' : 'Submit Quiz'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
