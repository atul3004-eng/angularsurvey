-- Oracle 11g schema for the survey application
-- Uses sequences + before insert triggers instead of identity columns

-- Optional cleanup section
-- Uncomment if you want to recreate the schema from scratch.
--
-- DROP TABLE answers CASCADE CONSTRAINTS;
-- DROP TABLE question_options CASCADE CONSTRAINTS;
-- DROP TABLE respondants CASCADE CONSTRAINTS;
-- DROP TABLE questions CASCADE CONSTRAINTS;
-- DROP TABLE survey_headers CASCADE CONSTRAINTS;
-- DROP TABLE input_types CASCADE CONSTRAINTS;
-- DROP TABLE admin CASCADE CONSTRAINTS;
--
-- DROP SEQUENCE seq_admin;
-- DROP SEQUENCE seq_input_types;
-- DROP SEQUENCE seq_survey_headers;
-- DROP SEQUENCE seq_questions;
-- DROP SEQUENCE seq_question_options;
-- DROP SEQUENCE seq_respondants;
-- DROP SEQUENCE seq_answers;
--
-- DROP TRIGGER trg_admin_bi;
-- DROP TRIGGER trg_input_types_bi;
-- DROP TRIGGER trg_survey_headers_bi;
-- DROP TRIGGER trg_questions_bi;
-- DROP TRIGGER trg_question_options_bi;
-- DROP TRIGGER trg_respondants_bi;
-- DROP TRIGGER trg_answers_bi;

CREATE TABLE admin (
    id NUMBER(19) PRIMARY KEY,
    email VARCHAR2(255 CHAR),
    first_name VARCHAR2(255 CHAR),
    last_name VARCHAR2(255 CHAR),
    password VARCHAR2(255 CHAR),
    primary_admin NUMBER(5)
);

CREATE TABLE input_types (
    id NUMBER(19) PRIMARY KEY,
    input_type VARCHAR2(255 CHAR)
);

CREATE TABLE survey_headers (
    id NUMBER(19) PRIMARY KEY,
    survey_name VARCHAR2(255 CHAR),
    creation_date TIMESTAMP,
    valid_till TIMESTAMP,
    description VARCHAR2(255 CHAR)
);

CREATE TABLE questions (
    id NUMBER(19) PRIMARY KEY,
    question_name VARCHAR2(255 CHAR),
    validation VARCHAR2(255 CHAR),
    input_type_id NUMBER(19),
    survey_id NUMBER(19),
    CONSTRAINT fk_q_input_type
        FOREIGN KEY (input_type_id) REFERENCES input_types(id),
    CONSTRAINT fk_q_survey
        FOREIGN KEY (survey_id) REFERENCES survey_headers(id)
);

CREATE TABLE question_options (
    id NUMBER(19) PRIMARY KEY,
    questionId NUMBER(19),
    option_name VARCHAR2(255 CHAR),
    CONSTRAINT fk_qo_question
        FOREIGN KEY (questionId) REFERENCES questions(id)
);

CREATE TABLE respondants (
    id NUMBER(19) PRIMARY KEY,
    email VARCHAR2(255 CHAR),
    full_name VARCHAR2(255 CHAR),
    taken_on TIMESTAMP,
    survey_id NUMBER(19),
    CONSTRAINT fk_r_survey
        FOREIGN KEY (survey_id) REFERENCES survey_headers(id)
);

CREATE TABLE answers (
    id NUMBER(19) PRIMARY KEY,
    questionId NUMBER(19),
    questionOptionsId NUMBER(19),
    answer_text VARCHAR2(1000 CHAR),
    respondant_id NUMBER(19),
    selected_options VARCHAR2(1000 CHAR),
    CONSTRAINT fk_a_question
        FOREIGN KEY (questionId) REFERENCES questions(id),
    CONSTRAINT fk_a_option
        FOREIGN KEY (questionOptionsId) REFERENCES question_options(id),
    CONSTRAINT fk_a_respondant
        FOREIGN KEY (respondant_id) REFERENCES respondants(id)
);

CREATE INDEX idx_q_survey ON questions (survey_id);
CREATE INDEX idx_q_input_type ON questions (input_type_id);
CREATE INDEX idx_qo_question ON question_options (questionId);
CREATE INDEX idx_r_survey ON respondants (survey_id);
CREATE INDEX idx_a_question ON answers (questionId);
CREATE INDEX idx_a_option ON answers (questionOptionsId);
CREATE INDEX idx_a_respondant ON answers (respondant_id);

CREATE SEQUENCE seq_admin START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_input_types START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_survey_headers START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_questions START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_question_options START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_respondants START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_answers START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER trg_admin_bi
BEFORE INSERT ON admin
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_admin.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_input_types_bi
BEFORE INSERT ON input_types
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_input_types.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_survey_headers_bi
BEFORE INSERT ON survey_headers
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_survey_headers.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_questions_bi
BEFORE INSERT ON questions
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_questions.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_question_options_bi
BEFORE INSERT ON question_options
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_question_options.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_respondants_bi
BEFORE INSERT ON respondants
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_respondants.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_answers_bi
BEFORE INSERT ON answers
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_answers.NEXTVAL INTO :NEW.id FROM dual;
END;
/

-- Optional seed data
INSERT INTO input_types (input_type) VALUES ('radio');
INSERT INTO input_types (input_type) VALUES ('checkbox_multiselect');
INSERT INTO input_types (input_type) VALUES ('oneline');
INSERT INTO input_types (input_type) VALUES ('multiline');

INSERT INTO admin (email, first_name, last_name, password, primary_admin)
VALUES ('m@m.com', 'mahendra', 'bishnoi', 'password', 1);

COMMIT;
