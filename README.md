# OS / study space
หน้าเว็บไซต์ = https://toxxy180.github.io/OS_Final/
เว็บภาษาไทยสำหรับทบทวนวิชา Operating Systems ก่อน Final จาก PDF ใน `OS_Files` ทั้ง 10 ไฟล์ รวมเป็น 8 บทตามเลข 01–08 รองรับข้อสอบแบบ open book A4 หน้าหลัง, multiple choice, เขียนอธิบาย และคำนวณ

## ใช้งาน

ต้องมี Node.js 22.12+ หรือ 24 และ npm

```bash
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ `http://127.0.0.1:5173`). สำหรับ build:

```bash
npm test
npm run build
npm run preview
```

`dist/` เป็นเว็บ static พร้อมนำไปโฮสต์ได้ ใช้ hash routing และ relative base จึงรองรับทั้ง root domain และ GitHub Pages project path. ไม่ควรเปิด `index.html` ด้วย file://; ใช้ HTTP server

## เนื้อหาและความสามารถ

- 8 บทอธิบายละเอียด พร้อมเป้าหมาย ตัวอย่าง ตาราง โค้ด เทคนิคจำ จุดสับสน ความเชื่อมโยง และลิงก์ PDF ต้นฉบับ
- แบบฝึกหัดบทละ 20 ข้อ รวม 160 ข้อ พร้อมเฉลยและเหตุผล ข้อเขียน/คำนวณให้ผู้เรียนตรวจตนเองตามแนวตอบและ rubric
- แผงเลือกข้อแสดงสถานะรอตรวจ / รอประเมิน / ทำได้ / ต้องทบทวน ข้อเขียนและคำนวณนับความคืบหน้าเมื่อประเมินตนเองแล้ว มือถือพับแผงเลือกข้อได้
- ค้นหาเนื้อหา ติดตามการอ่าน และบันทึกคำตอบใน localStorage (เฉพาะ browser/origin นั้น)
- Address Lab: paging, base/segment bounds, multilevel bit split; รับเลขฐานสิบและ hexadecimal ตรวจขอบเขตและสิทธิ์ พร้อมขั้นตอน
- ชีทสรุป 2 หน้า A4 (กระดาษหนึ่งแผ่นหน้าหลัง) พร้อมปุ่มพิมพ์ และ PDF ที่ `public/os-final-a4.pdf`
- ฟอนต์ Sarabun อยู่ใน bundle; ไม่เรียก Google Fonts, analytics หรือ API ภายนอก ไม่ต้องมี API key หรือฐานข้อมูล

คำตอบ/ความคืบหน้าอยู่ในเครื่อง ไม่มี server sync. เปลี่ยน browser, port, หรือ URL origin จะเป็นชุดความคืบหน้าคนละชุด

## ขึ้น GitHub Pages

Repository นี้ตั้ง remote เป็น `https://github.com/Toxxy180/OS_Final`. Workflow อยู่ใน `.github/workflows/deploy.yml`

1. Push โค้ดไป branch `main` หรือ `master` ของ repository (หรือปรับชื่อ branch ใน workflow)
2. ไปที่ repository **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. Workflow จะติดตั้ง dependencies, ทดสอบ, ตรวจเนื้อหา, build และ deploy โดยอัตโนมัติเมื่อ push หรือสั่ง Run workflow
4. เปิด URL ที่ workflow แสดง; สำหรับ repository ปัจจุบันโดยทั่วไปคือ `https://toxxy180.github.io/OS_Final/`

การเตรียมโปรเจกต์ไม่ได้หมายความว่าได้ push หรือ deploy แล้ว. ต้องดูผลจาก GitHub Actions เพื่อยืนยัน URL จริง

## พิมพ์ชีท

เปิดเมนู **ชีท A4** แล้วกดพิมพ์ หรือดาวน์โหลด PDF. เลือก A4 portrait, 100%, ปิด headers/footers ของเบราว์เซอร์ และ two-sided/flip on long edge. PDF มี 2 หน้า 210 × 297 mm. เมื่อแก้เนื้อหา Sheet.jsx ให้เปิด dev server แล้วเรียก `npm run export:sheet` ในอีก terminal (ต้องมี Chrome/Chromium/Edge; ตั้ง `CHROME_BIN` ได้). ตรวจ PDF 2 หน้าก่อน build ใหม่เพื่อให้ปุ่มดาวน์โหลดตรงกับหน้าเว็บ

## โครงสร้าง

```text
src/data/chapters-*.js     เนื้อหาและคลังคำถาม
src/pages/                ภาพรวม บทเรียน ข้อสอบ Lab และชีท
src/components/           โครงหน้าและส่วนประกอบร่วม
src/lib/address.js        ฟังก์ชันคำนวณที่ทดสอบได้
src/styles.css            จุดรวม stylesheet
src/styles/               ธีม โครงหน้า CSS รายหน้า responsive และ print A4
scripts/                  ตรวจข้อมูลและคัดลอก PDF เข้า build
tests/                    ทดสอบสูตร edge cases และการนับความคืบหน้าข้อสอบ
OS_Files/                 สไลด์ต้นฉบับ 10 ไฟล์
public/os-final-a4.pdf     ชีทพร้อมพิมพ์
```

## ขอบเขตและแหล่งข้อมูล

บท 04 รวม Concurrency และ Lab; บท 05 รวม Synchronization Part 1 และ Part 4 (ไม่มีไฟล์ Part 2/3 ในชุดต้นฉบับ). แบบฝึกหัดเป็นชุดฝึกที่เขียนขึ้นตามเนื้อหา ไม่ใช่ข้อสอบจริง. คำอธิบายเสริมและโจทย์ระบุสมมติฐานชัดเจน; หากโจทย์อาจารย์นิยามต่าง ให้ยึดโจทย์นั้น

ปรับจุดกำกวมของสไลด์ในเนื้อหา: response time เทียบ first-response/turnaround, SJF เทียบ SRTF, Banker เป็น avoidance, เงื่อนไขวงจรกราฟ deadlock และ 32-bit/4 KiB มี 2^20 PTE. TLB miss ไม่เท่ากับ page fault และ fault ไม่จำเป็นต้องอ่านดิสก์เสมอ

สไลด์ต้นฉบับคงชื่อและเครดิตเดิม; การรวมไว้เป็นแหล่งเรียนรู้ไม่ได้ให้สิทธิ์ใหม่ในสื่อเหล่านั้น. ฟอนต์และ dependencies มี license ของตนเองในแพ็กเกจ
