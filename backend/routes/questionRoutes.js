// backend/routes/questionRoutes.js
const express = require('express');
const questionController = require('../controllers/questionController');
const { requireAuth, authorizeRoles } = require('../middleware/authMiddleware');
const { questionRules } = require('../middleware/validators');

const router = express.Router();

// ANY logged-in user can view the questions (Students need this to take the test)
router.get('/', requireAuth, questionController.getAllQuestions);

// ONLY Examiners (and Admins) can add new questions
router.post('/', requireAuth, authorizeRoles('examiner', 'admin'), questionRules, questionController.createQuestion);

// ONLY Examiners (and Admins) can delete questions
router.delete('/:id', requireAuth, authorizeRoles('examiner', 'admin'), questionController.deleteQuestion);

// ONLY Students can submit exams
router.post('/submit', requireAuth, authorizeRoles('student'), questionController.submitExam);

module.exports = router;
