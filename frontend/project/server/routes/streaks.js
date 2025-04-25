const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock database for study plans and quizzes
let studyPlans = new Map();

// Initialize study plan
router.post('/initialize', auth, async (req, res) => {
  try {
    const { mindmaps } = req.body;
    const userId = req.user.id;

    // Generate study plan based on mindmaps
    const studyPlan = {
      study_plan: mindmaps.map((mindmap, topicIndex) => ({
        topic: mindmap.title,
        duration_minutes: 30,
        subtopics: Array(3).fill(null).map((_, subtopicIndex) => ({
          name: `Subtopic ${subtopicIndex + 1}`,
          duration_minutes: 10,
          quiz: generateQuiz(mindmap.content)
        }))
      })),
      tokens: 100
    };

    // Store study plan for user
    studyPlans.set(userId, studyPlan);

    res.json(studyPlan);
  } catch (error) {
    console.error('Error initializing study plan:', error);
    res.status(500).json({ error: 'Failed to initialize study plan' });
  }
});

// Get quiz for specific topic and subtopic
router.get('/quiz/:topicIndex/:subtopicIndex', auth, async (req, res) => {
  try {
    const { topicIndex, subtopicIndex } = req.params;
    const userId = req.user.id;
    const studyPlan = studyPlans.get(userId);

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    const quiz = studyPlan.study_plan[topicIndex]?.subtopics[subtopicIndex]?.quiz;
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ questions: quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
router.post('/submit-quiz/:topicIndex/:subtopicIndex', auth, async (req, res) => {
  try {
    const { topicIndex, subtopicIndex } = req.params;
    const answers = req.body;
    const userId = req.user.id;
    const studyPlan = studyPlans.get(userId);

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    const quiz = studyPlan.study_plan[topicIndex]?.subtopics[subtopicIndex]?.quiz;
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (quiz[index].answer === answer) {
        score++;
      }
    });

    const total = quiz.length;
    const percentage = (score / total) * 100;
    const passed = percentage >= 70;
    const tokens = passed ? 50 : 0;

    // Update user's tokens if passed
    if (passed) {
      studyPlan.tokens += tokens;
    }

    res.json({
      score,
      total,
      percentage,
      tokens,
      passed
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Helper function to generate quiz questions
function generateQuiz(content) {
  // Mock quiz generation - replace with actual implementation
  return [
    {
      question: 'What is the main topic of this section?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A'
    },
    {
      question: 'Which concept is most important?',
      options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'],
      answer: 'Concept 2'
    },
    {
      question: 'How does this relate to the overall subject?',
      options: ['Relation 1', 'Relation 2', 'Relation 3', 'Relation 4'],
      answer: 'Relation 3'
    }
  ];
}

module.exports = router;