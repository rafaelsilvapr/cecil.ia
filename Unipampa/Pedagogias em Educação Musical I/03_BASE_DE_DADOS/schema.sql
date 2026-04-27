PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    matricula TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL DEFAULT 'NA',
    curso_codigo TEXT NOT NULL DEFAULT 'BAMU',
    turma_codigo TEXT NOT NULL DEFAULT 'MU11',
    situacao TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS assessments (
    assessment_id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    peso REAL NOT NULL,
    max_score REAL NOT NULL DEFAULT 10,
    ano_periodo TEXT NOT NULL DEFAULT '2026/1',
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    question_id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    theme TEXT NOT NULL,
    prompt TEXT,
    expected_focus TEXT,
    question_type TEXT NOT NULL DEFAULT 'objective',
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id)
);

CREATE TABLE IF NOT EXISTS answer_key (
    assessment_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    correct_option TEXT,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'to_review',
    PRIMARY KEY (assessment_id, question_number),
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id)
);

CREATE TABLE IF NOT EXISTS student_answers (
    student_answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    marked_option TEXT,
    raw_response TEXT,
    score REAL,
    is_correct INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id),
    FOREIGN KEY (student_id) REFERENCES students (student_id)
);

CREATE TABLE IF NOT EXISTS grades (
    grade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    assessment_id TEXT NOT NULL,
    component_name TEXT NOT NULL,
    score REAL NOT NULL DEFAULT 0,
    max_score REAL NOT NULL DEFAULT 10,
    weight REAL NOT NULL DEFAULT 1,
    weighted_score REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (student_id),
    FOREIGN KEY (assessment_id) REFERENCES assessments (assessment_id)
);

CREATE VIEW IF NOT EXISTS final_grade_summary AS
SELECT
    s.student_id,
    s.matricula,
    s.nome,
    ROUND(SUM(g.weighted_score) / NULLIF(SUM(g.weight), 0), 2) AS media_ponderada
FROM students s
LEFT JOIN grades g ON g.student_id = s.student_id
GROUP BY s.student_id, s.matricula, s.nome;
