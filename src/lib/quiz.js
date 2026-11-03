// Revealing a written answer does not finish it until the learner assesses it.
export function answerState(question, answer = {}) {
  if (answer.checked) {
    if (question.type === 'mcq' && Number.isInteger(answer.selected)
      && answer.selected >= 0 && answer.selected < question.options.length) {
      return answer.selected === question.answerIndex ? 'correct' : 'review';
    }
    if (question.type !== 'mcq') {
      if (typeof answer.selfScore === 'boolean') return answer.selfScore ? 'correct' : 'review';
      return 'pending';
    }
  }
  return Number.isInteger(answer.selected) || answer.text?.trim() ? 'draft' : 'unanswered';
}

export function quizProgress(questions, answers) {
  const result = { completed: 0, correct: 0, review: 0, pending: 0, draft: 0,
    mcqTotal: 0, mcqCorrect: 0, selfTotal: 0, selfCorrect: 0 };
  for (const question of questions) {
    const state = answerState(question, answers[question.id]);
    if (state === 'pending' || state === 'draft') result[state]++;
    if (state !== 'correct' && state !== 'review') continue;
    result.completed++;
    result[state]++;
    if (question.type === 'mcq') {
      result.mcqTotal++;
      if (state === 'correct') result.mcqCorrect++;
    } else {
      result.selfTotal++;
      if (state === 'correct') result.selfCorrect++;
    }
  }
  return result;
}
