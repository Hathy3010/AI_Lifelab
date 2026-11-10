-- Bind parameters via the driver. User IDs come from authenticated identity.
-- QUERY student_assignments
-- $1 = student UUID
SELECT a.id,a.scenario_id,a.instructions,a.objectives,a.due_at,
 c.name AS class_name,s.id AS session_id,s.status,s.completed_at
FROM lifelab.assignment_recipients ar
JOIN lifelab.assignments a ON a.id=ar.assignment_id
JOIN lifelab.classes c ON c.id=a.class_id
LEFT JOIN lifelab.sessions s ON s.assignment_id=ar.assignment_id AND s.student_id=ar.student_id
WHERE ar.student_id=$1 ORDER BY a.created_at DESC;

-- QUERY student_attempts
-- $1 = session UUID; $2 = student UUID
SELECT a.id,a.attempt_number,a.source,a.cv_version,a.input_json,a.result_json,a.created_at,
 p.predicted_outcome,p.explanation AS prediction_explanation
FROM lifelab.attempts a JOIN lifelab.sessions s ON s.id=a.session_id
LEFT JOIN lifelab.predictions p ON p.id=a.prediction_id AND p.session_id=a.session_id
WHERE a.session_id=$1 AND s.student_id=$2 ORDER BY a.attempt_number;

-- QUERY student_coach_history
-- $1 = session UUID; $2 = student UUID
SELECT ct.id,ct.status,ct.mode,ct.question,ct.answer,ct.followup_question,
 ct.fallback,ct.ui_action,ct.highlight_object_id,ct.created_at,
 coalesce(jsonb_agg(src.attempt_id ORDER BY src.source_order)
 FILTER (WHERE src.attempt_id IS NOT NULL),'[]'::jsonb) AS source_ids
FROM lifelab.coach_turns ct JOIN lifelab.sessions s ON s.id=ct.session_id
LEFT JOIN lifelab.coach_turn_sources src ON src.coach_turn_id=ct.id AND src.session_id=ct.session_id
WHERE ct.session_id=$1 AND s.student_id=$2 GROUP BY ct.id ORDER BY ct.created_at,ct.id;

-- QUERY teacher_assignment_progress
-- $1 = assignment UUID; $2 = teacher UUID
SELECT u.id AS student_id,u.display_name,s.id AS session_id,
 coalesce(s.status,'NOT_STARTED') AS status,s.saved_at,s.completed_at
FROM lifelab.assignments a JOIN lifelab.classes c ON c.id=a.class_id
JOIN lifelab.assignment_recipients ar ON ar.assignment_id=a.id
JOIN lifelab.users u ON u.id=ar.student_id
LEFT JOIN lifelab.sessions s ON s.assignment_id=ar.assignment_id AND s.student_id=ar.student_id
WHERE a.id=$1 AND c.teacher_id=$2 ORDER BY u.display_name,u.id;
