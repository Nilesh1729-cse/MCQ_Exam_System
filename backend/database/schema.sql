-- ============================================================
-- Exam System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS exam_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exam_system;

-- 1. Users Table (Handles Admins, Examiners, and Students)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin', 'examiner', 'student') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Questions Table (The Global Pool, max 10 enforced by server)
CREATE TABLE IF NOT EXISTS questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  examiner_id    INT NOT NULL,
  question_text  TEXT NOT NULL,
  option_a       VARCHAR(255) NOT NULL,
  option_b       VARCHAR(255) NOT NULL,
  option_c       VARCHAR(255) NOT NULL,
  option_d       VARCHAR(255) NOT NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_question_examiner
    FOREIGN KEY (examiner_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Scores Table (Digital Gradebook)
CREATE TABLE IF NOT EXISTS scores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  score           INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 10,
  submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_scores_student (student_id),
  CONSTRAINT fk_score_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
