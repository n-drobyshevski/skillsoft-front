-- ==========================================
-- E2E Test Data Seed Script
-- ==========================================
-- This script seeds the database with stable test data for E2E testing.
-- Run with: psql -h localhost -U postgres -d skillsoft_e2e_test -f seed-e2e-data.sql

-- ==========================================
-- Clean up existing test data (if any)
-- ==========================================
DELETE FROM "TestAnswer" WHERE "testSession" IN (SELECT id FROM "TestSession" WHERE "clerkUserId" LIKE 'user_e2e_%');
DELETE FROM "TestSession" WHERE "clerkUserId" LIKE 'user_e2e_%';
DELETE FROM "AssessmentQuestion" WHERE "behavioralIndicator" IN (SELECT id FROM "BehavioralIndicator" WHERE title LIKE '%E2E%');
DELETE FROM "BehavioralIndicator" WHERE title LIKE '%E2E%';
DELETE FROM "Competency" WHERE name LIKE '%E2E%';
DELETE FROM "User" WHERE email LIKE '%e2e%';

-- ==========================================
-- Create E2E Test Users
-- ==========================================
-- These users are synchronized with Clerk test accounts
-- Make sure to create these users in Clerk dashboard first

-- Admin user - full access
INSERT INTO "User" (id, "clerkId", email, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'e2e-admin-user-id-00001',
  'user_e2e_admin_clerk_id',
  'admin.e2e@skillsoft.test',
  'Admin',
  'E2E Test',
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "clerkId" = EXCLUDED."clerkId",
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Editor user - can manage competencies
INSERT INTO "User" (id, "clerkId", email, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'e2e-editor-user-id-0001',
  'user_e2e_editor_clerk_id',
  'editor.e2e@skillsoft.test',
  'Editor',
  'E2E Test',
  'EDITOR',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "clerkId" = EXCLUDED."clerkId",
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Regular user - can take tests
INSERT INTO "User" (id, "clerkId", email, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'e2e-user-user-id-000001',
  'user_e2e_user_clerk_id',
  'user.e2e@skillsoft.test',
  'User',
  'E2E Test',
  'USER',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  "clerkId" = EXCLUDED."clerkId",
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- ==========================================
-- Create Base E2E Test Competencies
-- ==========================================
-- These competencies have stable IDs for predictable testing

-- Communication Competency (English)
INSERT INTO "Competency" (
  id, name, description, category, "proficiencyLevel", "approvalStatus",
  version, "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-comp-communication',
  'Communication Skills E2E',
  'Ability to effectively convey information and ideas through various channels. This competency includes active listening, clear articulation, and adapting communication style to audience needs.',
  'INTERPERSONAL',
  'PROFICIENT',
  'APPROVED',
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Problem Solving Competency (English)
INSERT INTO "Competency" (
  id, name, description, category, "proficiencyLevel", "approvalStatus",
  version, "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-comp-problem-solving',
  'Problem Solving E2E',
  'Capability to identify, analyze, and resolve complex problems systematically. Includes critical thinking, root cause analysis, and implementing effective solutions.',
  'COGNITIVE',
  'ADVANCED',
  'APPROVED',
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Teamwork Competency (Russian content test)
INSERT INTO "Competency" (
  id, name, description, category, "proficiencyLevel", "approvalStatus",
  version, "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-comp-teamwork-ru',
  'Командная работа E2E',
  'Способность эффективно работать в команде, сотрудничать с коллегами, делиться знаниями и поддерживать общие цели. Включает навыки коммуникации, координации и взаимопомощи.',
  'INTERPERSONAL',
  'PROFICIENT',
  'APPROVED',
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Draft Competency (for testing approval workflow)
INSERT INTO "Competency" (
  id, name, description, category, "proficiencyLevel", "approvalStatus",
  version, "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-comp-draft-test',
  'Draft Competency E2E',
  'This is a draft competency used for testing the approval workflow. It should not be available for assessments.',
  'SELF_MANAGEMENT',
  'BASIC',
  'DRAFT',
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Create Behavioral Indicators
-- ==========================================

-- Indicators for Communication Skills
INSERT INTO "BehavioralIndicator" (
  id, title, description, competency, weight, "orderIndex",
  "observabilityLevel", "measurementType", examples, "counterExamples",
  "isActive", "approvalStatus", "createdAt", "updatedAt"
)
VALUES (
  'e2e-indicator-active-listening',
  'Active Listening E2E',
  'Demonstrates focused attention and understanding during conversations',
  'e2e-comp-communication',
  0.5,
  1,
  'DIRECTLY_OBSERVABLE',
  'FREQUENCY',
  'Maintains eye contact, asks clarifying questions, paraphrases to confirm understanding',
  'Interrupts frequently, checks phone during conversation, gives generic responses',
  true,
  'APPROVED',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "BehavioralIndicator" (
  id, title, description, competency, weight, "orderIndex",
  "observabilityLevel", "measurementType", examples, "counterExamples",
  "isActive", "approvalStatus", "createdAt", "updatedAt"
)
VALUES (
  'e2e-indicator-clear-articulation',
  'Clear Articulation E2E',
  'Expresses ideas clearly and concisely',
  'e2e-comp-communication',
  0.5,
  2,
  'DIRECTLY_OBSERVABLE',
  'QUALITY',
  'Uses simple language, structures messages logically, confirms understanding',
  'Uses jargon excessively, rambles, leaves messages incomplete',
  true,
  'APPROVED',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Indicators for Problem Solving
INSERT INTO "BehavioralIndicator" (
  id, title, description, competency, weight, "orderIndex",
  "observabilityLevel", "measurementType", examples, "counterExamples",
  "isActive", "approvalStatus", "createdAt", "updatedAt"
)
VALUES (
  'e2e-indicator-root-cause',
  'Root Cause Analysis E2E',
  'Identifies underlying causes of problems rather than symptoms',
  'e2e-comp-problem-solving',
  0.6,
  1,
  'DIRECTLY_OBSERVABLE',
  'QUALITY',
  'Asks "why" multiple times, uses fishbone diagrams, validates assumptions',
  'Jumps to solutions, fixes symptoms only, makes assumptions without verification',
  true,
  'APPROVED',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "BehavioralIndicator" (
  id, title, description, competency, weight, "orderIndex",
  "observabilityLevel", "measurementType", examples, "counterExamples",
  "isActive", "approvalStatus", "createdAt", "updatedAt"
)
VALUES (
  'e2e-indicator-solution-impl',
  'Solution Implementation E2E',
  'Effectively implements and monitors solutions',
  'e2e-comp-problem-solving',
  0.4,
  2,
  'DIRECTLY_OBSERVABLE',
  'QUALITY',
  'Creates action plans, sets milestones, tracks progress, adjusts as needed',
  'Implements without planning, ignores feedback, abandons difficult solutions',
  true,
  'APPROVED',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Create Assessment Questions
-- ==========================================

-- Likert Scale Question for Active Listening
INSERT INTO "AssessmentQuestion" (
  id, "questionText", "questionType", "behavioralIndicator",
  "answerOptions", "scoringRubric", "difficultyLevel", "timeLimit",
  "discriminationIndex", "orderIndex", "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-question-listening-freq',
  'How often do you maintain eye contact and give verbal cues (nodding, "I see") during conversations with colleagues?',
  'LIKERT_SCALE',
  'e2e-indicator-active-listening',
  '[{"label": "Never", "value": 1}, {"label": "Rarely", "value": 2}, {"label": "Sometimes", "value": 3}, {"label": "Often", "value": 4}, {"label": "Always", "value": 5}]'::jsonb,
  'Higher scores indicate better active listening practices',
  'INTERMEDIATE',
  30,
  0.45,
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Multiple Choice Question for Clear Articulation
INSERT INTO "AssessmentQuestion" (
  id, "questionText", "questionType", "behavioralIndicator",
  "answerOptions", "scoringRubric", "difficultyLevel", "timeLimit",
  "discriminationIndex", "orderIndex", "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-question-articulation-mcq',
  'When explaining a complex technical concept to a non-technical colleague, what is the BEST approach?',
  'MCQ',
  'e2e-indicator-clear-articulation',
  '[{"text": "Use as much technical terminology as possible to be precise", "score": 1, "correct": false}, {"text": "Use analogies and simple language, checking for understanding", "score": 5, "correct": true}, {"text": "Skip the explanation and just do it yourself", "score": 0, "correct": false}, {"text": "Send a detailed email with all technical specifications", "score": 2, "correct": false}]'::jsonb,
  'Select the approach that best demonstrates clear articulation',
  'INTERMEDIATE',
  60,
  0.52,
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Situational Judgment Test for Root Cause Analysis
INSERT INTO "AssessmentQuestion" (
  id, "questionText", "questionType", "behavioralIndicator",
  "answerOptions", "scoringRubric", "difficultyLevel", "timeLimit",
  "discriminationIndex", "orderIndex", "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-question-rootcause-sjt',
  'Your team''s project deliveries have been consistently late for the past three sprints. As the team lead, what would you do FIRST?',
  'SJT',
  'e2e-indicator-root-cause',
  '[{"text": "Extend the deadlines for future sprints", "effectiveness": 2}, {"text": "Analyze sprint retrospectives and task completion data to identify patterns", "effectiveness": 5}, {"text": "Add more team members to increase capacity", "effectiveness": 1}, {"text": "Implement stricter deadline enforcement with consequences", "effectiveness": 2}]'::jsonb,
  'Select the most effective approach for identifying root causes',
  'ADVANCED',
  180,
  0.61,
  1,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Russian content question
INSERT INTO "AssessmentQuestion" (
  id, "questionText", "questionType", "behavioralIndicator",
  "answerOptions", "scoringRubric", "difficultyLevel", "timeLimit",
  "discriminationIndex", "orderIndex", "isActive", "createdAt", "updatedAt"
)
VALUES (
  'e2e-question-listening-ru',
  'Как часто вы активно демонстрируете внимание к собеседнику (кивая, задавая уточняющие вопросы)?',
  'LIKERT_SCALE',
  'e2e-indicator-active-listening',
  '[{"label": "Никогда", "value": 1}, {"label": "Редко", "value": 2}, {"label": "Иногда", "value": 3}, {"label": "Часто", "value": 4}, {"label": "Всегда", "value": 5}]'::jsonb,
  'Более высокие оценки указывают на лучшие навыки активного слушания',
  'BASIC',
  30,
  0.42,
  2,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Verify seed data
-- ==========================================
SELECT 'Users created:' AS status, COUNT(*) AS count FROM "User" WHERE email LIKE '%e2e%';
SELECT 'Competencies created:' AS status, COUNT(*) AS count FROM "Competency" WHERE name LIKE '%E2E%';
SELECT 'Indicators created:' AS status, COUNT(*) AS count FROM "BehavioralIndicator" WHERE title LIKE '%E2E%';
SELECT 'Questions created:' AS status, COUNT(*) AS count FROM "AssessmentQuestion" WHERE id LIKE 'e2e-%';
