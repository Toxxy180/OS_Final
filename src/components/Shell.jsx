import React, { useEffect, useRef, useState } from 'react';
import { Home, BookOpen, SquareCheck, Terminal, FileText, Menu, X } from 'lucide-react';
import { useMediaQuery } from '../lib/useMediaQuery';

const nav = [ ['/', 'ภาพรวม', Home], ['/chapters', 'บทเรียน', BookOpen],
  ['/quiz/01', 'ฝึกทำข้อสอบ', SquareCheck], ['/lab', 'Address Lab', Terminal], ['/sheet', 'ชีท A4', FileText] ];

export default function Shell({ route, completed, children }) {
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 1100px)');
  const drawerOpen = mobile && open;
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const count = Object.values(completed).filter(Boolean).length;

  useEffect(() => { setOpen(false); }, [route, mobile]);
  useEffect(() => {
    if (!drawerOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector('.drawer-heading button')?.focus();
    function trapFocus(event) {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...sidebarRef.current.querySelectorAll('.drawer-heading button, nav a')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', trapFocus);
      menuRef.current?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  return <>
    <a className="skip-link" href="#main-content" onClick={event => {
      event.preventDefault(); document.getElementById('main-content')?.focus();
    }}>ข้ามไปเนื้อหา</a>
    <header className="mobile-header" inert={drawerOpen}>
      <a className="brand" href="#/" onClick={() => setOpen(false)}>
        <span className="brand-mark">OS</span><span>study space</span>
      </a>
      <button ref={menuRef} className="icon-button" aria-label={drawerOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        aria-expanded={drawerOpen} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>
        {drawerOpen ? <X/> : <Menu/>}
      </button>
    </header>
    {drawerOpen && <button className="nav-backdrop" tabIndex={-1} aria-label="ปิดเมนูจากพื้นหลัง" onClick={() => setOpen(false)}/>}
    <aside id="primary-navigation" ref={sidebarRef} className={`sidebar ${drawerOpen ? 'open' : ''}`}
      role={mobile ? 'dialog' : undefined} aria-modal={drawerOpen ? true : undefined}
      aria-label={mobile ? 'เมนูนำทาง' : undefined}>
      <div className="drawer-heading"><strong>เมนู</strong>
        <button className="icon-button" aria-label="ปิดเมนูนำทาง" onClick={() => setOpen(false)}><X size={20}/></button>
      </div>
      <a className="brand" href="#/" onClick={() => setOpen(false)}>
        <span className="brand-mark">OS</span><span>OS / study space</span>
      </a>
      <nav aria-label="เมนูหลัก">{nav.map(([href, label, Icon]) => {
        const active = href === '/' ? route === '/' : href.startsWith('/quiz')
          ? route.startsWith('/quiz') : href === '/chapters' ? route.startsWith('/chapter') : route === href;
        return <a key={href} href={`#${href}`} className={active ? 'active' : ''}
          aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>
          <Icon size={21}/>{label}
        </a>;
      })}</nav>
      <div className="sidebar-progress">
        <div><span>ความคืบหน้าการอ่าน</span><strong>{count}/8</strong></div>
        <progress max={8} value={count} aria-label="ความคืบหน้าการอ่าน"/>
        <small>เก็บไว้ในเบราว์เซอร์เครื่องนี้</small>
      </div>
    </aside>
    <main id="main-content" tabIndex={-1} inert={drawerOpen}
      className={`main-content ${route === '/sheet' ? 'sheet-view' : ''}`}>{children}</main>
  </>;
}
