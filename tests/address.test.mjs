import test from 'node:test';
import assert from 'node:assert/strict';
import { translatePage, translateSegment, splitAddress, integer } from '../src/lib/address.js';
test('paging preserves offset and uses mapped PFN, including hex input',()=>{
  const r=translatePage({va:'0x1234',pageSize:1024,pfn:9});
  assert.deepEqual(r,{vpn:4,offset:564,bits:10,status:'ok',pa:9780});
  assert.equal(r.pa.toString(16),'2634');
});
test('page boundaries, missing pages and protection faults do not produce usable PA',()=>{
  assert.equal(translatePage({va:1023,pageSize:1024,pfn:3}).offset,1023);
  assert.equal(translatePage({va:1024,pageSize:1024,pfn:3}).vpn,1);
  assert.equal(translatePage({va:1024,pageSize:1024,pfn:3,present:false}).pa,null);
  assert.equal(translatePage({va:1024,pageSize:1024,pfn:3,allowed:false}).status,'protection');
});
test('invalid input and overflow are rejected',()=>{
  for(const value of ['', '-1','1.5','1e3','Infinity','0xZZ','3abc']) assert.throws(()=>integer(value));
  assert.throws(()=>translatePage({va:100,pageSize:1000,pfn:1}));
  assert.throws(()=>translatePage({va:65536,pageSize:1024,pfn:1,addressBits:16}));
  assert.throws(()=>translatePage({va:1,pageSize:1024,pfn:Number.MAX_SAFE_INTEGER}));
});
test('segment limit is exclusive and overflow is checked',()=>{
  assert.equal(translateSegment({base:'0x4000',limit:'0x800',offset:'0x234'}).pa,0x4234);
  assert.equal(translateSegment({base:1000,limit:100,offset:100}).status,'fault');
  assert.equal(translateSegment({base:1000,limit:100,offset:99}).pa,1099);
});
test('two-level split preserves every address bit, beyond signed 32-bit values',()=>{
  const r=splitAddress({va:'0x12345678',addressBits:32,offsetBits:12,innerBits:10});
  assert.equal(r.outer,72);assert.equal(r.inner,837);assert.equal(r.offset,1656);
  const high=splitAddress({va:'0xFEDCBA98',addressBits:32,offsetBits:12,innerBits:10});
  assert.equal(high.outer*2**22+high.inner*4096+high.offset,0xFEDCBA98);
  assert.throws(()=>splitAddress({va:1,addressBits:32,offsetBits:16,innerBits:16}));
});
