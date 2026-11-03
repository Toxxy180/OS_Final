import { chapters } from '../src/data/index.js';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.equal(chapters.length,8,'Expected 8 chapters');
const ids = new Set(); const sources = new Set();
for (const c of chapters) {
  assert(c.title && c.english && c.objectives.length && c.mnemonic.phrase);
  assert(c.sections.length >= 6, `Missing detailed sections in ${c.id}`);
  assert.equal(c.questions.length,20, `Chapter ${c.id} must have 20 questions`);
  for (const s of c.sections) { assert(s.id && s.title && Array.isArray(s.paragraphs)); if(s.table) {for(const row of s.table.rows) assert.equal(row.length,s.table.headers.length,`Table columns: ${c.id}/${s.id}`);} }
  for (const s of c.sources) {assert(existsSync(`OS_Files/${s.file}`),`Source missing: ${s.file}`);sources.add(s.file);}
  for (const link of c.connections) assert(chapters.some(x=>x.id===link.to),`Broken chapter link: ${link.to}`);
  for (const q of c.questions) {
    assert(!ids.has(q.id),`Duplicate ID: ${q.id}`); ids.add(q.id);
    assert(q.prompt && q.answer && q.explanation,`Incomplete question ${q.id}`);
    assert(['mcq','written','calculation'].includes(q.type));
    if(q.type==='mcq'){assert.equal(q.options.length,4);assert(Number.isInteger(q.answerIndex) && q.answerIndex>=0 && q.answerIndex<4);assert.equal(new Set(q.options).size,4);}
    if(q.type==='calculation') assert(q.steps?.length,`Calculation needs steps: ${q.id}`);
    if(q.type==='written') assert(q.rubric?.length,`Written needs rubric: ${q.id}`);
  }
}
assert.equal(sources.size,10,'All ten source PDFs must be covered');
const totals = Object.fromEntries(['mcq','written','calculation'].map(type=>[type,chapters.flatMap(c=>c.questions).filter(q=>q.type===type).length]));
console.log(`Content OK: ${chapters.length} chapters, ${ids.size} questions, ${sources.size} PDFs. ${JSON.stringify(totals)}`);
