import React, { useState } from 'react';
import { Home, BookOpen, SquareCheck, Terminal, FileText, Menu, X } from 'lucide-react';
const nav = [ ['/', 'ภาพรวม', Home], ['/chapters', 'บทเรียน', BookOpen], ['/quiz/01', 'ฝึกทำข้อสอบ', SquareCheck], ['/lab', 'Address Lab', Terminal], ['/sheet', 'ชีท A4', FileText] ];
export default function Shell({ route, completed, children }) {
  const [open, setOpen] = useState(false);
  const count = Object.values(completed).filter(Boolean).length;
  return <><a className="skip-link" href="#main-content" onClick={e => {e.preventDefault(); document.getElementById('main-content')?.focus();}}>ข้ามไปเนื้อหา</a><header className="mobile-header"><a className="brand" href="#/"><span className="brand-mark">OS</span><span>study space</span></a><button className="icon-button" aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></header>
    {open && <button className="nav-backdrop" aria-label="ปิดเมนู" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'open' : ''}`}><a className="brand" href="#/" onClick={() => setOpen(false)}><span className="brand-mark">OS</span><span>OS / study space</span></a><nav aria-label="เมนูหลัก">{nav.map(([href, label, Icon]) => { const active = href === '/' ? route === '/' : href.startsWith('/quiz') ? route.startsWith('/quiz') : href === '/chapters' ? route.startsWith('/chapter') : route === href; return <a key={href} href={`#${href}`} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}><Icon size={21}/>{label}</a>; })}</nav><div className="sidebar-progress"><div><span>ความคืบหน้าการอ่าน</span><strong>{count}/8</strong></div><progress max="8" value={count} aria-label="ความคืบหน้าการอ่าน"/><small>เก็บไว้ในเบราว์เซอร์เครื่องนี้</small></div></aside>
    <main id="main-content" tabIndex={-1} className={`main-content ${route === '/sheet' ? 'sheet-view' : ''}`}>{children}</main></>;
}
