export const chapters0708 = [
  {
    id: '07',
    title: 'การแปลงที่อยู่หน่วยความจำ',
    english: 'Address Translation',
    subtitle: 'จากที่อยู่ที่โปรแกรมมองเห็น สู่ตำแหน่งจริงใน RAM พร้อมวิธีคิดโจทย์ทีละขั้น',
    minutes: 45,
    sources: [{ file: '07-address_v4.pdf', pages: 'หน้า 2–36' }],
    objectives: [
      'แยก virtual address, physical address, page และ frame ได้',
      'ตรวจขอบเขตและสิทธิ์ก่อนแปลง base/bounds หรือ segmentation',
      'คำนวณ VPN, offset, PFN และ physical address ทั้งฐานสิบและฐานสิบหก',
      'แบ่งบิตของ multilevel page table และประเมินขนาดตารางกับเวลาเข้าถึงได้',
      'อธิบายได้ว่า TLB miss ต่างจาก page fault อย่างไร'
    ],
    sections: [
      {
        id: 'address-view', title: '1. โปรแกรมกับฮาร์ดแวร์มองหน่วยความจำคนละแบบ',
        paragraphs: [
          'Virtual address (VA) คือที่อยู่ที่คำสั่งของโปรแกรมใช้อ้างอิง ส่วน Physical address (PA) คือที่อยู่จริงใน RAM การแปลงที่อยู่เกิดระหว่างการเข้าถึงหน่วยความจำ โดยฮาร์ดแวร์ MMU ใช้ข้อมูลการแปลงที่ OS จัดเตรียมไว้ กระบวนการนี้แปลงที่อยู่ ไม่ได้เปลี่ยนค่าข้อมูลที่เก็บอยู่',
          'แต่ละ Process มี address space ของตัวเอง ดังนั้น Process A และ B อ้าง VA เดียวกันได้ แต่ถูกแปลงไปคนละ PA การแยกพื้นที่ช่วยป้องกันโปรแกรมหนึ่งอ่านหรือเขียนหน่วยความจำของอีกโปรแกรม ขณะเดียวกัน OS สามารถตั้งให้บาง VA ของคนละ Process ชี้ frame เดียวกันเพื่อแบ่งปันข้อมูลหรือ shared library ได้'
        ],
        table: { headers: ['คำศัพท์', 'ความหมาย', 'เปรียบเทียบ'], rows: [
          ['Virtual address', 'ที่อยู่ในมุมมองของ Process', 'เลขห้องตามแผนผังของผู้เช่าแต่ละคน'],
          ['Physical address', 'ตำแหน่งจริงใน RAM', 'ตำแหน่งห้องจริงของอาคาร'],
          ['MMU', 'ฮาร์ดแวร์ช่วยแปลงที่อยู่และตรวจสิทธิ์', 'เจ้าหน้าที่ที่ใช้ผังเทียบเลขห้อง'],
          ['Page table', 'ตารางเชื่อม virtual page กับ physical frame', 'ทะเบียนว่าแต่ละหน้าอยู่ช่องไหน']
        ] },
        callout: { title: 'หลักที่ตามไปทุกบท', text: 'การแปลงที่อยู่ต้องรักษาทั้งตำแหน่งและสิทธิ์ แม้คำนวณ PA ได้ ก็ยังเข้าถึงไม่ได้หากสิทธิ์อ่าน/เขียน/รันไม่อนุญาต' }
      },
      {
        id: 'base-bounds', title: '2. Base & Bounds: บวกฐานหลังตรวจขอบเขต',
        paragraphs: [
          'วิธีง่ายที่สุดให้ Process มองพื้นที่เริ่มที่ 0 แล้วใช้ base บอกว่าพื้นที่จริงเริ่มตรงไหน และ limit บอกขนาดพื้นที่ที่อนุญาต ในบทนี้กำหนดว่า bound/limit คือความยาว ไม่ใช่ที่อยู่สุดท้าย จึงต้องตรวจ 0 ≤ VA < limit ก่อน แล้วคำนวณ PA = base + VA',
          'ข้อดีคือใช้ข้อมูลน้อยและแปลงเร็ว ย้าย Process ไปตำแหน่งใหม่ได้ด้วยการเปลี่ยน base ข้อจำกัดคือพื้นที่ทั้งก้อนต้องต่อเนื่อง แบ่งสิทธิ์ code กับ data ได้ไม่ละเอียด และขยาย heap/stack หรือแชร์เฉพาะบางส่วนได้ยาก'
        ],
        code: 'if (VA < 0 || VA >= limit) fault();\nelse PA = base + VA;',
        example: { title: 'ตรวจขอบก่อนบวก', problem: 'base = 12,000 bytes, limit = 2,000 bytes จงแปลง VA = 1,500 และ VA = 2,000', steps: ['VA 1,500 < 2,000 จึงอยู่ในช่วงที่อนุญาต', 'PA = 12,000 + 1,500 = 13,500', 'VA 2,000 เท่ากับ limit จึงอยู่นอกช่วง ช่วงที่ใช้ได้คือ 0–1,999'], answer: 'VA 1,500 → PA 13,500; VA 2,000 → fault' },
        callout: { title: 'จุดเสียคะแนนที่พบบ่อย', text: 'ถ้าโจทย์ใช้ bound เป็นที่อยู่ปลายช่วงแทนความยาว ต้องใช้ความหมายตามโจทย์เสมอ อย่าแทนสูตรโดยไม่ตรวจนิยาม' }
      },
      {
        id: 'segmentation', title: '3. Segmentation: แยกพื้นที่ตามหน้าที่ของโปรแกรม',
        paragraphs: [
          'Segmentation แบ่ง address space เป็นส่วนที่มีความหมาย เช่น code, data, heap และ stack โดยแต่ละ segment มี base, limit และสิทธิ์ของตัวเอง ที่อยู่จึงประกอบด้วย segment number และ offset ภายใน segment ให้เลือก entry ของ segment ตรวจว่า offset < limit และสิทธิ์อนุญาต แล้วค่อยบวก base + offset',
          'แต่ละ segment มีขนาดต่างกันได้ จึงแชร์ code หรือกำหนด code ให้รันได้แต่เขียนไม่ได้อย่างเป็นธรรมชาติ อย่างไรก็ตามแต่ละ segment ต้องได้พื้นที่จริงต่อเนื่อง เมื่อจัดสรรและคืนหลายครั้งอาจเหลือช่องว่างกระจัดกระจาย เรียกว่า external fragmentation แม้พื้นที่ว่างรวมพอ แต่ไม่มีช่องต่อเนื่องใหญ่พอ'
        ],
        example: { title: 'เลือก segment ให้ถูกก่อนคำนวณ', problem: 'Segment 2 มี base = 0x8000, limit = 0x600 และสิทธิ์ read/write ต้องการอ่าน offset = 0x234', steps: ['เลือกตาราง entry ของ segment 2', 'ตรวจ 0x234 < 0x600 และสิทธิ์ read อนุญาต', 'PA = 0x8000 + 0x234 = 0x8234'], answer: 'PA = 0x8234; ถ้าเขียนเข้า segment ที่มีเฉพาะ read จะ fault แม้ offset อยู่ในขอบเขต' }
      },
      {
        id: 'paging', title: '4. Paging: แบ่งเป็นก้อนขนาดเท่ากัน',
        paragraphs: [
          'Paging แบ่ง virtual memory เป็น page และแบ่ง physical memory เป็น frame ที่มีขนาดเท่ากัน page ที่ติดกันในมุมมองโปรแกรมไม่จำเป็นต้องอยู่ frame ติดกันจริง Page table entry (PTE) เก็บหมายเลข frame และสถานะ/สิทธิ์ที่เกี่ยวข้อง เช่น present และ writable',
          'การใช้ก้อนขนาดเท่ากันทำให้หา frame ว่างง่ายและหลีกเลี่ยง external fragmentation ในการจัดสรร frame แต่หน้าสุดท้ายอาจใช้ไม่เต็ม เรียกว่า internal fragmentation อีกต้นทุนหนึ่งคือต้องใช้พื้นที่เก็บ page table และใช้เวลาแปลที่อยู่'
        ],
        table: { headers: ['เปรียบเทียบ', 'Segmentation', 'Paging'], rows: [
          ['หน่วยแบ่ง', 'ส่วนตามความหมาย ขนาดแปรผัน', 'page ขนาดคงที่'],
          ['ที่อยู่', 'segment number + offset', 'VPN + offset'],
          ['พื้นที่จริง', 'แต่ละ segment ต่อเนื่อง', 'แต่ละ page ไป frame ใดก็ได้'],
          ['ปัญหาพื้นที่', 'External fragmentation', 'Internal fragmentation'],
          ['สิทธิ์/การแชร์', 'กำหนดตาม segment', 'กำหนดตาม page']
        ] }
      },
      {
        id: 'paging-formula', title: '5. สูตร Address Translation ที่ควรใส่ใน A4',
        paragraphs: [
          'ให้ขนาด page เป็น P bytes และระบบอ้างที่อยู่เป็น byte: VPN = floor(VA / P), offset = VA mod P จากนั้นอ่าน PTE[VPN] เพื่อหา PFN และตรวจสิทธิ์/present ถ้าแปลงได้ PA = PFN × P + offset สิ่งที่เปลี่ยนคือหมายเลข page เป็นหมายเลข frame ส่วน offset คงเดิม',
          'ถ้า P = 2^p ค่า offset ใช้ p บิตล่าง ส่วนบิตที่เหลือเป็น VPN ใช้ได้เหมือนกันทั้งฐานสิบและฐานสิบหก แต่ต้องแปลงให้เป็นหน่วย bytes ก่อน เช่น 1 KiB = 1,024 bytes และ 4 KiB = 4,096 bytes ห้ามนำ VPN มาแทน PFN โดยไม่ดู page table'
        ],
        code: 'VPN    = floor(VA / pageSize)\noffset = VA % pageSize\nPFN    = pageTable[VPN].frame\nPA     = PFN * pageSize + offset',
        example: { title: 'ตัวอย่างฐานสิบหกครบขั้นตอน', problem: 'VA = 0x1234, page size = 1 KiB และ PTE[4] ระบุ present = true, PFN = 9, read/write อนุญาต', steps: ['1 KiB = 1,024 = 0x400 bytes และ 0x1234 = 4,660', 'VPN = floor(4,660 / 1,024) = 4', 'offset = 4,660 mod 1,024 = 564 = 0x234', 'PTE[4] ให้ PFN = 9 จึงได้ฐาน frame = 9 × 1,024 = 0x2400', 'PA = 0x2400 + 0x234 = 0x2634 = 9,780'], answer: 'VA 0x1234 → VPN 4, offset 0x234 → PFN 9 → PA 0x2634' },
        callout: { title: 'เทคนิคตรวจคำตอบ', text: 'offset ต้องน้อยกว่าขนาด page และ PA mod P ต้องเท่ากับ VA mod P หากไม่เท่ากัน แสดงว่าบวกหรือแยกบิตผิด' }
      },
      {
        id: 'bits-table-size', title: '6. จำนวนบิต จำนวนหน้า และขนาด Page Table',
        paragraphs: [
          'ถ้า VA ยาว v บิต และ page size = 2^p bytes: offset = p บิต, VPN = v − p บิต และมี virtual pages ได้ 2^(v−p) หน้า หากใช้ page table ระดับเดียวเต็มพื้นที่ และ PTE หนึ่ง entry ยาว e bytes ขนาดตาราง = 2^(v−p) × e bytes',
          'ตัวอย่าง VA 32 บิต, page 4 KiB: offset = 12 บิต, VPN = 20 บิต จึงมี 2^20 = 1,048,576 entries ถ้า PTE = 4 bytes ตารางใหญ่ 4 MiB ต่อ Process ที่ใช้ตารางเต็มช่วง ตัวเลขนี้คำนวณตามสูตร และแก้ค่าประมาณ 500K entries ที่ปรากฏในสไลด์หน้า 23',
          'Physical address อาจยาวไม่เท่ากับ Virtual address ถ้า PA ยาว f+p บิต หมายเลข frame จะยาว f บิต จำนวน virtual pages กับ physical frames จึงไม่จำเป็นต้องเท่ากัน'
        ],
        example: { title: 'ฝึกนับบิตจากหน่วย', problem: 'VA 24 บิต, PA 20 บิต, page 4 KiB ต้องใช้บิตส่วนใดเท่าไร?', steps: ['4 KiB = 2^12 bytes → offset 12 บิต', 'VPN = 24 − 12 = 12 บิต', 'PFN = 20 − 12 = 8 บิต', 'จำนวน virtual pages = 2^12 = 4,096 และ physical frames = 2^8 = 256'], answer: 'VA = VPN 12 | offset 12; PA = PFN 8 | offset 12' }
      },
      {
        id: 'multilevel', title: '7. Multilevel Page Table: สร้างตารางเฉพาะส่วนที่ใช้',
        paragraphs: [
          'Address space มักมีพื้นที่ว่างมาก เช่น ช่วงระหว่าง heap กับ stack ถ้าสร้างตารางระดับเดียวเต็มช่วงจะสิ้นเปลือง Multilevel paging จัดตารางเป็นต้นไม้ ระดับบนชี้ตารางระดับล่าง และจัดสรรตารางย่อยเฉพาะบริเวณที่ใช้งานจริง จึงประหยัดกับ sparse address space',
          'ตัวอย่าง VA 32 บิต, page 4 KiB, PTE 4 bytes: ตารางหนึ่ง page บรรจุ 4,096/4 = 1,024 entries จึงใช้ index 10 บิต แบ่ง VA เป็น index ระดับ 1 จำนวน 10 บิต | index ระดับ 2 จำนวน 10 บิต | offset 12 บิต เริ่มจาก base ตารางระดับแรก เดินไปยัง entry ระดับสอง แล้วได้ PFN',
          'ข้อแลกเปลี่ยนคือเมื่อไม่มีผลแปลใน TLB ต้องอ่านตารางหลายครั้ง หากมี L ระดับและไม่คิด cache อื่น การแปลต้องอ่าน L entries แล้วจึงอ่านข้อมูลจริงอีก 1 ครั้ง ไม่ใช่อ่านทั้งหมดเพียง L ครั้ง'
        ],
        code: '32-bit VA = [ index1: 10 ][ index2: 10 ][ offset: 12 ]\nindex1 = floor(VA / 2^22)\nindex2 = floor(VA / 2^12) mod 2^10\noffset = VA mod 2^12',
        example: { title: 'แบ่งบิตสองระดับจากที่อยู่จริง', problem: 'VA = 0x12345678 แบ่ง 10|10|12 และ entry สุดท้ายชี้ PFN = 0x2AB', steps: ['index1 = 72 = 0x48', 'index2 = 837 = 0x345', 'offset = 1,656 = 0x678', 'ตรวจ entries ทั้งสองระดับและสิทธิ์ก่อนใช้ PFN', 'PA = 0x2AB × 0x1000 + 0x678 = 0x2AB678'], answer: 'index1 72, index2 837, offset 0x678; PA = 0x2AB678' }
      },
      {
        id: 'tlb', title: '8. TLB: แคชผลแปล ไม่ใช่แคชข้อมูลของโปรแกรม',
        paragraphs: [
          'Translation Lookaside Buffer (TLB) เป็นแคชของ mapping ระหว่าง virtual page กับ physical frame พร้อมข้อมูลสิทธิ์ เมื่อ hit ก็ใช้ผลแปลได้รวดเร็ว เมื่อ miss ต้องหาใน page table; ถ้า page ยังอยู่ RAM และสิทธิ์ถูกต้องก็เติม TLB แล้วดำเนินการต่อได้ โดยไม่ต้องอ่านดิสก์',
          'Page fault เป็นอีกเหตุการณ์หนึ่ง เช่น page ที่อนุญาตยังไม่ resident หรือการเข้าถึงขัดกับ protection ทั้งนี้ชื่อและเส้นทาง trap ขึ้นกับสถาปัตยกรรม ส่วน TLB miss บางเครื่องจัดการด้วย hardware page-table walk บางเครื่องใช้ software handler',
          'เมื่อเปลี่ยน Process ต้องป้องกันไม่ให้ mapping เก่าถูกใช้กับอีก address space ระบบอาจใช้ ASID/tag แยก Process หรือ invalidate entries ตามที่จำเป็น เมื่อ OS เปลี่ยน mapping ก็ต้องจัดการ TLB ที่เกี่ยวข้องให้สอดคล้องด้วย'
        ],
        table: { headers: ['เหตุการณ์', 'ความหมาย', 'สิ่งที่ต้องทำ'], rows: [
          ['TLB hit', 'มีผลแปลที่ใช้ได้ใน TLB', 'ตรวจสิทธิ์และใช้ PFN'],
          ['TLB miss, page present', 'TLB ไม่มี mapping แต่ page อยู่ RAM', 'เดินตารางและเติม TLB'],
          ['Page not present แต่เป็น mapping ที่ถูกต้อง', 'หน้าอาจอยู่ backing store หรือรอจัดสรร', 'Kernel จัดหา frame/ข้อมูลแล้วลองคำสั่งใหม่'],
          ['ผิดสิทธิ์หรือ unmapped', 'โปรแกรมเข้าถึงส่วนที่ไม่ได้รับอนุญาต', 'Kernel จัดการ fault; ไม่ใช่โหลดหน้าให้อัตโนมัติทุกกรณี']
        ] }
      },
      {
        id: 'translation-time', title: '9. คิดเวลา TLB: เขียนเส้นทาง Hit และ Miss ก่อน',
        paragraphs: [
          'สูตรขึ้นกับสมมติฐาน ต้องดูว่าเวลา TLB รวมกับ memory แบบขนานหรือเรียงลำดับ และมี page fault หรือไม่ สำหรับแบบจำลองเรียงลำดับ: TLB lookup = t, memory access = m, hit rate = h, page table L ระดับ และทุก page อยู่ RAM จะได้ hit cost = t+m และ miss cost = t+(L+1)m',
          'Effective Access Time (EAT) = h(t+m) + (1−h)[t+(L+1)m] = t+m+(1−h)Lm โดยรวมการอ่านข้อมูลจริงแล้ว ถ้าโจทย์ถามเฉพาะ translation overhead ให้ตัด m ของข้อมูลจริงออก เหลือ t+(1−h)Lm'
        ],
        example: { title: 'TLB แบบสองระดับ', problem: 'TLB 10 ns, memory 100 ns, hit rate 95%, page table 2 ระดับ ไม่มี page fault และไม่มี cache อื่น', steps: ['Hit = 10 + 100 = 110 ns', 'Miss = 10 + 2×100 + 100 = 310 ns', 'EAT = 0.95×110 + 0.05×310 = 120 ns'], answer: 'เวลาเฉลี่ยเข้าถึงข้อมูล = 120 ns; overhead เฉพาะการแปล = 20 ns' }
      },
      {
        id: 'translation-uses', title: '10. การแปลงที่อยู่เชื่อมไปสู่ Virtual Memory',
        paragraphs: [
          'การแปลงที่อยู่เป็นเครื่องมือมากกว่าการย้ายตำแหน่ง: OS ใช้มันแยก Process, แชร์ข้อมูล, แชร์ library, ทำ copy-on-write และทำ memory-mapped files ได้ ตัวอย่าง copy-on-write คือหลาย Process อ่าน frame เดียวกันได้ แต่เมื่อมีผู้เขียนจึงคัดลอกและเปลี่ยน mapping ให้คนนั้น',
          'บท 07 ตอบว่า VA ชี้ไปที่ไหนและเข้าถึงได้หรือไม่ บท 08 จะต่อคำถามว่า ถ้า page ที่ถูกต้องยังไม่อยู่ใน RAM จะเอามาอย่างไร และถ้า frame เต็มควรไล่หน้าไหนออก ทั้งสองบทใช้ page table ร่วมกัน แต่แก้ปัญหาคนละส่วน'
        ],
        bullets: ['Process isolation: mapping ของแต่ละ Process ควบคุมขอบเขตการเข้าถึง', 'Shared memory: หลาย mapping ชี้ frame เดียวกันได้ แต่ยังต้องใช้ Synchronization', 'Demand paging: เก็บเฉพาะหน้าที่กำลังใช้ใน RAM', 'Memory-mapped file: ผูกช่วง VA กับเนื้อหาไฟล์ ให้เข้าถึงผ่าน load/store']
      }
    ],
    connections: [
      { to: '02', label: 'Process protection', description: 'แต่ละ Process มี address space ของตัวเอง การแปลและตรวจสิทธิ์ทำให้การแยกโปรแกรมเกิดขึ้นจริง' },
      { to: '03', label: 'Trap เข้า Kernel', description: 'เมื่อแปลไม่ได้หรือผิดสิทธิ์ ฮาร์ดแวร์ส่งการควบคุมเข้า handler ของ Kernel' },
      { to: '05', label: 'Shared memory ยังต้องประสานงาน', description: 'แชร์ physical frame ได้ไม่ได้แปลว่าหลาย Thread เขียนพร้อมกันแล้วปลอดภัย' },
      { to: '08', label: 'จัดการหน้าที่ไม่อยู่ RAM', description: 'Present bit และ page table เป็นฐานของ demand paging และการแทนที่หน้า' }
    ],
    mnemonic: { phrase: 'หารหาเพจ · เศษคือจุด · เปิดตาราง · คูณแล้วบวก', meaning: 'หาร VA ด้วยขนาด page หา VPN; เก็บเศษเป็น offset; ใช้ page table หา PFN; PA = PFN×page size+offset และตรวจสิทธิ์ก่อนใช้เสมอ' },
    pitfalls: [
      'VPN กับ PFN ไม่จำเป็นต้องเท่ากัน ต้องอ่าน mapping จากโจทย์',
      'offset คงเดิม แต่บิตของ VPN และ PFN อาจยาวไม่เท่ากัน',
      'limit เป็นความยาว: offset = limit ผิดขอบเขตแล้ว',
      'TLB miss ไม่ได้หมายถึง page fault และไม่ได้แปลว่าต้องอ่านดิสก์',
      '32-bit address กับ page 4 KiB มี 2^20 entries ในตารางระดับเดียวเต็มช่วง',
      'EAT ที่รวม data access ต่างจากเวลาเฉพาะ address translation',
      'KiB = 1,024 bytes; อย่าใช้ 1,000 แทนในโจทย์แบ่งบิต'
    ],
    questions: [
      { id: '07-q01', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'Address translation เปลี่ยนสิ่งใดเป็นหลัก?', options: ['ค่าข้อมูลในตัวแปรเป็นรหัสเครื่อง', 'Virtual address เป็น Physical address', 'โปรแกรมทั้งหมดเป็น Kernel', 'หมายเลข Thread เป็น PID'], answerIndex: 1, answer: 'Virtual address เป็น Physical address', explanation: 'MMU ใช้ mapping ที่ OS จัดเตรียมเพื่อหาตำแหน่งจริงและตรวจสิทธิ์ ค่าข้อมูลที่จัดเก็บไม่ได้ถูกแปลงตามไปด้วย' },
      { id: '07-q02', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'Process A และ B ใช้ VA = 0x1000 เหมือนกัน ข้อใดถูกต้อง?', options: ['ต้องเข้าถึง PA เดียวกันเสมอ', 'เกิด race condition เสมอ', 'อาจเข้าถึงคนละ PA เพราะใช้ address space ต่างกัน', 'B ใช้ VA นี้ไม่ได้จนกว่า A จะจบ'], answerIndex: 2, answer: 'อาจเข้าถึงคนละ PA เพราะใช้ address space ต่างกัน', explanation: 'VA มีความหมายภายใน address space ของ Process การแชร์ frame ต้องเกิดจาก mapping ที่ OS ตั้งไว้ ไม่ได้เกิดเพียงเพราะเลข VA เท่ากัน' },
      { id: '07-q03', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'กำหนด limit เป็นความยาวของพื้นที่ เงื่อนไขใดถูกต้องก่อนใช้ base + offset?', options: ['0 ≤ offset < limit', '0 ≤ offset ≤ limit', 'offset > base', 'base < limit เท่านั้น'], answerIndex: 0, answer: '0 ≤ offset < limit', explanation: 'พื้นที่ยาว limit bytes เริ่ม offset 0 จึงจบที่ limit−1 หากเท่ากับ limit ถือว่าเกินขอบเขตหนึ่งตำแหน่ง' },
      { id: '07-q04', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'ปัญหาพื้นที่ว่างรวมพอ แต่ไม่มีช่วงต่อเนื่องใหญ่พอสำหรับ segment ใหม่ เรียกว่าอะไร?', options: ['Internal fragmentation', 'External fragmentation', 'TLB hit', 'Spatial locality'], answerIndex: 1, answer: 'External fragmentation', explanation: 'ช่องว่างอยู่ระหว่างก้อนที่จัดสรรแล้ว ส่วน internal fragmentation คือพื้นที่เหลือภายในก้อน เช่น page สุดท้ายใช้ไม่เต็ม' },
      { id: '07-q05', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'ส่วนใดคงค่าเดิมเมื่อเปลี่ยน VA เป็น PA ด้วย paging ขนาดหน้าเท่ากัน?', options: ['VPN', 'PFN', 'จำนวนบิตทั้ง address', 'Offset ภายในหน้า'], answerIndex: 3, answer: 'Offset ภายในหน้า', explanation: 'Page table เปลี่ยนตำแหน่งของทั้งหน้าไปยัง frame ใหม่ แต่ตำแหน่ง byte ภายในหน้ายังคงเดิม' },
      { id: '07-q06', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'เกิด TLB miss แต่ PTE ระบุ present และสิทธิ์อ่านอนุญาต โดย page อยู่ใน RAM ข้อใดถูกต้อง?', options: ['ต้องอ่านดิสก์ทุกครั้ง', 'ต้องยุติ Process ทันที', 'หา mapping จาก page table แล้วเข้าถึงข้อมูลได้', 'ต้องสร้าง Process ใหม่'], answerIndex: 2, answer: 'หา mapping จาก page table แล้วเข้าถึงข้อมูลได้', explanation: 'TLB เก็บเพียงผลแปลล่าสุด การไม่มี entry ใน TLB ไม่ได้หมายความว่า page ไม่อยู่ใน RAM' },
      { id: '07-q07', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'เหตุใด multilevel page table จึงเหมาะกับ sparse address space?', options: ['ไม่ต้องมี page table เลย', 'จัดสรรตารางย่อยเฉพาะช่วงที่ใช้ได้', 'ทำให้ทุก VA มี PA เท่ากัน', 'รับประกันว่าไม่มี TLB miss'], answerIndex: 1, answer: 'จัดสรรตารางย่อยเฉพาะช่วงที่ใช้ได้', explanation: 'ต้นไม้ของตารางไม่จำเป็นต้องสร้างกิ่งที่ไม่ได้ใช้งาน จึงลดพื้นที่เทียบกับตารางแบนที่ครอบคลุม VA ทั้งช่วง แต่ต้องแลกกับหลาย lookup เมื่อ TLB miss' },
      { id: '07-q08', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'PTE ระบุ present = true แต่ writable = false โปรแกรมพยายามเขียน ข้อใดถูกต้องที่สุด?', options: ['เขียนได้เพราะ page อยู่ RAM', 'การตรวจสิทธิ์ต้องปฏิเสธหรือ trap ให้ Kernel จัดการ', 'TLB จะเปลี่ยน writable เป็น true เองเสมอ', 'ต้องแทนที่หน้าด้วย FIFO ก่อนเขียน'], answerIndex: 1, answer: 'การตรวจสิทธิ์ต้องปฏิเสธหรือ trap ให้ Kernel จัดการ', explanation: 'Present กับ permission เป็นคนละเรื่อง Kernel อาจจัดการกรณีเฉพาะ เช่น copy-on-write หรือแจ้งข้อผิดพลาด แต่ไม่อนุญาตให้เขียนเพียงเพราะรู้ตำแหน่ง RAM' },
      { id: '07-q09', type: 'written', difficulty: 'พื้นฐาน', prompt: 'เปรียบเทียบ segmentation กับ paging ในแง่หน่วยแบ่งหน่วยความจำ การจัดสรรพื้นที่จริง และ fragmentation', answer: 'Segmentation แบ่งตามส่วนเชิงตรรกะและมีขนาดแปรผัน แต่ละ segment ต้องต่อเนื่อง จึงเสี่ยง external fragmentation ส่วน paging ใช้ page/frame ขนาดคงที่ แต่ละ page ไป frame ใดก็ได้ จึงหลีกเลี่ยง external fragmentation ของ frame แต่มี internal fragmentation ได้', explanation: 'ควรเชื่อมวิธีแบ่งพื้นที่กับสาเหตุของพื้นที่สูญเสีย แทนการจำชื่อปัญหาอย่างเดียว', rubric: ['ระบุ segment ขนาดแปรผันและ page ขนาดคงที่', 'อธิบายความต่อเนื่องของแต่ละ segment เทียบกับ frame ที่กระจายได้', 'แยก external/internal fragmentation พร้อมตัวอย่าง'] },
      { id: '07-q10', type: 'written', difficulty: 'ประยุกต์', prompt: 'อธิบายว่า TLB miss, page not present และการเข้าถึงผิดสิทธิ์ต่างกันอย่างไร', answer: 'TLB miss คือไม่มีผลแปลในแคช จึงต้องดู page table; page not present คือหน้านั้นยังไม่ resident หรือ mapping ไม่พร้อม ต้องให้ Kernel ตรวจว่าเป็นพื้นที่ที่อนุญาตหรือไม่; การผิดสิทธิ์คือชนิดการเข้าถึงไม่อนุญาต เช่น เขียน read-only page แม้หน้าอยู่ RAM ก็ fault ได้', explanation: 'ทั้งสามเหตุการณ์อยู่คนละชั้น จึงไม่ควรสรุปว่า miss ทุกชนิดต้องอ่านจากดิสก์', rubric: ['TLB เก็บ mapping ไม่ใช่ page data', 'กรณี not present ต้องตรวจ mapping ก่อนโหลด/จัดสรร', 'permission fault เกิดได้แม้ page อยู่ RAM'] },
      { id: '07-q11', type: 'written', difficulty: 'ประยุกต์', prompt: 'OS ทำให้สอง Process แชร์ข้อมูลบางส่วน แต่แยกส่วนที่เหลือออกจากกันด้วย page table ได้อย่างไร และยังต้องใช้ Synchronization หรือไม่?', answer: 'OS ตั้ง PTE ของช่วงที่แชร์ให้ชี้ physical frame เดียวกัน ส่วนช่วงอื่นชี้ frame ของแต่ละ Process พร้อมสิทธิ์ที่เหมาะสม หากหลาย Thread/Process แก้ข้อมูลที่แชร์พร้อมกันยังต้องประสานงาน เช่น Lock หรือ Semaphore', explanation: 'Address translation ควบคุมว่าเข้าถึงอะไรได้ ส่วน synchronization ควบคุมลำดับการใช้ข้อมูลร่วมกัน จึงทำหน้าที่เสริมกัน', rubric: ['หลาย virtual mappings ชี้ frame เดียวกัน', 'ส่วน private ใช้ frame/permissions แยกกัน', 'อธิบายว่ายังมี race condition ได้เมื่อแชร์ writable data'] },
      { id: '07-q12', type: 'written', difficulty: 'ประยุกต์', prompt: 'เหตุใดเพิ่มระดับของ page table อาจลดการใช้หน่วยความจำ แต่เพิ่มเวลาเข้าถึงเมื่อ TLB miss?', answer: 'ตารางหลายระดับละกิ่งที่ไม่ใช้ได้ จึงประหยัดเมื่อ address space เบาบาง แต่การหา PFN ต้องตาม pointer ผ่านแต่ละระดับ ทำให้จำนวน memory lookups เพิ่มขึ้น TLB ช่วยหลีกเลี่ยงการเดินต้นไม้นี้เมื่อ hit', explanation: 'เป็น trade-off ระหว่างพื้นที่กับเวลา ไม่ได้หมายความว่าตารางหลายระดับประหยัดทุก workload หรือช้าทุก access', rubric: ['อธิบายการละตารางย่อยที่ไม่ใช้', 'อธิบายการเดินตารางหลายระดับ', 'ระบุบทบาท TLB และความขึ้นกับ workload'] },
      { id: '07-q13', type: 'calculation', difficulty: 'พื้นฐาน', prompt: 'Base & bounds: base = 12,000 bytes, limit = 2,000 bytes (เป็นความยาว) จงหา PA ของ VA = 1,500 และพิจารณา VA = 2,000', answer: 'VA 1,500 → PA 13,500; VA 2,000 → fault', explanation: 'ตรวจขอบเขตก่อนบวก base ค่าเท่ากับ limit อยู่นอกช่วงที่อนุญาตแล้ว', steps: ['ช่วง VA ที่ใช้ได้คือ 0–1,999', '1,500 < 2,000 จึง PA = 12,000 + 1,500 = 13,500', '2,000 ≥ limit จึง fault และไม่ใช้ผลบวกเป็นที่อยู่ที่เข้าถึงได้'] },
      { id: '07-q14', type: 'calculation', difficulty: 'พื้นฐาน', prompt: 'Segment 2 มี base = 0x8000, limit = 0x600 bytes และอ่านได้ จงแปลง (segment 2, offset 0x234) และตัดสิน offset 0x600', answer: 'Offset 0x234 → PA 0x8234; offset 0x600 → fault', explanation: 'ต้องเลือก segment entry ก่อน และตรวจ offset เทียบกับความยาวของ segment ไม่ใช่เทียบกับ base', steps: ['0x234 < 0x600 จึงอยู่ในขอบเขต', 'PA = 0x8000 + 0x234 = 0x8234', '0x600 = limit จึงเกินขอบเขตที่สิ้นสุดที่ 0x5FF'] },
      { id: '07-q15', type: 'calculation', difficulty: 'พื้นฐาน', prompt: 'ระบบ byte-addressable มี page size 1,024 bytes, VA = 5,000 และ PTE[4] ระบุ PFN = 7, present และสิทธิ์ถูกต้อง จงหา VPN, offset และ PA', answer: 'VPN = 4, offset = 904 bytes, PA = 8,072', explanation: 'ใช้เลข frame จาก page table ไม่ใช่เลข virtual page ในสูตร PA', steps: ['VPN = floor(5,000 / 1,024) = 4', 'offset = 5,000 − 4×1,024 = 904', 'PFN = 7 จาก PTE[4]', 'PA = 7×1,024 + 904 = 8,072'] },
      { id: '07-q16', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'VA = 0x1234, page size = 1 KiB และ VPN 4 map ไป PFN 9 โดยสิทธิ์ถูกต้อง จงหา PA ทั้งฐานสิบหกและฐานสิบ', answer: 'PA = 0x2634 = 9,780', explanation: '1 KiB = 0x400 ไม่ใช่ 0x1000; จำนวนบิต offset คือ 10 บิต จึงห้ามตัด hex 3 หลักล่างแบบ page 4 KiB', steps: ['VA = 4,660 และ page size = 1,024', 'VPN = 4, offset = 564 = 0x234', 'PA = 9×1,024 + 564 = 9,780 = 0x2634'] },
      { id: '07-q17', type: 'calculation', difficulty: 'พื้นฐาน', prompt: 'VA ยาว 24 บิต, PA ยาว 20 บิต, page size 4 KiB จงหาบิตของ offset, VPN, PFN และจำนวน virtual pages/physical frames', answer: 'Offset 12 บิต; VPN 12 บิต; PFN 8 บิต; virtual pages 4,096; physical frames 256', explanation: 'Offset มาจากขนาดหน้า จึงยาวเท่ากันใน VA/PA ส่วนหมายเลข page กับ frame ใช้บิตที่เหลือของ address แต่ละชนิด', steps: ['4 KiB = 2^12 bytes → offset 12 บิต', 'VPN = 24−12 = 12 บิต → 2^12 = 4,096 หน้า', 'PFN = 20−12 = 8 บิต → 2^8 = 256 frames'] },
      { id: '07-q18', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'VA 0x12345678 ใช้ตารางสองระดับแบบ 10|10|12 บิต จงหา index1, index2, offset และ PA เมื่อ PTE สุดท้ายให้ PFN = 0x2AB (entries/permissions ใช้ได้ทั้งหมด)', answer: 'index1 = 72 (0x48), index2 = 837 (0x345), offset = 1,656 (0x678), PA = 0x2AB678', explanation: 'ต้องแบ่งตามจำนวนบิต ไม่ใช่แบ่งตัวเลข hex แบบเท่าๆ กัน เพราะ index 10 บิตไม่ตรงกับจำนวนหลัก hex เต็ม', steps: ['index1 = floor(VA / 2^22) = 72', 'index2 = floor(VA / 2^12) mod 2^10 = 837', 'offset = VA mod 2^12 = 0x678', 'PA = 0x2AB×0x1000 + 0x678 = 0x2AB678'] },
      { id: '07-q19', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'VA 32 บิต, page 4 KiB, PTE 4 bytes ใช้ตารางระดับเดียวเต็มช่วง จงหาจำนวน entries และขนาดตารางต่อ Process', answer: '1,048,576 entries และ 4,194,304 bytes = 4 MiB', explanation: 'นับ virtual pages จากพื้นที่ VA ทั้งหมด ไม่ใช่นับจำนวน physical frames หรือขนาด RAM', steps: ['page 4 KiB = 2^12 bytes', 'จำนวน entries = 2^32 / 2^12 = 2^20 = 1,048,576', 'ขนาดตาราง = 2^20×4 = 2^22 bytes = 4 MiB'] },
      { id: '07-q20', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'TLB lookup 10 ns, memory access 100 ns, hit rate 95%, page table 2 ระดับ ไม่มี page fault/cache อื่น และ lookup เรียงลำดับ จงหา EAT รวมอ่านข้อมูลจริง', answer: 'EAT = 120 ns', explanation: 'TLB miss ต้องอ่าน PTE สองระดับและข้อมูลจริงหนึ่งครั้ง อย่าลืมคิดเวลาอ่านข้อมูลจริงในทั้ง hit และ miss', steps: ['Hit = 10 + 100 = 110 ns', 'Miss = 10 + 2×100 + 100 = 310 ns', 'EAT = 0.95×110 + 0.05×310 = 120 ns'] }
    ]
  },
  {
    id: '08',
    title: 'หน่วยความจำเสมือน',
    english: 'Virtual Memory',
    subtitle: 'ทำให้โปรแกรมใช้พื้นที่ได้มากกว่า RAM ที่มี ด้วยการนำหน้าเข้าเมื่อจำเป็นและเลือกหน้าออกอย่างมีเหตุผล',
    minutes: 40,
    sources: [{ file: '08-Virtual memory_v3.pdf', pages: 'หน้า 2–27' }],
    objectives: [
      'อธิบาย temporal/spatial locality และความต่างของ write-through/write-back',
      'เรียงขั้นตอนจัดการ demand page fault ได้ โดยแยกจาก TLB miss',
      'ใช้ dirty/use bits อธิบายการเลือกและนำหน้าออกจาก RAM',
      'จำลอง FIFO, LRU, MIN และอธิบาย Clock/LFU/Belady’s anomaly',
      'คำนวณ page faults และ EAT โดยใช้หน่วยและสมมติฐานถูกต้อง'
    ],
    sections: [
      {
        id: 'hierarchy-locality', title: '1. ทำไม Cache และ Virtual Memory จึงใช้ได้ผล',
        paragraphs: [
          'หน่วยความจำมีหลายชั้น: Register และ CPU cache เข้าถึงเร็วแต่เล็ก ส่วน RAM ใหญ่ขึ้นและช้าลง ขณะที่ storage เช่น SSD เก็บข้อมูลได้มากและคงอยู่หลังปิดเครื่อง แต่เข้าถึงช้ากว่า RAM มาก ระบบจึงเก็บสิ่งที่คาดว่าจะใช้อีกไว้ในชั้นที่เร็วกว่า',
          'Temporal locality คือแนวโน้มกลับมาใช้ตำแหน่งเดิมในเวลาใกล้กัน เช่น ตัวนับและคำสั่งใน loop ส่วน Spatial locality คือแนวโน้มใช้ตำแหน่งข้างเคียง เช่น เดิน array ตามลำดับ การนำข้อมูลเข้ามาเป็น block/page ช่วยให้การเข้าถึงครั้งต่อๆ ไปได้ประโยชน์',
          'Hit คือข้อมูลที่ต้องการอยู่ในชั้นที่กำลังตรวจ ส่วน miss คือไม่มีที่ชั้นนั้น คำว่า miss ต้องระบุชั้นด้วย: CPU cache miss, TLB miss และ page fault ไม่ใช่เหตุการณ์เดียวกัน'
        ],
        table: { headers: ['แนวคิด', 'จำง่ายๆ', 'ตัวอย่าง'], rows: [
          ['Temporal locality', 'เพิ่งใช้ มักใช้ซ้ำ', 'วน loop ใช้คำสั่งและตัวแปรเดิม'],
          ['Spatial locality', 'ใช้ตรงนี้ มักใช้ใกล้ๆ', 'อ่าน array[i] แล้ว array[i+1]'],
          ['TLB cache', 'เก็บผลแปลที่อยู่', 'VPN → PFN'],
          ['Data cache', 'เก็บข้อมูล/คำสั่ง', 'สำเนาข้อมูลจาก RAM'],
          ['RAM ใน demand paging', 'เก็บหน้าที่กำลังใช้งาน', 'บางหน้ามาจากไฟล์หรือ swap']
        ] }
      },
      {
        id: 'write-policy', title: '2. Write-through กับ Write-back',
        paragraphs: [
          'Write-through ส่งการเปลี่ยนแปลงไปยังชั้นถัดไปทุกครั้งที่เขียน ทำให้สำเนาชั้นล่างตามทันง่าย แต่มีการส่งข้อมูลบ่อย ส่วน write-back แก้เฉพาะสำเนาชั้นบนก่อนและทำเครื่องหมาย dirty แล้วค่อยส่งกลับเมื่อจำเป็น เช่น ก่อนนำก้อนนั้นออก หรือเมื่อมีคำขอให้ flush',
          'แนวคิดนี้ช่วยเข้าใจ dirty page ของ virtual memory: ถ้าหน้าเปลี่ยนจากข้อมูล backing store ต้องเก็บการเปลี่ยนแปลงก่อนทิ้งเพื่อไม่ให้ข้อมูลหาย แต่ clean page ที่มีสำเนาถูกต้องใน backing store อยู่แล้วอาจนำออกโดยไม่เขียนกลับได้'
        ],
        callout: { title: 'Dirty ไม่ได้แปลว่าเสีย', text: 'Dirty แปลว่าถูกแก้ไขและอาจต่างจากสำเนาชั้นล่าง เป็นข้อมูลติดตามสถานะ ไม่ใช่ความผิดพลาดของข้อมูล' }
      },
      {
        id: 'demand-paging', title: '3. Demand Paging: โหลดเฉพาะหน้าที่ต้องใช้',
        paragraphs: [
          'Virtual memory ให้ Process เห็นพื้นที่เสมือนที่แยกจากขนาด RAM จริง จึงไม่จำเป็นต้องนำทุกหน้าของโปรแกรมเข้า RAM ก่อนเริ่มทำงาน Demand paging นำหน้ามาเมื่อมีการอ้างถึง ส่วนหน้าที่ยังไม่ต้องใช้เก็บไว้ที่ backing store หรือรอสร้างตามชนิด mapping',
          'เมื่อโปรแกรมเข้าถึงหน้าที่ไม่ present ฮาร์ดแวร์ trap เข้า Kernel ให้ตรวจที่อยู่และสิทธิ์ก่อน ถ้าเป็นการเข้าถึงที่ถูกต้อง เช่น หน้าไฟล์ที่ยังไม่โหลด ก็จัดหา frame และเติมข้อมูล จากนั้นอัปเดต mapping และเริ่มคำสั่งที่ fault ใหม่',
          'Page fault ไม่ได้แปลว่าต้องอ่านดิสก์ทุกครั้ง: anonymous page ใหม่อาจได้ frame ที่เติมศูนย์, copy-on-write อาจคัดลอกข้อมูลจาก RAM และหน้าที่อยู่ใน page cache อาจนำมา map ได้ การอ้าง unmapped address หรือผิดสิทธิ์อาจเป็นข้อผิดพลาดแทนการเติมหน้า'
        ],
        bullets: ['Virtual memory คือกลไกและ abstraction ของพื้นที่เสมือน', 'Demand paging คือเทคนิคเลื่อนการนำหน้าเข้าจนกว่าจะต้องใช้', 'RAM มีขนาดจำกัด จึงต้องตัดสินใจว่าจะเก็บหน้าใดไว้', 'การใช้งานที่มี locality ดีทำให้เก็บ working set ที่ใช้งานจริงได้คุ้มค่า']
      },
      {
        id: 'fault-sequence', title: '4. เส้นทาง Page Fault ทีละขั้น',
        paragraphs: [
          'ตัวอย่างที่หน้านั้นเป็นข้อมูลไฟล์บนดิสก์และยังไม่มีสำเนาใน RAM: เริ่มจากตรวจ TLB หาก miss จึงเดิน page table เมื่อพบว่าไม่ present เกิด fault เข้า Kernel จากนั้น Kernel ตรวจว่าที่อยู่ถูกต้องและการเข้าถึงอนุญาตก่อนดำเนินการ',
          'Kernel หา frame ว่าง ถ้าไม่มีต้องเลือก victim และจัดการข้อมูลเก่าตามความจำเป็น แล้วส่งคำขอ I/O อ่านข้อมูลเข้า frame ระหว่างรอ Process ที่ fault อาจถูก block เพื่อให้ CPU รันงานอื่น เมื่อ I/O จบจึงตั้ง PTE/present และ TLB ให้สอดคล้อง ปลุกงานให้พร้อม แล้วลองคำสั่งเดิมอีกครั้ง'
        ],
        code: 'อ้าง VA → TLB / page-table lookup\nไม่ present → trap เข้า Kernel\nตรวจ mapping และ permission\nหา frame (เลือก victim หากเต็ม)\nเก็บ dirty victim หากจำเป็น → นำข้อมูลเข้า\nอัปเดต PTE / จัดการ TLB → งานกลับมา ready\nเมื่อได้ CPU → retry คำสั่งที่ fault',
        callout: { title: 'จุดเชื่อมหลายบท', text: 'Page fault ใช้การแปลที่อยู่จากบท 07, trap เข้า Kernel จากบท 03 และการ block/ready กับ scheduling จากบท 04/06 ในเหตุการณ์เดียว' }
      },
      {
        id: 'page-bits', title: '5. Present, Dirty และ Use/Reference Bit',
        paragraphs: [
          'Present/resident bit บอกว่าใช้ mapping ไปยัง frame ที่พร้อมเข้าถึงได้หรือไม่ Dirty/modified bit ติดตามว่ามีการแก้ข้อมูลที่อาจต้องเขียนกลับ ส่วน use/reference bit ช่วยบอกว่าเคยถูกอ้างถึงในช่วงที่ติดตามหรือไม่ OS ใช้ข้อมูลนี้ประกอบการเลือก victim',
          'รายละเอียดว่าบิตใดตั้งโดย hardware, อยู่ที่ไหน และเมื่อไรขึ้นกับสถาปัตยกรรม แนวคิดที่ต้องจำคือ dirty บอกเรื่องการแก้ไข ส่วน reference บอกเรื่องการใช้งานล่าสุด บิต reference ที่เป็น 1 ไม่ได้แปลว่าหน้าถูกเขียน',
          'ถ้า frame ถูกแชร์หลาย mapping ต้องติดตาม references ที่เกี่ยวข้องทั้งหมด ก่อนนำ frame ออก OS ต้องเปลี่ยน PTE และ invalidate TLB entries ที่ชี้หน้าเดิมอย่างถูกต้อง มิฉะนั้นอาจมีผู้ใช้ mapping เก่าไปอ่านข้อมูลของ frame ที่ถูกนำกลับมาใช้ใหม่'
        ],
        table: { headers: ['สถานะ', 'บอกอะไร', 'ใช้ตัดสินใจ'], rows: [
          ['Present', 'หน้า resident และ mapping พร้อมใช้ตามนิยามระบบ', 'เข้าถึงต่อหรือเข้า fault handler'],
          ['Dirty', 'ถูกเขียน/ต่างจากสำเนาที่เก็บไว้', 'ต้องรักษาการเปลี่ยนแปลงก่อน eviction หรือไม่'],
          ['Reference / Use', 'ถูกอ้างถึงในช่วงที่ติดตาม', 'ประมาณความใหม่ในการใช้งานสำหรับ replacement']
        ] }
      },
      {
        id: 'mapped-files', title: '6. Memory-mapped Files: เปิดไฟล์เป็นช่วงหน่วยความจำ',
        paragraphs: [
          'การอ่านแบบ read/write ใช้ system call ย้ายข้อมูลผ่าน buffer ตามรูปแบบ API ส่วน memory-mapped file ผูกช่วง virtual address กับส่วนของไฟล์ โปรแกรมจึงอ่าน/แก้ผ่าน load/store เหมือนข้อมูลในหน่วยความจำ เมื่อหน้าไฟล์ที่ต้องการยังไม่พร้อม Kernel จัดการนำข้อมูลมาให้ผ่านกลไก fault',
          'ข้อดีคือเขียนโค้ดเข้าถึงไฟล์ใหญ่ได้สะดวก เริ่มใช้บางส่วนก่อนโหลดทั้งหมดได้ และอาจลดการคัดลอกระหว่าง buffer แบบเดิมได้ หากหลาย Process map แบบ shared ก็ใช้สื่อสารกันได้ แต่ยังต้องตกลง synchronization และวิธีทำให้การเปลี่ยนแปลงคงอยู่ตาม API ของระบบ',
          'การ map ไฟล์ไม่ได้แปลว่าไฟล์ทั้งก้อนอยู่ใน RAM ทันที และการเขียนผ่าน mapping ก็ไม่ได้รับประกันว่าข้อมูลถึงดิสก์ทันทีทุกครั้ง'
        ]
      },
      {
        id: 'replacement-policies', title: '7. เลือกหน้าออก: FIFO, MIN, LRU และ LFU',
        paragraphs: [
          'เมื่อเกิด fault และไม่มี frame ว่าง ต้องเลือก victim เป้าหมายคือหลีกเลี่ยงการเอาหน้าที่จะใช้อีกเร็วๆ นี้ออก แต่ OS ไม่รู้อนาคต จึงต้องใช้นโยบายประมาณจากข้อมูลที่มี',
          'FIFO เลือกหน้าที่เข้ามาเก่าสุด โดย hit ไม่เปลี่ยนคิว; LRU เลือกหน้าที่ไม่ได้ถูกใช้มานานที่สุด โดยทุก hit ต้องอัปเดตความใหม่; MIN/OPT เลือกหน้าที่จะถูกใช้ครั้งถัดไปไกลที่สุดในอนาคต จึงเป็นเกณฑ์ที่ดีที่สุดสำหรับ reference string ที่รู้ล่วงหน้า แต่ใช้จริงทั่วไปไม่ได้; LFU เลือกหน้าที่ถูกใช้น้อยที่สุดตามตัวนับ/ช่วงเวลาที่กำหนด'
        ],
        table: { headers: ['นโยบาย', 'มองข้อมูลอะไร', 'ข้อควรจำ'], rows: [
          ['FIFO', 'เวลาเข้ามาใน RAM', 'Hit ไม่ย้ายลำดับ; อาจเกิด Belady'],
          ['LRU', 'เวลาถูกใช้ล่าสุดในอดีต', 'Hit เปลี่ยนความใหม่; ติดตามให้แม่นมีต้นทุน'],
          ['MIN / OPT', 'การใช้ครั้งถัดไปในอนาคต', 'เลือกไกลที่สุดหรือไม่ใช้แล้ว; ใช้เป็นเกณฑ์เทียบ'],
          ['LFU', 'ความถี่ของการใช้', 'ต้องกำหนดช่วงนับ/aging และกติกาเมื่อคะแนนเท่ากัน'],
          ['Clock', 'reference bit กับเข็มวงกลม', 'ประมาณความใหม่โดยต้นทุนต่ำกว่า LRU แบบเป๊ะ']
        ] },
        callout: { title: 'ข้อสอบต้องเขียนกติกาเสมอ', text: 'ระบุจำนวน frames, เริ่มว่างหรือไม่, reference string และ tie-break กรณีเลือก victim ได้หลายหน้า จะทำให้ตารางและคำตอบตรวจสอบได้' }
      },
      {
        id: 'replacement-example', title: '8. ทำตาราง Page Replacement ให้ไม่หลง',
        paragraphs: [
          'เริ่มจากเขียน reference string เป็นคอลัมน์ แล้วเก็บสถานะ frames หลังการเข้าถึงแต่ละครั้ง ถ้า page อยู่แล้วให้ทำเครื่องหมาย hit และอัปเดต metadata ตามนโยบาย ถ้าไม่อยู่ให้ fault เพิ่มหนึ่งครั้ง ใช้ช่องว่างก่อน และเลือก victim เมื่อเต็ม',
          'สำหรับ reference string 1, 2, 3, 1, 4, 2, 5 โดยมี 3 frames เริ่มว่าง FIFO fault 5 ครั้ง ส่วน LRU fault 6 ครั้ง ตัวอย่างนี้แสดงว่า LRU ไม่จำเป็นต้องชนะ FIFO ในทุก reference string แม้มักเหมาะกับ temporal locality'
        ],
        table: { headers: ['Page ที่เรียก', 'FIFO frames หลังเรียก', 'FIFO', 'LRU frames หลังเรียก', 'LRU'], rows: [
          ['1', '[1, –, –]', 'Fault', '[1, –, –]', 'Fault'],
          ['2', '[1, 2, –]', 'Fault', '[1, 2, –]', 'Fault'],
          ['3', '[1, 2, 3]', 'Fault', '[1, 2, 3]', 'Fault'],
          ['1', '[1, 2, 3]', 'Hit', '[1, 2, 3]', 'Hit'],
          ['4', '[4, 2, 3]', 'Fault', '[1, 4, 3]', 'Fault'],
          ['2', '[4, 2, 3]', 'Hit', '[1, 4, 2]', 'Fault'],
          ['5', '[4, 5, 3]', 'Fault', '[5, 4, 2]', 'Fault']
        ] },
        callout: { title: 'จำ FIFO กับ LRU ให้แยก', text: 'FIFO ถาม “ใครเข้าก่อน?” ส่วน LRU ถาม “ใครไม่ได้ใช้มานาน?” การ hit หน้าเก่าจึงเปลี่ยนคำตอบของ LRU ได้ แต่ไม่เปลี่ยนคิว FIFO' }
      },
      {
        id: 'clock-belady', title: '9. Clock และ Belady’s Anomaly',
        paragraphs: [
          'Clock จัด frames เป็นวงกลม มีเข็มชี้ candidate และ reference bit เมื่อจะหาหน้าออก ถ้า bit เป็น 1 ให้เปลี่ยนเป็น 0 แล้วเลื่อนไป ถือว่าให้โอกาสอีกครั้ง ถ้าเจอ bit 0 ให้เลือกหน้านั้นเป็น victim จึงประมาณ “ไม่ได้ใช้เมื่อเร็วๆ นี้” โดยไม่ต้องเรียงลำดับทุก access แบบ LRU ที่แม่นยำ',
          'Belady’s anomaly คือบางนโยบายอาจมี page faults เพิ่มขึ้นเมื่อเพิ่มจำนวน frames สำหรับ reference string เดิม FIFO เกิดได้ เช่น 1,2,3,4,1,2,5,1,2,3,4,5: 3 frames ได้ 9 faults แต่ 4 frames ได้ 10 faults เมื่อเริ่มว่างทั้งคู่',
          'LRU และ MIN มี stack property จึงไม่เกิด anomaly แบบนี้ภายใต้สมมติฐานมาตรฐาน คำว่า “เพิ่ม RAM แล้วแย่ลง” จึงต้องระบุว่าเป็นผลของนโยบาย/reference string ใด ไม่ใช่ข้อสรุปว่าความจุมากขึ้นทำให้ระบบช้าลงเสมอ'
        ]
      },
      {
        id: 'eat-pagefault', title: '10. EAT: Fault น้อยมากก็ยังมีผลมาก',
        paragraphs: [
          'กำหนด p เป็นโอกาส page fault ต่อ memory reference, M เป็นเวลาทั้งหมดของ access ที่ไม่ fault และ F เป็นเวลาทั้งหมดของ access ที่ fault รวม service และการลองใหม่แล้ว จะได้ EAT = (1−p)M + pF ต้องใช้หน่วยเดียวกันก่อนแทนค่า',
          'ถ้าโจทย์ให้ F เป็นแค่ “penalty เพิ่มเติม” แทนเวลารวม สูตรจะเป็น EAT = M + pF อย่าสลับนิยาม เพราะจะนับเวลาซ้ำหรือขาดได้ เมื่อ fault ต้องทำ I/O เวลาระดับ millisecond ใหญ่กว่า memory access ระดับ nanosecond มาก จึงต้องควบคุม fault rate ให้ต่ำ',
          'หากหน้าที่กำลังใช้จริงของทุกงานรวมกันเกิน RAM มาก อาจสลับนำหน้าเข้าออกถี่จนใช้เวลาส่วนใหญ่กับ paging เรียกว่า thrashing แนวคิดนี้ช่วยเชื่อมว่า locality, replacement และจำนวนงานที่รันพร้อมกันมีผลร่วมกัน'
        ],
        example: { title: 'แปลงหน่วยก่อนคำนวณ', problem: 'Access ไม่ fault ใช้ 100 ns, access ที่ fault ใช้เวลารวม 8 ms, p = 0.000001', steps: ['8 ms = 8,000,000 ns', 'EAT = (1−0.000001)×100 + 0.000001×8,000,000', 'EAT = 99.9999 + 8 = 107.9999 ns'], answer: 'ประมาณ 108 ns หรือช้ากว่า 100 ns ประมาณ 8% แม้ fault เพียงหนึ่งในล้านครั้ง' }
      }
    ],
    connections: [
      { to: '07', label: 'VA → PTE → PFN', description: 'Virtual memory ใช้ page table และ present/permission bits ที่เรียนใน Address Translation' },
      { to: '03', label: 'Fault คือการเข้า Kernel', description: 'การ fault ใช้ trap handler ตรวจและซ่อมสถานะ ก่อน retry คำสั่งเดิมเมื่อทำได้' },
      { to: '06', label: 'รอ I/O แล้วให้ CPU งานอื่น', description: 'งานที่รออ่านหน้าอาจ block และ scheduler เลือกงานที่ ready มาทำต่อ' },
      { to: '05', label: 'แชร์ mapping ต้องจัดลำดับ', description: 'Memory-mapped files แบบ shared ทำให้เห็นข้อมูลร่วมกัน แต่ยังต้องป้องกัน race condition' }
    ],
    mnemonic: { phrase: 'FIFO ดูเข้า · LRU ดูใช้ · MIN ดูหน้า · Dirty ดูเขียน', meaning: 'FIFO ดูว่าใครเข้ามาก่อน; LRU ดูว่าใครใช้ล่าสุดไกลที่สุดในอดีต; MIN มองการใช้ครั้งหน้าที่ไกลที่สุด; Dirty บอกว่ามีการเขียนที่ต้องรักษาก่อนทิ้ง' },
    pitfalls: [
      'TLB miss, data cache miss และ page fault เป็นคนละเหตุการณ์',
      'Page fault ไม่ได้ต้องอ่านดิสก์ทุกครั้ง และ unmapped/protection fault อาจเป็นข้อผิดพลาด',
      'FIFO ไม่อัปเดตคิวเมื่อ hit แต่ LRU ต้องอัปเดตความใหม่ทุก access',
      'MIN ดูอนาคต ส่วน LRU ดูอดีต อย่าสลับกัน',
      'Dirty page อาจต้องเขียนกลับ; clean page ที่มี backing copy ถูกต้องมักไม่ต้องเขียนกลับ',
      'LFU ต้องระบุกติกาตัวนับและ tie-break จึงจะคำนวณคำตอบเดียวได้',
      'เพิ่ม frames ไม่รับประกัน fault ลดลงสำหรับ FIFO',
      'สูตร EAT ต้องบอกว่าเวลา fault เป็นเวลารวมหรือ penalty เพิ่ม และแปลง ms เป็น ns'
    ],
    questions: [
      { id: '08-q01', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'โปรแกรมวน loop อ่านตัวแปรเดิมซ้ำๆ แสดง locality ชนิดใดเด่นที่สุด?', options: ['Temporal locality', 'Spatial locality เท่านั้น', 'External fragmentation', 'Deadlock'], answerIndex: 0, answer: 'Temporal locality', explanation: 'เป็นการกลับมาอ้างตำแหน่งเดิมในช่วงเวลาใกล้กัน ส่วน spatial เน้นตำแหน่งที่อยู่ใกล้กัน' },
      { id: '08-q02', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'การอ่าน array ตามลำดับ index ได้ประโยชน์จากข้อใดโดยตรง?', options: ['การปิด interrupt', 'Spatial locality', 'การเพิ่ม page faults', 'การใช้ pointer ผิดขอบเขต'], answerIndex: 1, answer: 'Spatial locality', explanation: 'สมาชิกที่อยู่ติดกันในหน่วยความจำมีโอกาสอยู่ใน cache block/page ที่เพิ่งนำเข้ามา' },
      { id: '08-q03', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'ข้อใดอธิบาย write-back ได้ถูกต้อง?', options: ['เขียนชั้นล่างทุกครั้งทันทีเสมอ', 'ไม่เก็บการเปลี่ยนแปลงเลย', 'แก้สำเนาชั้นบน ทำเครื่องหมาย dirty แล้วค่อยส่งกลับเมื่อจำเป็น', 'ใช้กับข้อมูลอ่านอย่างเดียวเท่านั้น'], answerIndex: 2, answer: 'แก้สำเนาชั้นบน ทำเครื่องหมาย dirty แล้วค่อยส่งกลับเมื่อจำเป็น', explanation: 'Write-back ลดการเขียนชั้นล่างซ้ำๆ แต่ต้องรักษาข้อมูล dirty ก่อนนำก้อนนั้นออกหรือเมื่อจำเป็นต้อง flush' },
      { id: '08-q04', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'ข้อใดถูกต้องเกี่ยวกับ page fault?', options: ['ต้องอ่าน SSD ทุกครั้ง', 'แปลว่า RAM เสีย', 'เกิดได้เฉพาะ TLB hit', 'อาจเป็น demand-zero, copy-on-write, หน้าจากไฟล์ หรือการเข้าถึงผิดสิทธิ์ตามระบบ'], answerIndex: 3, answer: 'อาจเป็น demand-zero, copy-on-write, หน้าจากไฟล์ หรือการเข้าถึงผิดสิทธิ์ตามระบบ', explanation: 'Kernel ต้องตรวจสาเหตุและความถูกต้องของ access ก่อน การแก้ fault บางกรณีใช้เพียงการจัดสรรหรือคัดลอกใน RAM' },
      { id: '08-q05', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'Dirty bit ช่วยตอบคำถามใด?', options: ['หน้านี้เคยถูกแก้ไขจนต้องพิจารณาเขียนกลับหรือไม่', 'Thread นี้เป็นอันดับแรกใน RR หรือไม่', 'VA นี้ยาวกี่บิต', 'คำสั่งนี้เป็น system call หรือไม่'], answerIndex: 0, answer: 'หน้านี้เคยถูกแก้ไขจนต้องพิจารณาเขียนกลับหรือไม่', explanation: 'Dirty ติดตามการเขียน ไม่ใช่เพียงการอ่านและไม่ใช่ตัวบอกสิทธิ์ของหน้า' },
      { id: '08-q06', type: 'mcq', difficulty: 'พื้นฐาน', prompt: 'FIFO เลือก page ใดเป็น victim เมื่อ frames เต็ม?', options: ['หน้าที่ถูกใช้น้อยที่สุด', 'หน้าที่เข้ามาใน RAM ก่อนที่สุดในกลุ่มปัจจุบัน', 'หน้าที่เพิ่งถูกใช้งาน', 'หน้าที่ใช้ครั้งหน้าไกลที่สุด'], answerIndex: 1, answer: 'หน้าที่เข้ามาใน RAM ก่อนที่สุดในกลุ่มปัจจุบัน', explanation: 'FIFO สนใจเวลาเข้าคิว การ hit หน้าเก่าไม่ได้ทำให้หน้านั้นย้ายไปท้ายคิว' },
      { id: '08-q07', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'นโยบายใดใช้ความรู้เกี่ยวกับการอ้างหน้าในอนาคตเพื่อให้ fault ต่ำที่สุดสำหรับ reference string ที่กำหนด?', options: ['FIFO', 'LFU', 'MIN/OPT', 'Round Robin'], answerIndex: 2, answer: 'MIN/OPT', explanation: 'MIN เลือกหน้าที่จะถูกใช้ครั้งถัดไปไกลที่สุด จึงใช้เป็นเกณฑ์เทียบเชิงอุดมคติ ไม่สามารถรู้อนาคตได้ทั่วไปในระบบจริง' },
      { id: '08-q08', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'LRU ต้องทำอะไรเมื่อ access หน้าแล้ว hit?', options: ['นำหน้านั้นออกทันที', 'ไม่เปลี่ยน metadata ใดๆ', 'ลดจำนวน frames', 'อัปเดตสถานะว่าหน้านั้นเพิ่งถูกใช้'], answerIndex: 3, answer: 'อัปเดตสถานะว่าหน้านั้นเพิ่งถูกใช้', explanation: 'LRU ตัดสินจากเวลาการใช้ล่าสุด จึงต้องนับทั้ง hit และ fault ที่นำไปสู่การใช้งาน' },
      { id: '08-q09', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'Clock พบ candidate ที่ reference bit = 1 ในแบบ second-chance พื้นฐาน ควรทำอย่างไร?', options: ['เลือกหน้านี้ออกทันทีเสมอ', 'เปลี่ยน bit เป็น 0 แล้วเลื่อนเข็มไปตรวจหน้าถัดไป', 'เปลี่ยนทุก page เป็น dirty', 'หยุด Process ทั้งหมดถาวร'], answerIndex: 1, answer: 'เปลี่ยน bit เป็น 0 แล้วเลื่อนเข็มไปตรวจหน้าถัดไป', explanation: 'หน้าที่ถูกใช้ได้รับโอกาสอีกครั้ง หากเข็มพบ reference bit 0 จึงเลือกเป็น victim ตามกลไกพื้นฐาน' },
      { id: '08-q10', type: 'mcq', difficulty: 'ประยุกต์', prompt: 'Belady’s anomaly หมายถึงอะไร?', options: ['เพิ่ม frames แล้วจำนวน page faults อาจเพิ่มสำหรับนโยบายบางชนิด', 'TLB hit ทำให้หน่วยความจำหาย', 'ทุกระบบเร็วขึ้นเสมอเมื่อใช้ FIFO', 'หน้า dirty อ่านไม่ได้'], answerIndex: 0, answer: 'เพิ่ม frames แล้วจำนวน page faults อาจเพิ่มสำหรับนโยบายบางชนิด', explanation: 'FIFO เกิด anomaly ได้ แต่ LRU และ MIN ไม่เกิดภายใต้โมเดลมาตรฐานที่เปรียบเทียบ reference string เดียวกัน' },
      { id: '08-q11', type: 'written', difficulty: 'ประยุกต์', prompt: 'อธิบายขั้นตอน demand page fault เมื่อข้อมูลอยู่บนดิสก์ โดยเชื่อมบท Kernel, Address Translation และ Scheduling', answer: 'การ lookup พบหน้าที่ไม่ present จึง trap เข้า Kernel; Kernel ตรวจว่า mapping/สิทธิ์ถูกต้อง หา frame หรือเลือก victim และรักษาข้อมูล dirty แล้วสั่งอ่านหน้า Process อาจ block ให้ scheduler เลือกงานอื่น เมื่อ I/O จบอัปเดต PTE/TLB ทำให้งาน ready และเมื่อได้ CPU จึง retry คำสั่งเดิม', explanation: 'คำตอบที่ดีเรียงเหตุการณ์พร้อมเหตุผลและไม่ข้ามการตรวจสิทธิ์ก่อนโหลดหน้า', rubric: ['ตรวจ mapping และ permission หลัง trap', 'หา frame/จัดการ victim และนำข้อมูลเข้า', 'เชื่อม block/ready กับ scheduling', 'อัปเดต mapping แล้ว retry คำสั่งเดิม'] },
      { id: '08-q12', type: 'written', difficulty: 'ประยุกต์', prompt: 'อธิบายความต่างของ present, dirty และ reference bit พร้อมเหตุผลที่ต้อง invalidate TLB เมื่อนำ frame ไปใช้ใหม่', answer: 'Present บอกสถานะ resident/mapping พร้อมใช้, dirty บอกการแก้ไขที่อาจต้องเก็บกลับ, reference บอกการอ้างถึงในช่วงที่ติดตาม เมื่อนำ frame ไปใช้กับหน้าอื่นต้องยกเลิก mapping เก่าทั้ง PTE และ TLB ที่เกี่ยวข้อง เพื่อไม่ให้ access เก่าไปอ่าน/เขียนข้อมูลของเจ้าของใหม่', explanation: 'ทั้งสามบิตตอบคนละคำถาม และความสอดคล้องของ mapping เป็นทั้งเรื่องความถูกต้องและการป้องกัน Process', rubric: ['นิยาม present/dirty/reference แยกกัน', 'อธิบายความเสี่ยง stale TLB', 'กล่าวถึง mapping ที่แชร์ frame หากมี'] },
      { id: '08-q13', type: 'written', difficulty: 'พื้นฐาน', prompt: 'Memory-mapped file ต่างจากการใช้ read/write อย่างไร และ map แล้วไฟล์ทั้งก้อนอยู่ RAM ทันทีหรือไม่?', answer: 'Memory mapping ผูกช่วง VA กับไฟล์ จึงเข้าถึงด้วย load/store และใช้ fault นำหน้าที่ต้องการมา ส่วน read/write เรียก API ผ่าน buffer ตามปกติ การ map ไม่จำเป็นต้องนำไฟล์ทั้งก้อนเข้า RAM ทันที และข้อมูลที่แชร์หรือเขียนกลับต้องทำตาม synchronization/persistence semantics ของระบบ', explanation: 'แยกการมี mapping ออกจากการมีทุก page resident และแยกความสะดวกของ API จากการรับประกันว่าเขียนถึง storage แล้ว', rubric: ['อธิบาย load/store ผ่าน VA เทียบกับ read/write', 'ตอบว่าไม่จำเป็นต้อง resident ทั้งไฟล์', 'กล่าวถึงการนำหน้าเข้าเมื่อต้องใช้'] },
      { id: '08-q14', type: 'written', difficulty: 'ประยุกต์', prompt: 'เปรียบเทียบ FIFO, LRU และ MIN โดยระบุว่าดูอดีต/อนาคตแบบใด และมีเหตุผลอะไรที่ LRU เหมาะกับ temporal locality', answer: 'FIFO ดูเวลาเข้ามาใน RAM, LRU ดูเวลาการใช้ล่าสุดในอดีต, MIN ดูการใช้ครั้งถัดไปในอนาคต Temporal locality บอกว่าหน้าที่เพิ่งใช้มีแนวโน้มใช้ซ้ำ จึงเก็บหน้าที่เพิ่งใช้และเลือกหน้าที่ไม่ได้ใช้มานานแบบ LRU แต่ไม่ได้รับประกันว่าจะดีกว่า FIFO ทุก string', explanation: 'ต้องแยกเวลาเข้าออกจากเวลาใช้ และระบุข้อจำกัดของสมมติฐาน locality', rubric: ['อธิบายเกณฑ์ทั้งสามถูกต้อง', 'เชื่อม LRU กับ temporal locality', 'ระบุ MIN ต้องรู้อนาคตและ LRU ไม่ชนะทุกกรณี'] },
      { id: '08-q15', type: 'written', difficulty: 'ประยุกต์', prompt: 'เหตุใด clean page ที่มี backing copy ถูกต้องจึงอาจนำออกได้เร็วกว่า dirty page และเหตุใด page fault rate เล็กน้อยจึงกระทบประสิทธิภาพมาก?', answer: 'Clean page ที่มีสำเนาถูกต้องใน backing store ทิ้งสำเนาใน RAM แล้วอ่านกลับภายหลังได้ ส่วน dirty page ต้องรักษาการเปลี่ยนแปลงก่อน reuse frame ซึ่งอาจต้องเขียน storage เวลา I/O มักสูงกว่า RAM access หลายลำดับขนาด จึงเพิ่มค่าเฉลี่ยได้มากแม้ fault rate ต่ำ', explanation: 'คำตอบควรระบุเงื่อนไขว่ามี backing copy และ dirty data ต้องเก็บรักษา ไม่ใช่สรุปว่า clean ทุกชนิดทิ้งได้เสมอ', rubric: ['clean กับ dirty ต่างกันด้านการรักษาข้อมูล', 'ระบุเงื่อนไข backing copy', 'เชื่อมหน่วย ns กับ ms และผลต่อ EAT'] },
      { id: '08-q16', type: 'calculation', difficulty: 'พื้นฐาน', prompt: 'มี 3 frames เริ่มว่าง ใช้ FIFO กับ reference string 1,2,3,1,4,2,5 จงนับ page faults และแสดง frames หลังเรียก 4 และหลังเรียกตัวสุดท้าย', answer: '5 faults; หลังเรียก 4 ได้ [4,2,3]; สุดท้าย [4,5,3]', explanation: 'การ hit หน้า 1 ไม่เปลี่ยนคิว FIFO จึงยังนำหน้า 1 ออกเมื่อ 4 เข้ามา และนำ 2 ออกเมื่อ 5 เข้ามา', steps: ['1,2,3: fault ทั้งสาม → [1,2,3]', '1: hit และคิวเวลาเข้าไม่เปลี่ยน', '4: fault แทน 1 → [4,2,3]', '2: hit', '5: fault แทน 2 → [4,5,3]', 'รวม F,F,F,H,F,H,F = 5 faults'] },
      { id: '08-q17', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'มี 3 frames เริ่มว่าง ใช้ LRU กับ reference string 1,2,3,1,4,2,5 จงนับ page faults และระบุ victim เมื่อเรียก 4,2,5', answer: '6 faults; victim ตามลำดับคือ 2,3,1', explanation: 'การ hit 1 ทำให้ 1 ใหม่ที่สุด ก่อนเรียก 4 จึงต้องนำ 2 ซึ่งใช้ล่าสุดเก่าที่สุดออก', steps: ['1,2,3: 3 faults → [1,2,3]', '1: hit; ลำดับเก่า→ใหม่เป็น 2,3,1', '4: fault แทน 2 → [1,4,3]', '2: fault แทน 3 → [1,4,2]', '5: fault แทน 1 → [5,4,2]', 'รวม 6 faults'] },
      { id: '08-q18', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'มี 3 frames เริ่มว่าง ใช้ MIN กับ reference string 1,2,3,1,4,2,5 จงนับ faults หากหลายหน้าจะไม่ถูกใช้อีก ให้เลือก frame index ต่ำสุด (เริ่มนับ 0)', answer: '5 faults; หลังเรียก 4 ได้ [4,2,3]; สุดท้าย [5,2,3]', explanation: 'ก่อนเรียก 4 หน้า 1 และ 3 จะไม่ถูกใช้อีก จึงเลือก 1 ตาม tie-break ส่วนหน้า 2 ต้องเก็บไว้เพราะใช้ถัดไป', steps: ['1,2,3: 3 faults; 1 ถัดมาเป็น hit', 'เรียก 4: มองอนาคต 2,5; หน้า 1 และ 3 ไม่ใช้อีก เลือก frame 0 จึงแทน 1', 'เรียก 2: hit', 'เรียก 5: ไม่มี future reference เลือก frame 0 แทน 4', 'รวม 5 faults'] },
      { id: '08-q19', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'จำลอง FIFO เริ่มว่างสำหรับ reference string 1,2,3,4,1,2,5,1,2,3,4,5 ด้วย 3 และ 4 frames แล้วอธิบายผล', answer: '3 frames: 9 faults; 4 frames: 10 faults เป็น Belady’s anomaly', explanation: 'เพิ่มจำนวน frames แล้วลำดับการคงอยู่ของหน้าภายใต้ FIFO เปลี่ยนไป ทำให้ reference string นี้ fault มากขึ้น', steps: ['3 frames: F,F,F,F,F,F,F,H,H,F,F,H → 9 faults', '4 frames: F,F,F,F,H,H,F,F,F,F,F,F → 10 faults', 'reference string และสถานะเริ่มต้นเหมือนกัน แต่ faults เพิ่มจาก 9 เป็น 10 เมื่อเพิ่ม frames'] },
      { id: '08-q20', type: 'calculation', difficulty: 'ประยุกต์', prompt: 'Access ปกติ 100 ns, access ที่เกิด fault มีเวลารวม service และ retry เท่ากับ 8 ms, fault probability p = 10^−6 จงหา EAT และเปอร์เซ็นต์ที่เพิ่มจากปกติ', answer: 'EAT = 107.9999 ns ≈ 108 ns; เพิ่มประมาณ 8%', explanation: '8 ms เป็นเวลารวมของ faulting access จึงใช้การถ่วงน้ำหนักสองกรณี ไม่ใช่บวก memory time ซ้ำในกรณี fault', steps: ['8 ms = 8,000,000 ns', 'EAT = (1−10^−6)×100 + 10^−6×8,000,000', 'EAT = 99.9999 + 8 = 107.9999 ns', 'เพิ่ม = (107.9999−100)/100×100% = 7.9999% ≈ 8%'] }
    ]
  }
];
