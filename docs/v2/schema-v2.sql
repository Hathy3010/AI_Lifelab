-- AI LifeLab FULL PROJECT / 13 tables / 2026-11-05.
-- Authoritative fresh-install design. NOT a seven-table core or an ALTER migration.
-- UUIDs and password hashes are supplied by the application; no extension required.
BEGIN;
CREATE SCHEMA lifelab;
SET LOCAL search_path TO lifelab, public;

CREATE TABLE users (
 id uuid PRIMARY KEY,
 username varchar(50) NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9][a-z0-9._-]{2,49}$'),
 password_hash text NOT NULL CHECK (length(password_hash)>0),
 display_name varchar(100) NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 100),
 role text NOT NULL CHECK (role IN ('STUDENT','TEACHER')),
 school_code varchar(40),
 student_code varchar(60),
 grade smallint,
 learning_goal text CHECK (learning_goal IN ('EV-01','EV-02','EV-03')),
 auth_epoch integer NOT NULL DEFAULT 0 CHECK (auth_epoch >= 0),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (school_code,student_code),
 CHECK ((role='STUDENT' AND school_code IS NOT NULL AND student_code IS NOT NULL
     AND length(btrim(school_code))>0 AND length(btrim(student_code))>0
     AND grade IS NOT NULL AND grade IN (8,9))
   OR (role='TEACHER' AND grade IS NULL AND student_code IS NULL))
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
  config_snapshot jsonb NOT NULL CHECK (jsonb_typeof(config_snapshot)='object'),
  instructions text NOT NULL CHECK (length(btrim(instructions)) BETWEEN 1 AND 2000),
  objectives text NOT NULL DEFAULT '' CHECK (length(objectives)<=2000),
  rubric_json jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(rubric_json)='array'),
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
  config_snapshot jsonb NOT NULL CHECK (jsonb_typeof(config_snapshot)='object'),
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
CREATE UNIQUE INDEX sessions_one_active_self_study ON sessions(student_id,scenario_id)
  WHERE assignment_id IS NULL AND status IN ('IN_PROGRESS','REFLECTION');
CREATE UNIQUE INDEX sessions_one_assigned ON sessions(assignment_id,student_id) WHERE assignment_id IS NOT NULL;

