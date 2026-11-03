import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Check, CheckCircle2, CircleHelp,
  ChevronDown, X, PencilLine, ListChecks, Circle } from 'lucide-react';
import { chapters, chapterById } from '../data';
import { Breadcrumb } from '../components/Common';
import { useSavedState } from '../lib/storage';
import { useMediaQuery } from '../lib/useMediaQuery';
import { answerState, quizProgress } from '../lib/quiz';

const typeLabels = { mcq: 'ปรนัย', written: 'เขียนอธิบาย', calculation: 'คำนวณ' };
const stateLabels = { unanswered: 'ยังไม่ตอบ', draft: 'มีคำตอบรอตรวจ', pending: 'รอประเมินตนเอง',
  correct: 'ตอบถูก / ประเมินว่าทำได้', review: 'ต้องทบทวน' };
const stateIcons = { unanswered: Circle, draft: PencilLine, pending: CircleHelp,
  correct: Check, review: RotateCcw };

export default function Quiz({ id }) {
  const c = chapterById[id] || chapters[0];
  const [filter, setFilter] = useState('all');
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useSavedState(`quiz-${c.id}`, {});
  const [resetting, setResetting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const wide = useMediaQuery('(min-width: 1200px)');
  const headingRef = useRef(null);
  const shouldFocus = useRef(false);
  const mapVisible = wide || mapOpen;
  const questions = c.questions.filter(q => filter === 'all' || q.type === filter);
  const q = questions[Math.min(position, questions.length - 1)];
  const saved = answers[q.id] || {};
  const number = c.questions.indexOf(q) + 1;
  const progress = quizProgress(c.questions, answers);
  const nextUnfinished = questions.findIndex((item, index) => index > position
    && !['correct', 'review'].includes(answerState(item, answers[item.id])));
  const firstUnfinished = questions.findIndex(item => !['correct', 'review'].includes(answerState(item, answers[item.id])));

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById('quiz-question')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [q.id]);

  function update(patch) {
    setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], ...patch } }));
  }

  function move(index) {
    shouldFocus.current = true;
    setPosition(index);
    setMapOpen(false);
    if (index === position) {
      shouldFocus.current = false;
      headingRef.current?.focus({ preventScroll: true });
      document.getElementById('quiz-question')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function retryQuestion() {
    // Preserve the written draft so the learner can improve it after reviewing.
    update({ checked: false, selected: undefined, selfScore: undefined });
    requestAnimationFrame(() => {
      document.querySelector('#quiz-question input, #quiz-question textarea')?.focus();
    });
  }

  return <>
    <Breadcrumb>ห้องอ่านหนังสือ / ฝึกทำข้อสอบ</Breadcrumb>
    <div className="quiz-heading">
      <div><h1>ฝึกคิด ก่อนเปิดเฉลย</h1>
        <p className="page-intro">ลองตอบด้วยตัวเอง แล้วตรวจเหตุผลทีละข้อ ปรนัยตรวจอัตโนมัติ ส่วนข้อเขียนและคำนวณให้เทียบกับแนวตอบ</p>
      </div>
      <a className="text-link" href={`#/chapter/${c.id}`}><CircleHelp size={18}/>ทบทวนบท {c.id}</a>
    </div>

    <div className="quiz-filters">
      <label htmlFor="quiz-chapter">เลือกบทเรียน
        <select id="quiz-chapter" aria-label="เลือกบทเรียนสำหรับข้อสอบ" value={c.id}
          onChange={e => { location.hash = `/quiz/${e.target.value}`; }}>
          {chapters.map(ch => <option value={ch.id} key={ch.id}>{ch.id} — {ch.title}</option>)}
        </select>
      </label>
      <label htmlFor="quiz-type">รูปแบบข้อสอบ
        <select id="quiz-type" aria-label="รูปแบบข้อสอบ" value={filter} onChange={e => {
          setFilter(e.target.value); setPosition(0); setMapOpen(false);
        }}>
          <option value="all">ทั้งหมด {c.questions.length} ข้อ</option>
          {Object.entries(typeLabels).filter(([type]) => c.questions.some(x => x.type === type))
            .map(([type, label]) => <option value={type} key={type}>
              {label} ({c.questions.filter(x => x.type === type).length} ข้อ)
            </option>)}
        </select>
      </label>
    </div>

    <div className="quiz-layout">
      <aside className="quiz-summary" aria-label="ความคืบหน้าและเลือกข้อสอบ">
        <div className="quiz-progress-header">
          <div><h2>ความคืบหน้าบท {c.id}</h2>
            <p className="big-progress">{progress.completed}<small> / {c.questions.length} ข้อ</small></p>
          </div>
          <button className="quiz-map-toggle" aria-controls="quiz-map" aria-expanded={mapVisible}
            onClick={() => setMapOpen(!mapOpen)}>
            <ListChecks size={18}/><span>{mapOpen ? 'ซ่อนแผงข้อสอบ' : 'เลือกข้อ / ดูคะแนน'}</span>
            <ChevronDown size={16} className={mapOpen ? 'rotated' : ''}/>
          </button>
        </div>
        <progress max={c.questions.length} value={progress.completed} aria-label="จำนวนข้อที่ตรวจและประเมินแล้ว"/>
        <p className="quiz-progress-note">{progress.pending > 0
          ? `เปิดแนวตอบแล้ว รอประเมินตนเอง ${progress.pending} ข้อ`
          : progress.completed === c.questions.length ? 'ตรวจและประเมินครบทุกข้อแล้ว' : 'คำตอบบันทึกอัตโนมัติในเบราว์เซอร์นี้'}</p>
        <div id="quiz-map" hidden={!mapVisible}>
          <dl className="quiz-scores">
            <div><dt>ปรนัยถูก</dt><dd>{progress.mcqCorrect} / {progress.mcqTotal}</dd></div>
            <div><dt>ประเมินตนเองว่าทำได้</dt><dd>{progress.selfCorrect} / {progress.selfTotal}</dd></div>
            <div><dt>ข้อที่ต้องทบทวน</dt><dd>{progress.review}</dd></div>
          </dl>
          <nav className="question-grid" aria-label="เลือกข้อสอบในบทนี้">
            {questions.map((item, index) => {
              const state = answerState(item, answers[item.id]);
              const StateIcon = stateIcons[state];
              const itemNumber = c.questions.indexOf(item) + 1;
              return <button key={item.id} aria-label={`ไปข้อ ${itemNumber} — ${stateLabels[state]}`}
                aria-current={position === index ? 'step' : undefined}
                className={`question-jump ${state} ${position === index ? 'current' : ''}`}
                onClick={() => move(index)}>
                <span>{itemNumber}</span><StateIcon size={12} aria-hidden="true"/>
              </button>;
            })}
          </nav>
          <ul className="question-legend" aria-label="ความหมายสถานะข้อสอบ">
            <li><span className="legend-mark draft"><PencilLine size={12}/></span>รอตรวจ</li>
            <li><span className="legend-mark pending"><CircleHelp size={12}/></span>รอประเมิน</li>
            <li><span className="legend-mark correct"><Check size={12}/></span>ทำได้</li>
            <li><span className="legend-mark review"><RotateCcw size={12}/></span>ทบทวน</li>
          </ul>
          <p className="fine-print">ข้อเขียนและคำนวณต้องประเมินตนเองหลังอ่านแนวตอบ จึงนับในความคืบหน้า</p>
          {firstUnfinished !== -1 && <button className="button secondary small quiz-continue"
            onClick={() => move(nextUnfinished !== -1 ? nextUnfinished : firstUnfinished)}>
            ไปข้อที่ยังไม่เสร็จ<ArrowRight size={16}/>
          </button>}
          <div className="quiz-reset">
            {resetting ? <div className="reset-confirm" role="alert">
              <p>ล้างคำตอบทั้งหมดของบท {c.id} และเริ่มใหม่?</p>
              <div className="button-group">
                <button className="button small" onClick={() => {
                  setAnswers({}); setResetting(false); move(0);
                }}>ยืนยันล้างคำตอบ</button>
                <button className="button secondary small" onClick={() => setResetting(false)}>ยกเลิก</button>
              </div>
            </div> : <button className="text-link small" onClick={() => setResetting(true)}>
              <RotateCcw size={15}/>เริ่มบทนี้ใหม่
            </button>}
          </div>
        </div>
      </aside>

      <section id="quiz-question" className="question-panel" aria-labelledby="question-title">
        <div className="question-meta">
          <span className="question-counter">บท {c.id} · ข้อ {number} / {c.questions.length}</span>
          <span className="question-type">{typeLabels[q.type]} · {q.difficulty}</span>
        </div>
        <h2 id="question-title" ref={headingRef} tabIndex={-1}>{q.prompt}</h2>
        {q.type === 'mcq' ? <fieldset className="options" aria-describedby={!saved.checked ? 'quiz-answer-hint' : undefined}>
          <legend className="sr-only">เลือกคำตอบที่ถูกต้องสำหรับข้อ {number}</legend>
          {q.options.map((option, index) => {
            const correct = saved.checked && index === q.answerIndex;
            const incorrect = saved.checked && saved.selected === index && index !== q.answerIndex;
            return <label className={`answer-option ${saved.selected === index ? 'selected' : ''} ${correct ? 'correct' : ''} ${incorrect ? 'incorrect' : ''}`} key={index}>
              <input type="radio" name={q.id} value={index} checked={saved.selected === index}
                disabled={!!saved.checked} onChange={() => update({ selected: index })}/>
              <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {correct ? <CheckCircle2 className="option-status" size={20} aria-label="คำตอบที่ถูกต้อง"/>
                : incorrect ? <X className="option-status" size={20} aria-label="คำตอบที่เลือกยังไม่ถูก"/> : null}
            </label>;
          })}
        </fieldset> : <label className="written-answer" htmlFor="written-answer">คำตอบ / วิธีทำของคุณ
          <textarea id="written-answer" rows={6} value={saved.text || ''}
            placeholder="ลองเขียนเหตุผล สูตร สมมติฐาน และหน่วยก่อนดูแนวตอบ…"
            onChange={e => update({ text: e.target.value })}/>
          <small>บันทึกอัตโนมัติในเบราว์เซอร์นี้</small>
        </label>}

        {!saved.checked ? <div className="question-submit">
          <button className="button" disabled={q.type === 'mcq' && saved.selected === undefined}
            onClick={() => update({ checked: true })}>
            {q.type === 'mcq' ? 'ตรวจคำตอบ' : 'เปิดแนวตอบและวิธีทำ'}<ArrowRight size={17}/>
          </button>
          <p id="quiz-answer-hint" className="fine-print">{q.type === 'mcq'
            ? saved.selected === undefined ? 'เลือกคำตอบ 1 ข้อก่อนตรวจ' : 'เลือกแล้ว กดตรวจเพื่อดูเหตุผล'
            : 'เปิดแนวตอบได้แม้ยังไม่เขียน จากนั้นประเมินความเข้าใจของตัวเอง'}</p>
        </div> : <div className={`answer-feedback ${q.type === 'mcq' && saved.selected !== q.answerIndex ? 'needs-review' : ''}`}
          role="status" aria-live="polite" aria-atomic="true">
          <h3>{q.type === 'mcq' ? saved.selected === q.answerIndex ? 'ตอบถูกแล้ว' : 'ยังไม่ถูก ลองทบทวนเหตุผล' : 'แนวตอบและเกณฑ์ประเมิน'}</h3>
          {q.type === 'mcq' && <span className="feedback-answer-label">คำตอบที่ถูก: {String.fromCharCode(65 + q.answerIndex)}</span>}
          <p><strong>{q.answer}</strong></p><p>{q.explanation}</p>
          {q.steps?.length > 0 && <ol>{q.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}
          {q.rubric?.length > 0 && <><h4>ประเด็นที่คำตอบควรมี</h4><ul>{q.rubric.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
          {q.type !== 'mcq' && <div className="self-grade" role="group" aria-label="ประเมินความเข้าใจของตัวเอง">
            <p>เทียบกับแนวตอบแล้ว คุณทำได้แค่ไหน?</p>
            <div className="button-group">
              <button className={`button secondary ${saved.selfScore === true ? 'completed' : ''}`}
                aria-pressed={saved.selfScore === true} onClick={() => update({ selfScore: true })}>
                <Check size={17}/>เข้าใจและตอบได้
              </button>
              <button className={`button secondary ${saved.selfScore === false ? 'completed' : ''}`}
                aria-pressed={saved.selfScore === false} onClick={() => update({ selfScore: false })}>
                <RotateCcw size={17}/>ยังต้องทบทวน
              </button>
            </div>
          </div>}
          <button className="text-link small" onClick={retryQuestion}><RotateCcw size={15}/>ลองข้อนี้อีกครั้ง</button>
        </div>}

        {progress.completed === c.questions.length && <div className="quiz-complete" role="status">
          <CheckCircle2 size={22}/><div><strong>ฝึกครบ {c.questions.length} ข้อแล้ว</strong>
            <p>{progress.review > 0 ? `ยังมี ${progress.review} ข้อให้กลับไปทบทวน ดูได้จากแผงข้อสอบ` : 'ทำได้ครบทุกข้อ ลองทวนเหตุผลและสูตรอีกครั้งก่อนสอบ'}</p>
          </div>
        </div>}
        <nav className="question-navigation" aria-label="เปลี่ยนข้อสอบ">
          <button className="button secondary" disabled={position === 0} onClick={() => move(position - 1)}>
            <ArrowLeft size={17}/>ก่อนหน้า
          </button>
          <span>{position + 1} / {questions.length}<small>{filter === 'all' ? 'ในบทนี้' : typeLabels[filter]}</small></span>
          <button className="button" disabled={position >= questions.length - 1} onClick={() => move(position + 1)}>
            ถัดไป<ArrowRight size={17}/>
          </button>
        </nav>
      </section>
    </div>
  </>;
}
