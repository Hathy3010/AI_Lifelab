-- AI LifeLab MVP / design DDL. Reviewed as a design artifact, not run on a database.
-- UUIDs and password hashes are supplied by the application; no extension required.
BEGIN;
CREATE SCHEMA IF NOT EXISTS lifelab;
SET search_path TO lifelab, public;

CREATE TABLE users (
  id uuid PRIMARY KEY,
  username varchar(100) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name varchar(100) NOT NULL CHECK (length(btrim(display_name)) > 0),
  role text NOT NULL CHECK (role IN ('STUDENT','TEACHER')),
  grade smallint,
  learning_goal text CHECK (learning_goal IN ('EV-01','EV-02','EV-03')),
  auth_epoch integer NOT NULL DEFAULT 0 CHECK (auth_epoch >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role='STUDENT' AND grade IN (8,9) AND grade IS NOT NULL)
      OR (role='TEACHER' AND grade IS NULL))
);

CREATE TABLE classes (
  id uuid PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES users(id),
  name varchar(100) NOT NULL CHECK (length(btrim(name)) > 0),
  grade smallint NOT NULL CHECK (grade IN (8,9)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id,teacher_id)
);

CREATE TABLE enrollments (
  class_id uuid NOT NULL REFERENCES classes(id),
  student_id uuid NOT NULL REFERENCES users(id),
  active boolean NOT NULL DEFAULT true,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id,student_id)
);

CREATE TABLE assignments (
  id uuid PRIMARY KEY,
  class_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  client_request_id uuid NOT NULL,
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  scenario_id varchar(3) NOT NULL CHECK (scenario_id IN ('8.1','8.2','8.3','9.1','9.2','9.3')),
  content_version varchar(30) NOT NULL,
  rules_version varchar(30) NOT NULL,
  dataset_version varchar(30) NOT NULL,
  config_hash char(64) NOT NULL CHECK (config_hash ~ '^[0-9a-f]{64}$'),
  instructions text NOT NULL CHECK (length(btrim(instructions)) BETWEEN 1 AND 2000),
  due_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (class_id,teacher_id) REFERENCES classes(id,teacher_id),
  UNIQUE (teacher_id,client_request_id),
  UNIQUE (id,class_id),
  UNIQUE (id,scenario_id,content_version,rules_version,dataset_version,config_hash)
);