CREATE TABLE attempts (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions(id),
  client_request_id uuid NOT NULL,
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  source text NOT NULL CHECK (source IN ('pointer','keyboard','gesture')),
  cv_version varchar(60),
  CHECK (source<>'gesture' OR cv_version IS NOT NULL),
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
-- Predictions are persisted for the balance exercise; other scenarios may omit them.
CREATE TABLE predictions (
 id uuid PRIMARY KEY,
 session_id uuid NOT NULL REFERENCES sessions(id),
 client_request_id uuid NOT NULL,
 request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
 draft_revision integer NOT NULL CHECK (draft_revision >= 0),
 placements_json jsonb NOT NULL CHECK (jsonb_typeof(placements_json)='array'),
 plan_hash char(64) NOT NULL CHECK (plan_hash ~ '^[0-9a-f]{64}$'),
 predicted_outcome text NOT NULL CHECK (predicted_outcome IN ('LEFT_DOWN','RIGHT_DOWN','BALANCED')),
 explanation text NOT NULL CHECK (length(btrim(explanation)) BETWEEN 1 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (id,session_id), UNIQUE(session_id,client_request_id)
);
ALTER TABLE attempts ADD COLUMN prediction_id uuid UNIQUE;
ALTER TABLE attempts ADD CONSTRAINT attempt_prediction_same_session
 FOREIGN KEY (prediction_id,session_id) REFERENCES predictions(id,session_id);
CREATE TRIGGER predictions_immutable BEFORE UPDATE OR DELETE ON predictions
 FOR EACH ROW EXECUTE FUNCTION reject_final_record_change();

CREATE TABLE coach_turns (
 id uuid PRIMARY KEY,
 session_id uuid NOT NULL REFERENCES sessions(id),
 client_request_id uuid NOT NULL,
 request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
 mode text NOT NULL CHECK (mode IN ('PREDICT','HINT','EXPLAIN','COMPARE','REFLECT')),
 hint_level smallint NOT NULL CHECK (hint_level BETWEEN 1 AND 3),
 question text NOT NULL CHECK (length(btrim(question)) BETWEEN 1 AND 2000),
 focused_object_id text CHECK (focused_object_id IN ('A','B')),
 context_snapshot jsonb NOT NULL CHECK (jsonb_typeof(context_snapshot)='object'),
 context_hash char(64) NOT NULL CHECK (context_hash ~ '^[0-9a-f]{64}$'),
 prompt_version varchar(60) NOT NULL,
 status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','READY')),
 generation integer NOT NULL DEFAULT 1 CHECK (generation > 0),
 lease_until timestamptz,
 answer text CHECK (answer IS NULL OR length(btrim(answer)) BETWEEN 1 AND 1000),
 followup_question text CHECK (followup_question IS NULL OR length(followup_question) <= 400),
 ui_action text CHECK (ui_action IN ('NONE','HIGHLIGHT_OBJECT')),
 highlight_object_id text CHECK (highlight_object_id IN ('A','B')),
 model_id varchar(100),
 fallback boolean,
 fallback_reason varchar(100),
 created_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz,
 UNIQUE (session_id,client_request_id),
 UNIQUE (id,session_id),
 CHECK ((status='PENDING' AND lease_until IS NOT NULL AND finished_at IS NULL AND answer IS NULL
     AND followup_question IS NULL AND ui_action IS NULL AND highlight_object_id IS NULL
     AND fallback IS NULL AND model_id IS NULL AND fallback_reason IS NULL)
   OR (status='READY' AND lease_until IS NULL AND finished_at IS NOT NULL AND answer IS NOT NULL
     AND followup_question IS NOT NULL AND ui_action IS NOT NULL AND fallback IS NOT NULL
     AND ((ui_action='NONE' AND highlight_object_id IS NULL)
       OR (ui_action='HIGHLIGHT_OBJECT' AND highlight_object_id IS NOT NULL))
     AND ((fallback AND fallback_reason IS NOT NULL)
       OR (NOT fallback AND model_id IS NOT NULL AND fallback_reason IS NULL))))
);
CREATE INDEX coach_session_time ON coach_turns(session_id,created_at);

-- Normalize source IDs so PostgreSQL can enforce "same session".
CREATE TABLE coach_turn_sources (
 coach_turn_id uuid NOT NULL,
 attempt_id uuid NOT NULL,
 session_id uuid NOT NULL,
 source_order smallint NOT NULL CHECK (source_order BETWEEN 1 AND 4),
 PRIMARY KEY (coach_turn_id,attempt_id),
 UNIQUE (coach_turn_id,source_order),
 FOREIGN KEY (coach_turn_id,session_id) REFERENCES coach_turns(id,session_id),
 FOREIGN KEY (attempt_id,session_id) REFERENCES attempts(id,session_id)
);
CREATE INDEX coach_sources_attempt ON coach_turn_sources(attempt_id);

CREATE TRIGGER coach_sources_immutable BEFORE UPDATE OR DELETE ON coach_turn_sources
 FOR EACH ROW EXECUTE FUNCTION reject_final_record_change();

CREATE FUNCTION source_requires_pending_turn() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE turn_status text;
BEGIN
 SELECT status INTO turn_status FROM lifelab.coach_turns
 WHERE id=NEW.coach_turn_id AND session_id=NEW.session_id FOR UPDATE;
 IF turn_status='READY' THEN
  RAISE EXCEPTION 'Cannot add sources to a finished Coach turn' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER coach_sources_pending BEFORE INSERT ON coach_turn_sources
 FOR EACH ROW EXECUTE FUNCTION source_requires_pending_turn();

CREATE FUNCTION guard_coach_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status='READY' THEN
  RAISE EXCEPTION 'Finished Coach turns are immutable' USING ERRCODE='23514';
 END IF;
 IF (NEW.id,NEW.session_id,NEW.client_request_id,NEW.request_hash,NEW.mode,
     NEW.hint_level,NEW.question,NEW.focused_object_id,NEW.context_snapshot,
     NEW.context_hash,NEW.prompt_version,NEW.created_at)
 IS DISTINCT FROM
    (OLD.id,OLD.session_id,OLD.client_request_id,OLD.request_hash,OLD.mode,
     OLD.hint_level,OLD.question,OLD.focused_object_id,OLD.context_snapshot,
     OLD.context_hash,OLD.prompt_version,OLD.created_at) THEN
  RAISE EXCEPTION 'Coach request context cannot change' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER coach_request_guard BEFORE UPDATE ON coach_turns
 FOR EACH ROW EXECUTE FUNCTION guard_coach_update();
CREATE TRIGGER coach_no_delete BEFORE DELETE ON coach_turns
 FOR EACH ROW EXECUTE FUNCTION reject_final_record_change();


COMMIT;
