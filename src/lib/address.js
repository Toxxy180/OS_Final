export function integer(input, name = 'ค่า') {
  const text = String(input).trim();
  if (!/^(?:0x[0-9a-f]+|\d+)$/i.test(text)) throw new Error(`${name} ต้องเป็นจำนวนเต็มบวกหรือศูนย์ (ฐานสิบ หรือ 0x ฐานสิบหก)`);
  const value = Number(text);
  if (!Number.isSafeInteger(value)) throw new Error(`${name} มีค่ามากเกินช่วงที่คำนวณได้อย่างแม่นยำ`);
  return value;
}
export const hex = n => '0x' + n.toString(16).toUpperCase();
export function translatePage({ va, pageSize, pfn, addressBits = 32, present = true, allowed = true }) {
  va = integer(va, 'Virtual address'); pageSize = integer(pageSize, 'Page size'); pfn = integer(pfn, 'PFN');
  addressBits = integer(addressBits, 'จำนวนบิต');
  if (addressBits < 1 || addressBits > 48) throw new Error('จำนวนบิตต้องอยู่ระหว่าง 1–48');
  if (pageSize < 1 || !Number.isInteger(Math.log2(pageSize))) throw new Error('Page size ต้องเป็นกำลังของ 2 และมากกว่า 0');
  if (pageSize > 2 ** addressBits) throw new Error('Page size ต้องไม่เกินขนาด address space');
  if (va >= 2 ** addressBits) throw new Error('Virtual address เกินขอบเขต address space');
  const vpn = Math.floor(va / pageSize), offset = va % pageSize;
  const bits = Math.log2(pageSize);
  if (!allowed) return { vpn, offset, bits, status: 'protection', pa: null };
  if (!present) return { vpn, offset, bits, status: 'fault', pa: null };
  const pa = pfn * pageSize + offset;
  if (!Number.isSafeInteger(pa)) throw new Error('Physical address มีค่ามากเกินช่วงที่คำนวณได้อย่างแม่นยำ');
  return { vpn, offset, bits, status: 'ok', pa };
}
export function translateSegment({ base, limit, offset }) {
  base = integer(base, 'Base'); limit = integer(limit, 'Limit'); offset = integer(offset, 'Offset');
  if (limit === 0) throw new Error('Limit ต้องมากกว่า 0 (นิยามเป็นความยาวของ segment)');
  if (offset >= limit) return { status: 'fault', pa: null, base, limit, offset };
  const pa = base + offset;
  if (!Number.isSafeInteger(pa)) throw new Error('Physical address มีค่ามากเกินช่วงที่คำนวณได้อย่างแม่นยำ');
  return { status: 'ok', pa, base, limit, offset };
}
export function splitAddress({ va, addressBits, offsetBits, innerBits }) {
  va = integer(va, 'Virtual address'); addressBits = integer(addressBits, 'Address bits');
  offsetBits = integer(offsetBits, 'Offset bits'); innerBits = integer(innerBits, 'Inner index bits');
  if (addressBits < 3 || addressBits > 48 || offsetBits < 1 || innerBits < 1 || offsetBits + innerBits >= addressBits) throw new Error('กำหนด 3 ส่วนให้มีอย่างน้อยส่วนละ 1 บิต และรวมไม่เกิน 48 บิต');
  if (va >= 2 ** addressBits) throw new Error('Virtual address เกินขอบเขตที่ระบุ');
  const outerBits = addressBits - offsetBits - innerBits;
  return { outerBits, outer: Math.floor(va / 2 ** (offsetBits + innerBits)), inner: Math.floor(va / 2 ** offsetBits) % 2 ** innerBits, offset: va % 2 ** offsetBits, binary: va.toString(2).padStart(addressBits, '0') };
}
