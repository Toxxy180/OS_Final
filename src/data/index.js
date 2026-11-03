import { chapters0103 } from './chapters-01-03.js';
import { chapters0406 } from './chapters-04-06.js';
import { chapters0708 } from './chapters-07-08.js';
export const chapters = [...chapters0103, ...chapters0406, ...chapters0708];
export const chapterById = Object.fromEntries(chapters.map(c => [c.id, c]));
export const totalQuestions = chapters.reduce((n, c) => n + c.questions.length, 0);
