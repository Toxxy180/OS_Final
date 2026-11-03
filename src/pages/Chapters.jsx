import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { chapters } from '../data';
import { Breadcrumb, ChapterRows } from '../components/Common';
export default function Chapters({ completed }) {
  const [query,setQuery] = useState('');
  const q = query.trim().toLocaleLowerCase();
  const results = chapters.filter(c => `${c.title} ${c.english} ${c.subtitle} ${c.sections.map(s => `${s.title} ${s.paragraphs.join(' ')} ${(s.bullets || []).join(' ')}`).join(' ')}`.toLocaleLowerCase().includes(q));
  return <><Breadcrumb>ห้องอ่านหนังสือ / บทเรียน</Breadcrumb><h1>ทุกบท เชื่อมเป็นภาพเดียว</h1><p className="page-intro">8 บทจากสไลด์ 10 ไฟล์ • บท 04 รวม Lab และบท 05 รวม Part 1 กับ Conclusion</p><label className="search-field"><Search size={20}/><input aria-label="ค้นหาบทเรียนหรือคำสำคัญ" placeholder="ค้นหา เช่น deadlock, PCB, page fault…" value={query} onChange={e => setQuery(e.target.value)}/></label><p className="muted" aria-live="polite">พบ {results.length} บทเรียน</p><ChapterRows chapters={results} completed={completed}/>{results.length === 0 && <p className="empty-state">ยังไม่พบคำนี้ ลองค้นด้วยศัพท์ภาษาอังกฤษหรือคำที่สั้นลง</p>}<div className="reading-route"><h2>แต่ละบทต่อกันอย่างไร</h2><p><b>01</b> ทำความเข้าใจหน้าที่ OS → <b>02–03</b> สร้างขอบเขตของโปรแกรมและเข้าใช้ Kernel → <b>04</b> แบ่งงานเป็น Thread → <b>05</b> ประสานการใช้ข้อมูล → <b>06</b> แบ่งเวลา CPU → <b>07</b> แปลงที่อยู่ → <b>08</b> จัดการหน้าใน RAM</p></div></>;
}
