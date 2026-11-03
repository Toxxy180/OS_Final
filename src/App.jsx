import React, { useEffect, useState, lazy, Suspense } from 'react';
import Shell from './components/Shell';
import Overview from './pages/Overview';
import Chapters from './pages/Chapters';
import Lesson from './pages/Lesson';
import { useSavedState } from './lib/storage';
const Quiz = lazy(() => import('./pages/Quiz'));
const AddressLab = lazy(() => import('./pages/AddressLab'));
const Sheet = lazy(() => import('./pages/Sheet'));
function readRoute(){ return location.hash.slice(1).split('?')[0] || '/'; }
export default function App(){
  const [route,setRoute]=useState(readRoute);
  const [completed,setCompleted]=useSavedState('completed',{});
  useEffect(()=>{ const onHash=()=>{setRoute(readRoute());window.scrollTo(0,0);};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash); },[]);
  useEffect(()=>{ document.title = `${route.startsWith('/quiz')?'ฝึกทำข้อสอบ':route==='/lab'?'Address Lab':route==='/sheet'?'ชีท A4 หน้าหลัง':route.startsWith('/chapter')?'บทเรียน':'ทบทวนก่อน Final'} — OS / study space`; },[route]);
  const parts=route.split('/');
  return <Shell route={route} completed={completed}><Suspense fallback={<p className="loading-state">กำลังเปิดเนื้อหา…</p>}>{route==='/'?<Overview completed={completed}/>:route==='/chapters'?<Chapters completed={completed}/>:parts[1]==='chapter'?<Lesson id={parts[2]} completed={completed} setCompleted={setCompleted}/>:parts[1]==='quiz'?<Quiz key={parts[2] || '01'} id={parts[2]}/>:route==='/lab'?<AddressLab/>:route==='/sheet'?<Sheet/>:<div><h1>ไม่พบหน้านี้</h1><a className="button" href="#/">กลับภาพรวม</a></div>}</Suspense></Shell>;
}
