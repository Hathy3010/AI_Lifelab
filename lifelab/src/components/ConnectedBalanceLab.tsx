import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Send, CheckCircle2 } from 'lucide-react';
import type { SceneAPI } from './BalanceScene';
import { Button } from './ui/button';
import { api } from '../lib/api';
import { useCamera } from '../lib/useCamera';
import type { Challenge, LabTopic } from '../lib/labCatalog';
import {
  OUTCOMES,
  type Attempt,
  type ChatMessage,
  type CoachMode,
  type ObjectId,
  type Outcome,
  type Source,
} from '../lib/types';

const BalanceScene = lazy(() =>
  import('./BalanceScene').then((module) => ({ default: module.BalanceScene })),
);
interface Props {
  topic: LabTopic;
  challenge: Challenge;
}
const modes: Record<CoachMode, string> = {
  PREDICT: 'Dự đoán',
  HINT: 'Gợi ý',
  EXPLAIN: 'Giải thích lượt gần nhất',
  COMPARE: 'So sánh hai lượt gần nhất',
  REFLECT: 'Phản tư',
};

export function ConnectedBalanceLab({ topic, challenge }: Props) {
  const storageKey = `lifelab-session-${challenge.id}`;
  const [session, setSession] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [value, setValue] = useState(challenge.initial);
  const [source, setSource] = useState<Source>('keyboard');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<Attempt['result'] | null>(null);
  const [outcome, setOutcome] = useState<Outcome>('BALANCED');
  const [explanation, setExplanation] = useState('');
  const [held, setHeld] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [mode, setMode] = useState<CoachMode>('HINT');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [highlight, setHighlight] = useState<ObjectId | null>(null);
  const [reflection, setReflection] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState('');
  const [completed, setCompleted] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const sceneRef = useRef<SceneAPI | null>(null);
  const pendingRun = useRef<{ key: string; id: string } | null>(null);
  const bSlot = challenge.id === 'tip' ? 1 : 2;
  const locked = busy || restoring || completed || !session;
  const camera = useCamera({
    enabled: cameraEnabled && !completed,
    sceneRef,
    onError: (text) => {
      setCameraError(text);
      setCameraEnabled(false);
    },
  });

  function remember(id: string) {
    try {
      sessionStorage.setItem(storageKey, id);
    } catch {
      setStorageWarning(
        'Trình duyệt không cho ghi phiên. Tải lại trang sẽ không tự khôi phục được.',
      );
    }
  }

  useEffect(() => {
    let cancelled = false;
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(storageKey);
    } catch {
      /* Session can still run without browser storage. */
    }
    if (!saved) {
      setRestoring(false);
      return;
    }
    api
      .read(saved)
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot.challenge_id !== challenge.id)
          throw new Error('Phiên không thuộc bài này. Hãy bắt đầu phiên mới.');
        setSession(snapshot.id);
        setAttempts(snapshot.attempts);
        setCompleted(snapshot.completed);
        setReflection(snapshot.reflection);
        setSelectedAttempt(snapshot.selected_attempt_id || snapshot.attempts.at(-1)?.id || '');
        const last = snapshot.attempts.at(-1);
        if (last) {
          setValue(last.placements.find((p) => p.object_id === 'A')!.slot);
          setResult(last.result);
          setOutcome(last.prediction.outcome);
          setExplanation(last.prediction.explanation);
          setSource(last.source);
        }
        setMessages(
          snapshot.turns.flatMap((turn, index) => [
            { id: `q-${index}`, role: 'student' as const, text: turn.question },
            { id: `a-${index}`, role: 'coach' as const, text: turn.answer, reply: turn.reply },
          ]),
        );
      })
      .catch((failure: Error) => {
        if (!cancelled)
          setError(`${failure.message} Nếu server đã khởi động lại, hãy tạo phiên mới.`);
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey, challenge.id]);

  async function start() {
    setBusy(true);
    setError('');
    setCameraEnabled(false);
    try {
      const created = await api.create(challenge.id);
      remember(created.id);
      setSession(created.id);
      setAttempts([]);
      setMessages([]);
      setCompleted(false);
      setValue(challenge.initial);
      setSource('keyboard');
      setResult(null);
      setReflection('');
      setSelectedAttempt('');
      setExplanation('');
      setQuestion('');
      setHighlight(null);
      setMessage('');
      pendingRun.current = null;
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function change(next: number, input: Source) {
    setValue(next);
    setSource(input);
    setResult(null);
    setMessage('');
    setHighlight(null);
  }

  async function run() {
    if (!session || locked || held) return;
    setBusy(true);
    setError('');
    const prediction = { outcome, explanation: explanation.trim() };
    const placements = [
      { object_id: 'A' as const, slot: value },
      { object_id: 'B' as const, slot: bSlot },
    ];
    const key = JSON.stringify({ placements, prediction, source });
    if (pendingRun.current?.key !== key) pendingRun.current = { key, id: crypto.randomUUID() };
    try {
      const attempt = await api.run(session, pendingRun.current.id, placements, prediction, source);
      setAttempts((old) => (old.some((item) => item.id === attempt.id) ? old : [...old, attempt]));
      setResult(attempt.result);
      setSelectedAttempt(attempt.id);
      pendingRun.current = null;
      setMessage(`Đã lưu lượt ${attempt.number} trên server.`);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    if (!session || locked || held) return;
    setBusy(true);
    setError('');
    const text = question.trim();
    const sources =
      mode === 'COMPARE'
        ? attempts.slice(-2)
        : mode === 'EXPLAIN' || mode === 'REFLECT'
          ? attempts.slice(-1)
          : [];
    try {
      const reply = await api.coach(
        session,
        crypto.randomUUID(),
        mode,
        text,
        sources.map((item) => item.id),
        2,
      );
      setMessages((old) => [
        ...old,
        { id: crypto.randomUUID(), role: 'student', text },
        { id: crypto.randomUUID(), role: 'coach', text: reply.message, reply },
      ]);
      setHighlight(
        reply.ui_action.type === 'HIGHLIGHT_OBJECT' ? (reply.ui_action.object_id ?? null) : null,
      );
      setQuestion('');
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!session || locked || held) return;
    setBusy(true);
    setError('');
    try {
      await api.complete(session, selectedAttempt, reflection.trim());
      setCompleted(true);
      setCameraEnabled(false);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const distinctPlans = new Set(attempts.map((attempt) => JSON.stringify(attempt.placements))).size;
  return (
    <>
      <div className="lab-intro">
        <p className="eyebrow">
          {topic.category} · LỚP {topic.grade}
        </p>
        <h1>{challenge.title}</h1>
        <p className="intro">{challenge.task}</p>
      </div>
      <section className="session-toolbar" aria-label="Phiên thực hành">
        <p role="status">
          {restoring
            ? 'Đang khôi phục phiên…'
            : completed
              ? 'Đã hoàn thành phiên'
              : session
                ? `Phiên đang mở · ${attempts.length} lượt đã lưu`
                : 'Bắt đầu phiên để lưu lần thử và sử dụng Coach.'}
        </p>
        {(!session || completed || error) && (
          <Button disabled={busy || restoring || held > 0} onClick={start}>
            {session ? 'Tạo phiên mới' : 'Bắt đầu phiên'}
          </Button>
        )}
        <small>Dữ liệu hiện lưu trong bộ nhớ server, sẽ mất khi server khởi động lại.</small>
      </section>
      {error && (
        <p className="flow-error" role="alert">
          {error} Kiểm tra backend ở cổng 8000 rồi thử lại.
        </p>
      )}
      {storageWarning && <p role="status">{storageWarning}</p>}
      <div className="lab-workspace">
        <section className="lab-panel scene-panel" aria-labelledby="connected-scene-title">
          <div className="panel-heading">
            <h2 id="connected-scene-title">Không gian thực hành</h2>
            <span className="badge">B cố định tại +{bSlot}</span>
          </div>
          <Suspense
            fallback={
              <div className="scene-wrap">
                <p className="scene-error" role="status">
                  Đang tải bàn 3D…
                </p>
              </div>
            }
          >
            <BalanceScene
              plan={{ A: value, B: bSlot }}
              result={result}
              disabled={locked}
              movableObject="A"
              cameraActive={cameraEnabled}
              cursors={camera.cursors}
              highlight={highlight}
              apiRef={sceneRef}
              onPlace={(_, slot, input) => {
                if (locked || slot < challenge.min || slot > challenge.max) {
                  setMessage('Đặt A vào vạch bên trái điểm tựa.');
                  return false;
                }
                change(slot, input);
                return true;
              }}
              onMessage={setMessage}
              onHeld={setHeld}
            />
          </Suspense>
          <p className="scene-caption" aria-live="polite">
            {result
              ? `${OUTCOMES[result.outcome]} · Trái ${result.left_torque_nm.toFixed(2)} N·m · Phải ${result.right_torque_nm.toFixed(2)} N·m`
              : `A: 1 kg tại ô ${value} · B: 2 kg tại ô +${bSlot}`}
          </p>
          {message && (
            <p role="status" className="scene-caption">
              {message}
            </p>
          )}
          <div className="camera-controls">
            <Button
              variant="outline"
              disabled={!cameraEnabled && (locked || held > 0)}
              onClick={() => {
                setCameraError('');
                setCameraEnabled(!cameraEnabled);
              }}
            >
              {cameraEnabled ? <CameraOff size={16} /> : <Camera size={16} />}
              {cameraEnabled ? 'Tắt camera' : 'Điều khiển bằng tay'}
            </Button>
            <span role="status">
              {completed
                ? 'Tạo phiên mới để tiếp tục thực hành.'
                : camera.status === 'loading'
                  ? 'Đang mở camera và mô hình…'
                  : camera.status === 'ready'
                    ? 'Chụm ngón cái–trỏ để giữ A; mở để thả.'
                    : 'Có thể kéo A bằng chuột hoặc dùng thanh trượt.'}
            </span>
          </div>
          <video
            className="camera-preview"
            ref={camera.videoRef}
            autoPlay
            muted
            playsInline
            hidden={!cameraEnabled}
            aria-label="Camera nhận diện tay, xử lý trên máy"
          />
          {cameraError && (
            <p className="flow-error" role="alert">
              {cameraError}
            </p>
          )}
          <p className="scene-caption">
            Camera chỉ xử lý trên máy. Ảnh và điểm bàn tay không gửi đến Coach hay server.
          </p>
        </section>
        <form
          className="lab-panel instruction-panel"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <h2>1. Dự đoán và thử</h2>
          <label htmlFor="lab-value">Vị trí A: {value}</label>
          <input
            id="lab-value"
            type="range"
            min={challenge.min}
            max={challenge.max}
            step={challenge.step}
            value={value}
            disabled={locked || held > 0}
            onChange={(event) => change(Number(event.target.value), 'keyboard')}
          />
          <label htmlFor="prediction">Em dự đoán kết quả nào?</label>
          <select
            id="prediction"
            value={outcome}
            disabled={locked}
            onChange={(event) => setOutcome(event.target.value as Outcome)}
          >
            {Object.entries(OUTCOMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="prediction-reason">Vì sao em nghĩ vậy?</label>
          <textarea
            id="prediction-reason"
            required
            maxLength={1000}
            disabled={locked}
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            placeholder="Dựa vào khối lượng và khoảng cách…"
          />
          <Button disabled={locked || held > 0 || !explanation.trim()} type="submit">
            {busy ? 'Đang xử lý…' : 'Chạy thử và lưu'}
          </Button>
          <Button
            variant="outline"
            disabled={locked || held > 0}
            onClick={() => change(challenge.initial, 'keyboard')}
            type="button"
          >
            Đặt lại vị trí
          </Button>
        </form>
      </div>
      <div className="flow-grid">
        <section className="lab-panel instruction-panel" aria-labelledby="history-title">
          <h2 id="history-title">2. Bằng chứng từ các lượt thử</h2>
          {!attempts.length ? (
            <p>Chưa có lượt thử. Hãy dự đoán và chạy thử.</p>
          ) : (
            <ol className="attempt-history">
              {attempts.map((attempt) => (
                <li key={attempt.id}>
                  <strong>
                    Lượt {attempt.number} · {OUTCOMES[attempt.result.outcome]}
                  </strong>
                  <span>
                    A tại {attempt.placements.find((item) => item.object_id === 'A')?.slot} · Trái{' '}
                    {attempt.result.left_torque_nm} / Phải {attempt.result.right_torque_nm} N·m
                  </span>
                  <small>
                    Dự đoán: {OUTCOMES[attempt.prediction.outcome]} ·{' '}
                    {attempt.prediction.explanation}
                  </small>
                  <small>
                    Thao tác:{' '}
                    {attempt.source === 'gesture'
                      ? 'Bàn tay'
                      : attempt.source === 'pointer'
                        ? 'Chuột'
                        : 'Thanh trượt'}
                  </small>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="lab-panel instruction-panel" aria-labelledby="coach-title">
          <h2 id="coach-title">AI Coach</h2>
          <p>
            Coach dùng dữ liệu lượt thử để gợi mở. Phản hồi có nhãn cho biết đến từ LLM hay gợi ý có
            sẵn.
          </p>
          <div className="coach-messages" aria-live="polite">
            {messages.map((item) => (
              <article key={item.id} className={`coach-message ${item.role}`}>
                <strong>
                  {item.role === 'student'
                    ? 'Em'
                    : item.reply?.fallback
                      ? 'Coach · Gợi ý có sẵn'
                      : 'Coach · LLM'}
                </strong>
                <p>{item.text}</p>
                {item.reply && (
                  <>
                    <p>{item.reply.question}</p>
                    <small>
                      {item.reply.referenced_attempt_ids
                        .map(
                          (id) =>
                            `Lượt ${attempts.find((attempt) => attempt.id === id)?.number ?? '?'}`,
                        )
                        .join(' · ')}
                    </small>
                  </>
                )}
              </article>
            ))}
          </div>
          <form
            className="instruction-panel coach-form"
            onSubmit={(event) => {
              event.preventDefault();
              void ask();
            }}
          >
            <label htmlFor="coach-mode">Em cần hỗ trợ gì?</label>
            <select
              id="coach-mode"
              value={mode}
              disabled={locked}
              onChange={(event) => setMode(event.target.value as CoachMode)}
            >
              {Object.entries(modes).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                  disabled={
                    key === 'COMPARE'
                      ? attempts.length < 2
                      : key === 'EXPLAIN' || key === 'REFLECT'
                        ? !attempts.length
                        : false
                  }
                >
                  {label}
                </option>
              ))}
            </select>
            <label htmlFor="coach-question">Câu hỏi của em</label>
            <textarea
              id="coach-question"
              required
              maxLength={2000}
              value={question}
              disabled={locked}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Em nên quan sát điều gì giữa hai lần thử?"
            />
            <Button type="submit" disabled={locked || held > 0 || !question.trim()}>
              <Send size={16} /> Gửi Coach
            </Button>
          </form>
        </section>
      </div>
      <form
        className="lab-panel instruction-panel reflection-panel"
        onSubmit={(event) => {
          event.preventDefault();
          void complete();
        }}
      >
        <h2>3. Phản tư và hoàn thành</h2>
        <p>
          Thử ít nhất hai vị trí A khác nhau. Chọn lượt làm bằng chứng và tự giải thích điều em học
          được.
        </p>
        <label htmlFor="final-attempt">Lượt thử làm bằng chứng</label>
        <select
          id="final-attempt"
          required
          disabled={locked || !attempts.length}
          value={selectedAttempt}
          onChange={(event) => setSelectedAttempt(event.target.value)}
        >
          <option value="">Chọn lượt</option>
          {attempts.map((attempt) => (
            <option key={attempt.id} value={attempt.id}>
              Lượt {attempt.number} · {OUTCOMES[attempt.result.outcome]}
            </option>
          ))}
        </select>
        <label htmlFor="reflection">Em đã thay đổi gì và kết quả chứng minh điều gì?</label>
        <textarea
          id="reflection"
          required
          minLength={10}
          maxLength={2000}
          disabled={locked}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
        />
        {completed ? (
          <p role="status">
            <CheckCircle2 size={18} /> Đã lưu phản tư và hoàn thành phiên. Em có thể tạo phiên mới ở
            đầu trang.
          </p>
        ) : (
          <Button
            type="submit"
            disabled={
              locked ||
              held > 0 ||
              distinctPlans < 2 ||
              reflection.trim().length < 10 ||
              !selectedAttempt
            }
          >
            Hoàn thành phiên
          </Button>
        )}
      </form>
    </>
  );
}
