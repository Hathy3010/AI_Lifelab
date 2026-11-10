import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  ChevronRight,
  Compass,
  Droplets,
  GraduationCap,
  Scale,
  Sparkles,
  Sprout,
  Target,
  Wallet,
  Zap,
  BookOpen,
} from 'lucide-react';
import type { SceneAPI } from './components/BalanceScene';
import { Button } from './components/ui/button';
import { LAB_TOPICS, getPreview, type Challenge, type LabTopic } from './lib/labCatalog';
import { OUTCOMES, type Plan, type SimulationResult } from './lib/types';
import { gradePath, topicPath, resolveLabRoute } from './lib/labRoutes';
import { ConnectedBalanceLab } from './components/ConnectedBalanceLab';

const icons = {
  water: Droplets,
  balance: Scale,
  budget: Wallet,
  energy: Zap,
  savings: Target,
  study: BookOpen,
};
const BalanceScene = lazy(() =>
  import('./components/BalanceScene').then(({ BalanceScene }) => ({ default: BalanceScene })),
);
const TopicScene = lazy(() =>
  import('./components/TopicScene').then(({ TopicScene }) => ({ default: TopicScene })),
);

function TopicArt({ topic }: { topic: LabTopic }) {
  const Icon = icons[topic.scene];
  return (
    <div className="topic-art" aria-hidden="true">
      <span className="art-spark">✦</span>
      <svg viewBox="0 0 184 110" fill="none">
        <path d="m18 66 73-33 75 33-75 33z" fill="#95d5bf" stroke="#17365e" strokeWidth="1.4" />
        <path
          d="m18 66 73 33 75-33v8l-75 33-73-33z"
          fill="#73b8a1"
          stroke="#17365e"
          strokeWidth="1.4"
        />
        <path d="m48 64 43-19 44 19-44 19z" fill="#fff7e6" stroke="#17365e" strokeWidth="1.4" />
      </svg>
      <Icon className="art-icon" size={42} strokeWidth={1.55} />
    </div>
  );
}

