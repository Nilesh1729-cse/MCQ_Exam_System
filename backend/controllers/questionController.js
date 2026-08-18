const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

exports.createQuestion = async (req, res) => {
    let connection;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        connection = await pool.getConnection();

        // 1. THE STRICT CAP: Check how many questions currently exist
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM questions');
        const questionCount = rows[0].count;

        if (questionCount >= 10) {
            return res.status(403).json({
                error: 'The exam is full. A maximum of 10 questions is allowed. Please delete a question before adding a new one.'
            });
        }

        // 2. If under 10, grab the data from the request
        const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
        const examiner_id = req.user.id; // We get this from the JWT token middleware!

        // 3. Save the new question
        const [result] = await connection.execute(
            `INSERT INTO questions 
            (examiner_id, question_text, option_a, option_b, option_c, option_d, correct_option) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [examiner_id, question_text, option_a, option_b, option_c, option_d, correct_option]
        );

        res.status(201).json({ message: 'Question added successfully', questionId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while adding question' });
    } finally {
        if (connection) connection.release();
    }
};

exports.getAllQuestions = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Students must never receive answer keys. Examiners and admins can review them.
        const query = req.user.role === 'student'
            ? 'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions ORDER BY id'
            : 'SELECT id, examiner_id, question_text, option_a, option_b, option_c, option_d, correct_option, created_at FROM questions ORDER BY id';
        const [questions] = await connection.execute(query);

        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching questions' });
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteQuestion = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const questionId = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(questionId) || questionId < 1) {
            return res.status(400).json({ error: 'Invalid question ID' });
        }

        const sql = req.user.role === 'admin'
            ? 'DELETE FROM questions WHERE id = ?'
            : 'DELETE FROM questions WHERE id = ? AND examiner_id = ?';
        const values = req.user.role === 'admin' ? [questionId] : [questionId, req.user.id];
        const [result] = await connection.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while deleting question' });
    } finally {
        if (connection) connection.release();
    }
};

exports.submitExam = async (req, res) => {
    let connection;
    try {
        const { answers } = req.body;
        const student_id = req.user.id; // From JWT middleware

        if (!Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers payload format.' });
        }

        connection = await pool.getConnection();

        // 1. Fetch all questions to check against correct options
        const [questions] = await connection.execute('SELECT id, correct_option FROM questions');
        if (questions.length === 0) {
            return res.status(400).json({ error: 'There are no questions available for this exam.' });
        }

        const [previousScores] = await connection.execute(
            'SELECT id FROM scores WHERE student_id = ? LIMIT 1',
            [student_id]
        );
        if (previousScores.length > 0) {
            return res.status(409).json({ error: 'This exam has already been submitted.' });
        }
        
        // 2. Map correct answers for quick lookup -> { "1": "A", "2": "C" }
        const correctAnswersMap = {};
        questions.forEach(q => {
            correctAnswersMap[q.id.toString()] = q.correct_option;
        });

        // 3. Calculate score
        let score = 0;
        const total_questions = questions.length; 

        const submittedAnswers = new Map();
        answers.forEach((ans) => {
            const questionId = String(ans?.questionId || '');
            const selectedOption = String(ans?.selectedOption || '').toUpperCase();
            if (correctAnswersMap[questionId] && ['A', 'B', 'C', 'D'].includes(selectedOption)) {
                submittedAnswers.set(questionId, selectedOption);
            }
        });

        submittedAnswers.forEach((selectedOption, questionId) => {
            // Check if the selected option matches the database correct option
            if (correctAnswersMap[questionId] === selectedOption) {
                score++;
            }
        });

        // 4. Save the final score into the scores table
        await connection.execute(
            'INSERT INTO scores (student_id, score, total_questions) VALUES (?, ?, ?)',
            [student_id, score, total_questions]
        );

        // 5. Send results back to the student frontend
        res.status(200).json({ 
            message: 'Exam submitted successfully', 
            score: score,
            total: total_questions 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while submitting exam' });
    } finally {
        if (connection) connection.release();
    }
};
