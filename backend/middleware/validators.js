const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name is too long.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  // NEW: Secure the role field
  body('role')
    .optional()
    .isIn(['admin', 'examiner', 'student'])
    .withMessage('Role must be admin, examiner, or student.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const questionRules = [
  body('question_text').trim().notEmpty().withMessage('Question text is required.'),
  body('option_a').trim().notEmpty().withMessage('Option A is required.'),
  body('option_b').trim().notEmpty().withMessage('Option B is required.'),
  body('option_c').trim().notEmpty().withMessage('Option C is required.'),
  body('option_d').trim().notEmpty().withMessage('Option D is required.'),
  body('correct_option').isIn(['A', 'B', 'C', 'D']).withMessage('Correct option must be A, B, C, or D.'),
];

module.exports = { registerRules, loginRules, questionRules };