-- Snapshot: one row per learner at assignment creation. Keep rows if class changes later.
CREATE TABLE assignment_recipients (
  assignment_id uuid NOT NULL,
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (assignment_id,student_id),
  FOREIGN KEY (assignment_id,class_id) REFERENCES assignments(id,class_id),
  FOREIGN KEY (class_id,student_id) REFERENCES enrollments(class_id,student_id)
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES users(id),
  assignment_id uuid,
  client_request_id uuid NOT NULL,
  start_request_hash char(64) NOT NULL CHECK (start_request_hash ~ '^[0-9a-f]{64}$'),
  scenario_id varchar(3) NOT NULL CHECK (scenario_id IN ('8.1','8.2','8.3','9.1','9.2','9.3')),
  content_version varchar(30) NOT NULL,
  rules_version varchar(30) NOT NULL,
  dataset_version varchar(30) NOT NULL,
  config_hash char(64) NOT NULL CHECK (config_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','REFLECTION','COMPLETED')),
  draft_json jsonb NOT NULL DEFAULT '{"input":{},"reflection_answer":""}' CHECK (jsonb_typeof(draft_json)='object'),
  draft_revision integer NOT NULL DEFAULT 0 CHECK (draft_revision >= 0),
  next_attempt_number integer NOT NULL DEFAULT 1 CHECK (next_attempt_number > 0),
  event_applied boolean NOT NULL DEFAULT false,
  event_applied_at timestamptz,
  complete_request_id uuid,
  completion_request_hash char(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  saved_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (student_id,client_request_id),
  FOREIGN KEY (assignment_id,student_id) REFERENCES assignment_recipients(assignment_id,student_id),
  FOREIGN KEY (assignment_id,scenario_id,content_version,rules_version,dataset_version,config_hash)
    REFERENCES assignments(id,scenario_id,content_version,rules_version,dataset_version,config_hash),
  CHECK (NOT event_applied OR scenario_id IN ('8.3','9.2')),
  CHECK (event_applied = (event_applied_at IS NOT NULL)),
  CHECK ((status='COMPLETED' AND completed_at IS NOT NULL AND complete_request_id IS NOT NULL AND completion_request_hash IS NOT NULL)
      OR (status<>'COMPLETED' AND completed_at IS NULL AND complete_request_id IS NULL AND completion_request_hash IS NULL)),
  CHECK (completion_request_hash IS NULL OR completion_request_hash ~ '^[0-9a-f]{64}$')
);
CREATE UNIQUE INDEX sessions_one_assigned ON sessions(assignment_id,student_id) WHERE assignment_id IS NOT NULL;

CREATE TABLE attempts (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions(id),
  client_request_id uuid NOT NULL,
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  source text NOT NULL CHECK (source IN ('mouse','keyboard','gesture')),
  phase text NOT NULL CHECK (phase IN ('BASELINE','AFTER_EVENT')),
  input_json jsonb NOT NULL CHECK (jsonb_typeof(input_json)='object'),
  result_json jsonb NOT NULL CHECK (jsonb_typeof(result_json)='object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id,client_request_id),
  UNIQUE (session_id,attempt_number),
  UNIQUE (id,session_id)
);

CREATE TABLE reflections (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL UNIQUE REFERENCES sessions(id),
  selected_attempt_id uuid NOT NULL,
  answer text NOT NULL CHECK (length(btrim(answer)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (selected_attempt_id,session_id) REFERENCES attempts(id,session_id),
  UNIQUE (id,session_id)
);

CREATE TABLE evidence (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions(id),
  criterion_id text NOT NULL CHECK (criterion_id IN ('EV-01','EV-02','EV-03')),
  attempt_id uuid NOT NULL,
  comparison_attempt_id uuid,
  reflection_id uuid NOT NULL,
  observation_json jsonb NOT NULL CHECK (jsonb_typeof(observation_json)='object'),
  ai_assessment jsonb CHECK (ai_assessment IS NULL OR jsonb_typeof(ai_assessment)='object'),
  feedback_context_hash char(64),
  prompt_version varchar(30),
  model_id varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  ai_created_at timestamptz,
  UNIQUE (session_id,criterion_id),
  FOREIGN KEY (attempt_id,session_id) REFERENCES attempts(id,session_id),
  FOREIGN KEY (comparison_attempt_id,session_id) REFERENCES attempts(id,session_id),
  FOREIGN KEY (reflection_id,session_id) REFERENCES reflections(id,session_id),
  CHECK (comparison_attempt_id IS NULL OR comparison_attempt_id<>attempt_id),
  CHECK (feedback_context_hash IS NULL OR feedback_context_hash ~ '^[0-9a-f]{64}$')
);

CREATE TABLE teacher_reviews (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions(id),
  teacher_id uuid NOT NULL REFERENCES users(id),
  client_request_id uuid NOT NULL,
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  comment text NOT NULL CHECK (length(btrim(comment)) BETWEEN 1 AND 2000),
  assessments_json jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(assessments_json)='array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id,client_request_id)
);

CREATE INDEX assignments_class_due ON assignments(class_id,due_at);
CREATE INDEX sessions_student_progress ON sessions(student_id,status,created_at);
CREATE INDEX recipients_student ON assignment_recipients(student_id,assignment_id);
CREATE INDEX reviews_session_time ON teacher_reviews(session_id,created_at);

-- Final attempts and learner reflections are immutable under ordinary application use.
CREATE FUNCTION reject_final_record_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'immutable_learning_record' USING ERRCODE='23514';
END;
$$;
CREATE TRIGGER attempts_immutable BEFORE UPDATE OR DELETE ON attempts
  FOR EACH ROW EXECUTE FUNCTION reject_final_record_change();
CREATE TRIGGER reflections_immutable BEFORE UPDATE OR DELETE ON reflections
  FOR EACH ROW EXECUTE FUNCTION reject_final_record_change();

-- Cross-table role/grade/ownership checks and completion rules belong to the backend transaction.
-- Do not implement them as CHECKs containing SELECTs from other tables.
COMMIT;