function ChallengeLab({ topic, challenge }: { topic: LabTopic; challenge: Challenge }) {
  const [value, setValue] = useState(challenge.initial);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [message, setMessage] = useState('');
  const [heldCount, setHeldCount] = useState(0);
  const sceneRef = useRef<SceneAPI | null>(null);
  const isBalance = topic.scene === 'balance';
  const bSlot = challenge.id === 'tip' ? 1 : 2;
  const plan: Plan = { A: value, B: bSlot };
  const preview = getPreview(topic, challenge, value);

  function change(value: number) {
    setValue(value);
    setResult(null);
    setMessage('');
  }

  function runBalance() {
    const left = Math.abs(value) * 0.98;
    const right = bSlot * 2 * 0.98;
    const outcome =
      Math.abs(right - left) < 0.001 ? 'BALANCED' : right > left ? 'RIGHT_DOWN' : 'LEFT_DOWN';
    setResult({
      left_torque_nm: left,
      right_torque_nm: right,
      net_torque_nm: right - left,
      outcome,
    });
  }

  return (
    <>
      <div className="lab-intro">
        <p className="eyebrow">
          {topic.category} · LỚP {topic.grade}
        </p>
        <h1>{challenge.title}</h1>
        <p className="intro">{topic.title}</p>
      </div>
      <div className="lab-workspace">
        <section className="lab-panel scene-panel" aria-labelledby="scene-title">
          <div className="panel-heading">
            <h2 id="scene-title">Không gian thực hành</h2>
            <span className="badge">
              <Box size={15} aria-hidden="true" /> Bàn 3D
            </span>
          </div>
          <Suspense
            fallback={
              <div className="scene-wrap">
                <p className="scene-error" role="status">
                  Đang mở bàn thực hành…
                </p>
              </div>
            }
          >
            {topic.scene === 'balance' ? (
              <BalanceScene
                plan={plan}
                result={result}
                disabled={false}
                movableObject="A"
                cameraActive={false}
                cursors={[]}
                highlight={null}
                apiRef={sceneRef}
                onPlace={(_, slot) => {
                  if (slot < challenge.min || slot > challenge.max) {
                    setMessage('Đặt quả cân A vào một vạch bên trái điểm tựa.');
                    return false;
                  }
                  change(slot);
                  return true;
                }}
                onMessage={setMessage}
                onHeld={setHeldCount}
              />
            ) : (
              <TopicScene kind={topic.scene} preview={preview} />
            )}
          </Suspense>
          {message && (
            <p className="scene-caption" role="status">
              {message}
            </p>
          )}
          <p className="scene-caption" aria-live="polite">
            {isBalance
              ? result
                ? `${OUTCOMES[result.outcome]} · Trái ${result.left_torque_nm.toFixed(2)} N·m · Phải ${result.right_torque_nm.toFixed(2)} N·m`
                : `A · 1 kg tại ô ${value} | B · 2 kg tại ô +${bSlot}`
              : preview.caption}
          </p>
        </section>
        <section className="lab-panel instruction-panel" aria-labelledby="task-title">
          <span className="badge">Thử nghiệm tại chỗ</span>
          <h2 id="task-title">Nhiệm vụ của em</h2>
          <p>{challenge.task}</p>
          <label className="lab-control" htmlFor="lab-value">
            <span>{challenge.control}</span>
            <output htmlFor="lab-value">
              {value} {challenge.unit}
            </output>
          </label>
          <input
            id="lab-value"
            type="range"
            disabled={heldCount > 0}
            min={challenge.min}
            max={challenge.max}
            step={challenge.step}
            value={value}
            onChange={(event) => change(Number(event.target.value))}
          />
          <div className="range-limits">
            <span>{challenge.min}</span>
            <span>{challenge.max}</span>
          </div>
          {isBalance && (
            <Button type="button" disabled={heldCount > 0} onClick={runBalance}>
              Chạy thử <ArrowRight size={16} aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="outline"
            type="button"
            disabled={heldCount > 0}
            onClick={() => change(challenge.initial)}
          >
            Đặt lại
          </Button>
        </section>
      </div>
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash);
  const headingFocus = useRef<HTMLElement>(null);
  useEffect(() => {
    function navigate() {
      setRoute(window.location.hash);
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    headingFocus.current?.focus();
    window.scrollTo(0, 0);
  }, [route]);
  const { grade, topic, challenge, invalid } = resolveLabRoute(route);
  const topics = LAB_TOPICS.filter((topic) => topic.grade === grade);

  return (
    <div className="lab-shell">
      <header className="lab-header">
        <a className="lab-brand" href="#/lab">
          <span>
            <Sprout size={23} aria-hidden="true" />
          </span>{' '}
          AI LifeLab
        </a>
        <span className="lab-header-label">Không gian học sinh</span>
      </header>
      <aside className="lab-sidebar">
        <nav aria-label="Phòng lab">
          <p className="eyebrow">GÓC KHÁM PHÁ</p>
          <a className={!grade ? 'selected' : ''} href="#/lab">
            <Compass size={18} aria-hidden="true" /> Phòng lab
          </a>
          {([8, 9] as const).map((number) => (
            <a
              key={number}
              className={grade === number ? 'selected' : ''}
              aria-current={grade === number ? 'page' : undefined}
              href={gradePath(number)}
            >
              <GraduationCap size={18} aria-hidden="true" /> Lớp {number}
            </a>
          ))}
        </nav>
        <div className="lab-tip">
          <Sparkles size={20} aria-hidden="true" />
          <strong>Mỗi lần thử, một điều mới.</strong>
          <span>Đổi một lựa chọn rồi quan sát kết quả.</span>
        </div>
      </aside>
      <main className="lab-main" tabIndex={-1} ref={headingFocus}>
        {grade && !invalid && (
          <nav aria-label="Vị trí hiện tại" className="breadcrumbs">
            <a href="#/lab">Phòng lab</a>
            <ChevronRight size={15} aria-hidden="true" />
            <a href={gradePath(grade)}>Lớp {grade}</a>
            {topic && (
              <>
                <ChevronRight size={15} aria-hidden="true" />
                <a href={topicPath(topic)}>{topic.title}</a>
              </>
            )}
            {challenge && (
              <>
                <ChevronRight size={15} aria-hidden="true" />
                <span aria-current="page">Bài thực hành</span>
              </>
            )}
          </nav>
        )}
        {invalid ? (
          <section className="lab-panel instruction-panel" aria-labelledby="missing-title">
            <h1 id="missing-title">Không tìm thấy bài thực hành</h1>
            <p>Đường dẫn này không khớp với thư viện hiện tại. Em hãy chọn lại bài để tiếp tục.</p>
            <a
              className="lab-cta"
              href={topic ? topicPath(topic) : grade ? gradePath(grade) : '#/lab'}
            >
              Quay lại thư viện <ArrowRight size={16} aria-hidden="true" />
            </a>
          </section>
        ) : (
          <>
            {grade && (
              <p className="scene-caption">
                <a
                  href={challenge && topic ? topicPath(topic) : topic ? gradePath(grade) : '#/lab'}
                >
                  ←{' '}
                  {challenge
                    ? 'Danh sách bài thực hành'
                    : topic
                      ? `Các chủ đề lớp ${grade}`
                      : 'Chọn khối lớp'}
                </a>
              </p>
            )}
            {topic && challenge ? (
              topic.scene === 'balance' ? (
                <ConnectedBalanceLab
                  key={`${topic.id}/${challenge.id}`}
                  topic={topic}
                  challenge={challenge}
                />
              ) : (
                <ChallengeLab
                  key={`${topic.id}/${challenge.id}`}
                  topic={topic}
                  challenge={challenge}
                />
              )
            ) : (
              <>
                <div className="lab-intro">
                  <p className="eyebrow">{topic ? topic.category : 'TỰ THỬ · TỰ KHÁM PHÁ'}</p>
                  <h1>
                    {topic
                      ? topic.title
                      : grade
                        ? `Phòng lab lớp ${grade}`
                        : 'Hôm nay em muốn khám phá gì?'}
                  </h1>
                  <p className="intro">
                    {topic
                      ? topic.description
                      : grade
                        ? 'Chọn một chủ đề, sau đó thử từng bài nhỏ trong không gian 3D.'
                        : 'Chọn khối lớp để khám phá các bài thực hành khoa học và đời sống.'}
                  </p>
                </div>
                {!grade && (
                  <div className="grade-grid">
                    {([8, 9] as const).map((number) => (
                      <a
                        className={`grade-card tone-${number === 8 ? 'mint' : 'cream'}`}
                        href={gradePath(number)}
                        key={number}
                      >
                        <span className="badge">3 CHỦ ĐỀ · 6 BÀI NHỎ</span>
                        <span className="grade-number" aria-hidden="true">
                          {number}
                        </span>
                        <h2>Lớp {number}</h2>
                        <p>
                          {number === 8
                            ? 'Mực nước, đòn bẩy và tiền tiêu vặt.'
                            : 'Điện năng, tiết kiệm và luyện kỹ năng.'}
                        </p>
                        <span className="lab-cta">
                          Khám phá <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </a>
                    ))}
                  </div>
                )}
                {grade && !topic && (
                  <div className="topic-grid">
                    {topics.map((item, index) => (
                      <article
                        key={item.id}
                        className={`topic-card tone-${['mint', 'cream', 'sky'][index]}`}
                      >
                        <span className="badge">{item.category}</span>
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                        <TopicArt topic={item} />
                        <a className="lab-cta" href={topicPath(item)}>
                          Xem {item.challenges.length} bài nhỏ{' '}
                          <ArrowRight size={16} aria-hidden="true" />
                        </a>
                      </article>
                    ))}
                  </div>
                )}
                {topic && (
                  <section aria-labelledby="challenges-title" className="challenge-section">
                    <h2 id="challenges-title">Các bài thực hành</h2>
                    <ol className="challenge-list">
                      {topic.challenges.map((item, index) => (
                        <li
                          key={item.id}
                          className={`challenge-card tone-${index === 0 ? 'sky' : 'mint'}`}
                        >
                          <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <h3>{item.title}</h3>
                            <p>{item.task}</p>
                          </div>
                          <a className="lab-cta" href={`${topicPath(topic)}/${item.id}`}>
                            Vào lab 3D <ArrowRight size={16} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
