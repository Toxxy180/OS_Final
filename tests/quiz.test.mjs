import test from 'node:test';
import assert from 'node:assert/strict';
import { answerState, quizProgress } from '../src/lib/quiz.js';

const questions = [
  { id: 'mcq', type: 'mcq', options: ['a', 'b'], answerIndex: 1 },
  { id: 'written', type: 'written' },
  { id: 'calculation', type: 'calculation' },
];

test('revealed written and calculation solutions need a separate self-assessment', () => {
  const answers = { written: { checked: true, text: 'my draft' }, calculation: { checked: true } };
  assert.equal(answerState(questions[1], answers.written), 'pending');
  assert.equal(quizProgress(questions, answers).completed, 0);
  assert.equal(quizProgress(questions, answers).pending, 2);
  answers.written.selfScore = false;
  answers.calculation.selfScore = true;
  const progress = quizProgress(questions, answers);
  assert.equal(progress.completed, 2);
  assert.equal(progress.review, 1);
  assert.equal(progress.selfCorrect, 1);
  assert.equal(progress.selfTotal, 2);
  assert.equal(progress.pending, 0);
});

test('only checked MCQ answers count, including a selected index of zero', () => {
  assert.equal(answerState(questions[0], { selected: 0 }), 'draft');
  assert.equal(answerState(questions[0], { selected: 0, checked: true }), 'review');
  const progress = quizProgress(questions, { mcq: { selected: 1, checked: true } });
  assert.equal(progress.completed, 1);
  assert.equal(progress.mcqCorrect, 1);
  assert.equal(progress.mcqTotal, 1);
  assert.equal(quizProgress(questions, { mcq: { selected: 99, checked: true } }).completed, 0);
});

test('retry preserves a written draft while removing the old completion and score', () => {
  const previous = { text: 'base + offset', checked: true, selfScore: true };
  assert.equal(quizProgress(questions, { written: previous }).completed, 1);
  const retry = { ...previous, checked: false, selfScore: undefined };
  const progress = quizProgress(questions, { written: retry });
  assert.equal(answerState(questions[1], retry), 'draft');
  assert.equal(progress.completed, 0);
  assert.equal(progress.selfTotal, 0);
  assert.equal(retry.text, previous.text);
  assert.equal(answerState(questions[1], { text: '   ' }), 'unanswered');
});
