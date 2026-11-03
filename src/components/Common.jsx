import React from 'react';
import { ArrowRight, Lightbulb, ExternalLink } from 'lucide-react';
export function Breadcrumb({ children, action }) { return <div className="topbar"><span>{children}</span>{action}</div>; }
export function MemoryNote({ phrase, meaning }) { return <aside className="memory-note"><Lightbulb size={24}/><div><strong>{phrase}</strong><p>{meaning}</p></div></aside>; }
export function SourceLinks({ sources }) { return <div className="source-links">{sources.map(s => <a key={s.file} href={`${import.meta.env.BASE_URL}OS_Files/${encodeURIComponent(s.file)}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/><span>{s.file}<small>หน้า {s.pages.replace(/^หน้า\s*/, '')}</small></span></a>)}</div>; }
export function ChapterRows({ chapters, completed = {} }) { return <div className="chapter-grid">{chapters.map(c => <a className="chapter-row" key={c.id} href={`#/chapter/${c.id}`}><span className={`chapter-number ${completed[c.id] ? 'done' : ''}`}>{completed[c.id] ? '✓' : c.id}</span><div><h3>{c.title}</h3><p>{c.english}</p></div><ArrowRight size={18}/></a>)}</div>; }
export function Flow({ items }) { return <div className="flow-diagram">{items.map((s,i) => <React.Fragment key={s}><span>{s}</span>{i < items.length-1 && <ArrowRight size={19} aria-hidden="true"/>}</React.Fragment>)}</div>; }
