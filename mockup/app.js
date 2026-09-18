'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const paths = {
  back:'M19 12H5m7-7-7 7 7 7', next:'m9 5 7 7-7 7', down:'m6 9 6 6 6-6', close:'m6 6 12 12M6 18 18 6',
  book:'M12 5v16M3 4h5c2 0 4 1 4 3 0-2 2-3 4-3h5v15h-5c-2 0-4 1-4 2 0-1-2-2-4-2H3Z',
  home:'m3 10 9-7 9 7v11h-7v-7h-4v7H3Z', slides:'M3 3h18v13H3ZM12 16v5m-4 0 4-5 4 5',
  star:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4',
  lab:'M9 3h6m-5 0v7L4 20h16l-6-10V3M8 14h8', check:'m5 12 4 4L19 6', save:'M5 3h14v19l-7-5-7 5Z',
  note:'M5 3h10l4 4v14H5Zm10 0v5h4M8 12h8m-8 4h8', menu:'M4 6h16M4 12h16M4 18h16',
  grid:'M3 3h18v18H3Zm9 0v18M3 12h18', plus:'M12 5v14M5 12h14', minus:'M5 12h14',
  zoom:'M15 15l6 6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0', pen:'m4 16 12-12 4 4L8 20H4Zm9-9 4 4',
  hand:'M8 12V5a2 2 0 0 1 4 0v7-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 4-3 6-7 6-3 0-5-2-7-5l-3-4c-1-2 1-4 3-2l2 2',
  practice:'m6 3 3 3-6 6-3-3m18 3 3 3-6 6-3-3M7 17l10-10M3 3l18 18',
  bell:'M5 17h14l-2-4V9a5 5 0 0 0-10 0v4ZM10 21h4', clock:'M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  expand:'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6', chat:'M3 3h18v14H9l-6 4Z', send:'m3 3 18 9-18 9 3-9Zm3 9h15'
};
function icon(name){return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.book}"/></svg>`;}
function button(action,label,name='',extra=''){const cls=extra.match(/class="([^"]*)"/)?.[1]||'';return `<button type="button" class="btn ${cls}" data-action="${action}" ${extra.replace(/class="[^"]*"/,'')}>${name?icon(name):''}${label}</button>`;}
function tool(action,label,name,extra=''){const cls=extra.match(/class="([^"]*)"/)?.[1]||'';return `<button type="button" class="icon-btn ${cls}" data-action="${action}" aria-label="${label}" title="${label}" ${extra.replace(/class="[^"]*"/,'')}>${icon(name)}</button>`;}
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
const stored = readStore('vinmark-items-v3',readStore('vinmark-items-v2',[]));
const progress = new Map(Array.isArray(stored)?stored.map(x=>[x.id,x]):[]);
const ATTENTION = [
 ['Attention giúp mô hình làm gì?',['Xem mọi token là độc lập','Cân nhắc mức liên quan của các token','Loại bỏ ngữ cảnh','Ghi nhớ mọi câu hỏi'],1,'Attention kết hợp thông tin từ các token liên quan trong ngữ cảnh.'],
 ['Những thành phần nào tham gia vào attention?',['Query, key và value','Chỉ tên người dùng','Chỉ token cuối','Chỉ độ dài câu'],0,'Query, key và value là các thành phần trong phép tính attention.'],
 ['Vì sao một từ cần được xét trong ngữ cảnh?',['Nghĩa của từ có thể phụ thuộc các từ xung quanh','Mọi từ luôn có một nghĩa','Để bỏ qua câu trước','Để không cần token'],0,'Ngữ cảnh cung cấp thông tin liên quan để diễn giải token.']
];
const referenceMap = {'1':{lesson:3,material:'main',page:12},'2':{lesson:3,material:'main',page:18},'3':{lesson:2,material:'main',page:17},'4':{lesson:2,material:'main',page:27},'5':{lesson:1,material:'main',page:15},'6':{lesson:1,material:'main',page:12}};
const topics = seed.map(x=>{
  const prior=progress.get(x.id);
  return {...structuredClone(x),ref:{course:'k4',...referenceMap[x.id]},status:prior?.status||x.status,
    attempts:prior?.attempts||0,lastResult:prior?.lastResult||null,attemptHistory:prior?.attemptHistory||[],
    revision:prior?.revision||1,sourceVersion:prior?.sourceVersion||null,feedback:prior?.feedback||[],quizInvalidated:prior?.quizInvalidated||false,
    sourceReady:x.id==='5'?Boolean(prior?.sourceReady||prior?.status==='need'):true,
    quiz:x.id==='5'?structuredClone(ATTENTION):structuredClone(x.quiz)};
});
for(const x of (Array.isArray(stored)?stored:[])) if(x.ref && !topics.some(t=>t.id===x.id)) topics.push(x);
const extraState=readStore('vinmark-viewer-v1',{});
const S={items:topics,view:'practice',tab:'need',query:'',filter:'all',selected:'1',quiz:null,collapsed:new Set(),
  openCourses:new Set(['k4']),ref:{course:'k4',lesson:1,material:'main',page:11},origin:null,
  sidebar:innerWidth>760,slidesOpen:true,labOpen:true,thumbnails:true,zoom:100,full:false,
  read:extraState.read||{},notes:extraState.notes||{},marks:extraState.marks||{},chat:extraState.chat||{},
  chatOpen:false,requestId:0,saveBanner:false,loading:false,notice:''};
function persist(){try{
  localStorage.setItem('vinmark-items-v3',JSON.stringify(S.items));
  localStorage.setItem('vinmark-viewer-v1',JSON.stringify({read:S.read,notes:S.notes,marks:S.marks,chat:S.chat}));
}catch{S.notice='Trình duyệt không lưu được tiến độ. Bạn vẫn có thể dùng demo trong phiên này.';}}
const lessonNames={1:'Day01 · Foundation',2:'Day02 · Xác định bài toán AI',3:'Day03 · LLM Foundation',4:'Day04 · Prompt Engineering',5:'Day05 · AI Product Management',6:'Day06 · Đánh giá sản phẩm',16:'MINI HACKATHON'};
const coursesData=[{id:'k4',code:'K4P1',name:'L3-L4 - Khóa 4 Phase 1',days:[1,2,3,4,16,5,6]}, {id:'k3',code:'COMP2010',name:'Khoá 3 Phase 1',days:[1,2,3]}];
const materials=day=>[
  {id:'intro',name:`material_day${String(day).padStart(2,'0')}_overview`},
  {id:'main',name:`day${String(day).padStart(2,'0')}-slide-v2-blue`},
  {id:'notes',name:'Tài liệu bổ sung · Các khái niệm chính'},
  {id:'foundation',name:`day${String(day).padStart(2,'0')}-foundation`},
  {id:'examples',name:'Ví dụ và tình huống thực hành'}
];
const baseSlide=(page,title,bullets,kind='text')=>({page,title,bullets,kind});
const pdfSlides=day=>typeof PDF_SLIDES==='object'?PDF_SLIDES[day]:null;
function slidesFor(ref){
  const day=ref.lesson;
  if(ref.material==='main'&&pdfSlides(day)) return pdfSlides(day).map(s=>({...s,kind:'pdf',topicId:topics.find(t=>referenceMap[t.id]&&t.ref.lesson===day&&t.ref.page===s.page)?.id}));
  const intro=baseSlide(1,day===1?'AI & LLM Foundation':lessonNames[day].split(' · ').slice(1).join(' · ')||'Mini Hackathon', ['Hiểu khái niệm cốt lõi','Kết nối kiến thức với tình huống thực tế','Lưu điều cần ôn cùng VinMark'],'cover');
  const dayTopics=topics.filter(x=>referenceMap[x.id]&&x.ref.lesson===day).map(x=>({...baseSlide(x.ref.page,x.title,[...x.summary]),topicId:x.id}));
  let result=[intro,baseSlide(3,'Agenda',['Khái niệm và bối cảnh','Ví dụ trong thực tế','Thảo luận và ôn tập'])];
  if(day===1) result.push(baseSlide(5,'Bức tranh AI',['AI là lĩnh vực rộng, bao gồm nhiều phương pháp.','Machine learning học quy luật từ dữ liệu.','LLM sinh văn bản dựa trên ngữ cảnh.']),baseSlide(11,'1969: Perceptrons',['Hướng symbolic: luật thủ công khó bao phủ nhiều ngữ cảnh.','Perceptron đơn giản có giới hạn về khả năng biểu diễn.'],'history'));
  result.push(...dayTopics);
  if(dayTopics.length===0) result.push(baseSlide(5,'Từ kiến thức đến thực hành',['Xác định việc người dùng cần hoàn thành.','Thử trên tình huống có đầu vào và kết quả kiểm chứng được.','Đọc kết quả, ghi nhận lỗi và cải tiến.']));
  result.sort((a,b)=>a.page-b.page);
  if(ref.material==='intro')return result.slice(0,2);
  if(ref.material==='notes')return result.filter(s=>s.kind==='text').map(s=>({...s,title:'Ghi chú: '+s.title}));
  if(ref.material==='examples')return [baseSlide(1,'Tình huống thực hành',['Chọn một khái niệm trong buổi học.','Giải thích bằng ví dụ của bạn.','Dùng quiz để kiểm tra lại.']),...result.filter(s=>s.topicId).map(s=>({...s,title:'Thực hành: '+s.title}))];
  return result;
}
const refKey=r=>`${r.course}:${r.lesson}:${r.material}:${r.page}`;
const currentSlide=()=>slidesFor(S.ref).find(s=>s.page===S.ref.page)||slidesFor(S.ref)[0];
const materialName=r=>materials(r.lesson).find(m=>m.id===r.material)?.name||'Bài đọc';
function historySVG(){
 const points=[[45,208,'1956','Dartmouth','Workshop', '#2e79d6'],[221,211,'1969','Perceptrons','', '#9caabc'],[275,283,'1973','Báo cáo','Lighthill','#9caabc'],[369,271,'1980','Hệ chuyên gia','', '#1f9d98'],[465,190,'1987','Sụp đổ Lisp','machine','#9caabc'],[722,225,'2006','Deep','Learning','#13968c'],[800,148,'2012','AlexNet','', '#13968c'],[854,105,'2016','AlphaGo','', '#8d48e8'],[882,83,'2017','Transformer','', '#8d48e8'],[896,68,'2018','GPT-1 / BERT','', '#8d48e8'],[950,25,'2022','ChatGPT','', '#8d48e8'],[976,-8,'2024','Kỷ nguyên','Agent','#8d48e8'],[999,-42,'2026','Hiện tại','', '#8d48e8']];
 return `<svg class="history-chart" viewBox="0 -125 1040 505" preserveAspectRatio="none" role="img" aria-label="Sơ đồ minh họa các giai đoạn phát triển AI, không phải số liệu định lượng">
 <rect x="190" y="-65" width="112" height="405" fill="#f1f4f8"/><rect x="302" y="-65" width="69" height="405" fill="#e1e7ef"/><rect x="459" y="-65" width="66" height="405" fill="#e1e7ef"/>
 <g fill="#75889b" font-size="10" font-style="italic" font-weight="700"><text x="215" y="-30">CÁC CÚ SỐC</text><text x="215" y="-16">(1966–1973)</text><text x="310" y="-30">MÙA ĐÔNG</text><text x="308" y="-16">LẦN 1</text><text x="467" y="-30">MÙA ĐÔNG</text><text x="477" y="-16">LẦN 2</text></g>
 <path d="M45 208 C90 68 120 137 183 143 S244 286 275 283 S337 284 369 271 S401 95 437 155 S465 190 486 250 S519 304 552 298 S681 285 722 225 S780 175 800 148 S845 110 882 83 S946 43 976-8 L999-42 L999 340 H45Z" fill="#e9eef3" opacity=".76"/>
 <path d="M45 208 C90 68 120 137 183 143 S244 286 275 283 S337 284 369 271 S401 95 437 155 S465 190 486 250 S519 304 552 298 S681 285 722 225 S780 175 800 148 S845 110 882 83 S946 43 976-8 L999-42" fill="none" stroke="#667583" stroke-width="2"/>
 ${points.map(([x,y,year,line1,line2,color],i)=>{const below=[1,5,7,9,11].includes(i),ly=below?y+48:y-68;return `<g><path d="M${x} ${y}V${below?ly-14:ly+18}" stroke="${color}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="7" fill="${color}" stroke="white"/><text x="${x}" y="${y+4}" text-anchor="middle" fill="white" font-size="10">${i+1}</text><text x="${x}" y="${ly}" text-anchor="middle" fill="${color}" font-size="12" font-weight="700"><tspan x="${x}">${line1}</tspan>${line2?`<tspan x="${x}" dy="14">${line2}</tspan>`:''}<tspan x="${x}" dy="14">${year}</tspan></text></g>`;}).join('')}
 <g stroke="#e2e8ef"><path d="M5 357H1035"/></g><g font-size="10" fill="#6f7f8d">${points.filter((p,i)=>i<7||i===8||i===10||i===12).map(p=>`<text x="${p[0]}" y="374" text-anchor="middle">${p[2]}</text>`).join('')}</g>
 <rect x="178" y="220" width="80" height="47" fill="none" stroke="#fa5f16" stroke-width="3"/><path d="m215 269 10 67m-12-12 12 18 9-21" stroke="#fa5f16" stroke-width="5" fill="none"/>
 </svg>`;
}
function slideMarkup(slide,thumbnail=false){
 if(slide.kind==='pdf') return thumbnail?`<img src="${esc(slide.image)}" alt="" loading="lazy"><small>${slide.page}</small>`:`<img class="pdf-slide" src="${esc(slide.image)}" alt="Slide ${slide.page}: ${esc(slide.title)}">`;
 if(thumbnail) return `${slide.kind==='history'?historySVG():`<span>${esc(slide.title)}</span>`}<small>${slide.page}</small>`;
 if(slide.kind==='history')return `<h2>${esc(slide.title)}</h2>${historySVG()}<div class="history-caption">Đường cong minh họa các giai đoạn — không phải số liệu đo lường định lượng.</div><div class="slide-bullets"><strong>Các hướng đi lần lượt chạm trần:</strong><p>• <b>Hướng symbolic</b>: luật thủ công khó bao phủ nhiều ngữ cảnh.</p><p>• <b>Hướng Perceptron</b>: học từ ví dụ nhưng mô hình quá đơn giản.</p></div>`;
 return `<div class="text-slide ${slide.kind==='cover'?'cover':''}"><div class="slide-kicker">AI20K · Học liệu minh họa</div><h2>${esc(slide.title)}</h2>${slide.topicId==='1'?'<div class="concept-cards"><div class="concept-card"><b>RAG</b>Đưa tài liệu vào ngữ cảnh</div><div class="concept-card"><b>Fine-tuning</b>Điều chỉnh tham số mô hình</div></div>':''}<div class="slide-content"><ul>${slide.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></div><span class="slide-number">VLearn · ${slide.page}</span></div>`;
}
function openSlide(ref,origin=null){S.ref={...ref};S.ref.page=currentSlide().page;S.origin=origin;S.quiz=null;S.loading=false;S.requestId++;S.chatOpen=false;S.saveBanner=false;S.zoom=100;S.view='lesson';S.read[refKey(S.ref)]=true;persist();render();}
function goPractice(id){S.view='practice';S.chatOpen=false;S.loading=false;S.quiz=null;if(id){S.selected=id;S.query='';S.filter='all';S.tab='all';}render();}
function header(){
 $('.top').innerHTML=`<div class="brand"><svg class="mark" viewBox="0 0 60 60" role="img" aria-label="VLearn"><path fill="#0d5598" d="M5 8 30 32 55 8v27L30 58 5 35Z"/><path fill="#d82435" d="M5 8v23l12-12Z"/></svg><span><b style="color:#c62533">V</b>Learn</span><i class="divider"></i></div><nav class="nav" aria-label="Điều hướng chính"><a href="#courses" data-view="courses">${icon('home')}<span>Trang chủ</span></a><a href="#courses" data-view="courses" class="${S.view==='courses'?'active':''}">${icon('book')}<span>Khóa học</span></a><a href="#practice" data-view="practice" class="${S.view==='practice'?'active':''}">${icon('practice')}<span>Luyện tập</span></a><a href="#lab" data-action="open-lab">${icon('lab')}<span>Lab</span><b class="badge">Mới</b></a></nav><div class="actions"><span class="lang"><b>EN</b><b class="on">VI</b></span><span aria-hidden="true">☾</span><span>${icon('bell')}</span><span class="avatar">N</span></div>`;
}
function courses(){
 $('#app').className='page course-page';
 $('#app').innerHTML=`<div class="course-top"><div><h1>KHÓA HỌC <em>CỦA TÔI</em></h1><p class="lead">Mỗi khóa học lưu trữ tài liệu, giáo án và phần ghi chú tương tác của riêng bạn.</p></div><div class="course-count">2 khóa học đang theo học</div></div><div class="course-card">${coursesData.map(c=>{const count=Object.keys(S.read).filter(k=>k.startsWith(c.id+':')).length;const open=S.openCourses.has(c.id);return `<section class="${c.id==='k3'?'course-separator':''}"><button class="course-row" data-action="toggle-course" data-id="${c.id}" aria-expanded="${open}"><span class="chevron">${icon(open?'down':'next')}</span><span class="course-code">${c.code}</span><span class="course-name">${c.name}</span><span class="course-progress">${count} trang đã mở · ${c.days.length} buổi minh họa</span></button><div class="day-list" ${open?'':'hidden'}>${c.days.map(day=>`<button class="day ${S.ref.course===c.id&&S.ref.lesson===day?'current':''}" data-action="open-day" data-course="${c.id}" data-day="${day}"><span class="circle">${S.ref.course===c.id&&S.ref.lesson===day?'▶':''}</span>Buổi ${day}: ${esc(lessonNames[day])}<small>${S.ref.course===c.id&&S.ref.lesson===day?'ĐANG HỌC…':'Mở bài học →'}</small></button>`).join('')}</div></section>`;}).join('')}</div>${footer()}`;
}
function footer(){return `<div class="demo-footer"><span>VinMark · Bản mô phỏng CP2 · Nội dung slide và phản hồi AI là dữ liệu minh họa.</span><button data-action="reset-demo">Đặt lại demo</button></div>`;}
function lesson(){
 const slide=currentSlide(),slides=slidesFor(S.ref),idx=slides.findIndex(s=>s.page===slide.page),key=refKey(S.ref);
 const marked=Boolean(S.marks[key]);
 $('#app').className='lesson-page'+(S.full?' full-view':'');
 const readCount=slides.filter(p=>S.read[refKey({...S.ref,page:p.page})]).length;
 $('#app').innerHTML=`<div class="lesson-top">${tool('back-lesson',S.origin?'Quay lại Luyện tập':'Quay lại Khóa học','back')}<span class="lesson-title">Bài ${S.ref.lesson} · ${esc(lessonNames[S.ref.lesson].split(' · ')[0])}</span><div class="lesson-progress">${readCount}/${slides.length} trang <span><i style="width:${readCount/slides.length*100}%"></i></span></div><div class="lesson-actions"><button class="spark" data-action="open-chat">${icon('star')}Đặt câu hỏi với AI</button><button data-action="request-help">${icon('hand')}Gửi yêu cầu</button><span class="avatar">N</span></div></div>
 <div class="lesson-body ${S.sidebar?'':'no-sidebar'}">${S.sidebar?`<aside class="lesson-sidebar"><div class="side-head">NỘI DUNG BÀI HỌC ${tool('toggle-sidebar','Đóng mục lục','close')}</div><div class="side-section"><button class="side-group" data-action="toggle-slides" aria-expanded="${S.slidesOpen}">Slides ${icon(S.slidesOpen?'down':'next')}</button>${S.slidesOpen?materials(S.ref.lesson).map(m=>`<button class="lesson-link ${S.ref.material===m.id?'active':''}" data-action="select-material" data-id="${m.id}"><span class="material-icon">${icon('slides')}</span><span class="material-title">${esc(m.name)}</span>${S.ref.material===m.id?'<small>Đang học</small>':''}</button>`).join(''):''}</div><button class="side-group lab" data-action="toggle-lab" aria-expanded="${S.labOpen}"><span>${icon('lab')} Lab ${String(S.ref.lesson).padStart(2,'0')} – Thực hành</span>${icon(S.labOpen?'down':'next')}</button>${S.labOpen?`<div class="lab-item">${[['setup','Lấy repo và nhìn thấy đích đến'],['baseline','Dựng môi trường và chạy test baseline'],['reading','Bài đọc'],['code','Code gợi ý: Gọi model']].map(([id,title],i)=>`${i===2?'<div class="lab-head">Task 1.1 – Gọi model và đo độ trễ</div>':''}<button class="lesson-link" data-action="open-reading" data-id="${id}"><span class="step-circle">${i+1}</span>${title}</button>`).join('')}</div>`:''}</aside>`:''}
 <section class="slide-area"><div class="context-strip"><span>${!S.sidebar?tool('toggle-sidebar','Mở mục lục','menu'):''}${esc(materialName(S.ref))} · Học liệu minh họa</span>${S.origin?button('back-lesson','Về mục đang ôn','back'):button('practice','Luyện tập','practice')}</div>
 <div class="slide-viewport"><div class="slide-box ${marked?'highlighted':''} ${slide.kind==='pdf'?'pdf-box':''}" style="width:${S.zoom}%">${slideMarkup(slide)}<button class="ai-fab" data-action="open-chat" aria-label="Hỏi AI về slide này">${icon('star')}</button></div></div>
 <div class="viewer-tools"><div class="tool-group">${tool('mark-slide',marked?'Bỏ đánh dấu trên slide':'Đánh dấu kiến thức trên slide','pen',marked?'class="active"':'')}${tool('toggle-sidebar','Ẩn hoặc hiện mục lục','book')}${tool('save-slide','Lưu slide vào VinMark','save')}</div><div class="tool-group zoom-group">${tool('zoom-out','Thu nhỏ','minus',S.zoom<=75?'disabled':'')}<span>${S.zoom}%</span>${tool('zoom-in','Phóng to','plus',S.zoom>=150?'disabled':'')}</div><div class="tool-group">${tool('read-text','Đọc nội dung slide','note')}${tool('expand','Chế độ tập trung','expand')}</div><div class="tool-group page-nav">${tool('prev-slide','Slide trước','back',idx<=0?'disabled':'')}<input class="page-field" id="page-number" aria-label="Số trang slide" type="number" min="1" value="${slide.page}"><span class="page-total">· ${idx+1}/${slides.length} ${slide.kind==='pdf'?'slide':'slide mẫu'}</span>${tool('next-slide','Slide tiếp theo','next',idx>=slides.length-1?'disabled':'')}</div><div class="tool-group">${tool('toggle-thumbs','Ẩn hoặc hiện ảnh thu nhỏ','grid')}${tool('notes','Sổ ghi chú','note')}</div></div>
 ${S.thumbnails?`<div class="thumb-track" aria-label="Ảnh thu nhỏ các slide">${slides.map(s=>`<button class="thumb ${s.kind==='cover'?'cover':''} ${s.page===slide.page?'active':''}" data-action="goto-slide" data-page="${s.page}" aria-label="Mở slide ${s.page}: ${esc(s.title)}" ${s.page===slide.page?'aria-current="page"':''}>${slideMarkup(s,true)}</button>`).join('')}</div>`:''}
 ${S.saveBanner?`<div class="saved-banner"><span>${icon('check')} Đã lưu kiến thức cùng slide nguồn vào VinMark.</span>${button('open-saved','Ôn mục vừa lưu','next')}</div>`:''}
 <details class="notes-card" id="notes-card"><summary>${icon('note')} Sổ ghi chú của bạn</summary><p>Ghi chú được lưu trên trình duyệt theo từng slide.</p><textarea id="slide-note" aria-label="Ghi chú của slide" placeholder="Điều bạn muốn ghi nhớ ở slide này…">${esc(S.notes[key]||'')}</textarea></details>${footer()}</section></div>`;
 if(S.chatOpen) chatDrawer();
 $('#page-number').addEventListener('change',e=>{const page=Number(e.target.value);if(slides.some(x=>x.page===page))moveSlide(page);else{e.target.value=slide.page;toast('Các trang trong demo: '+slides.map(x=>x.page).join(', '));}});
 $('#slide-note').addEventListener('input',e=>{S.notes[key]=e.target.value;persist();});
}
function filtered(){return S.items.filter(x=>(S.tab==='all'||(S.tab==='need'?x.status!=='done':x.status==='done'))&&(S.filter==='all'||x.session===S.filter)&&normalize(`${x.title} ${x.question} ${(x.conversation||[]).map(t=>t.question).join(' ')}`).includes(normalize(S.query)));}
function practice(){
 $('#app').className='page';
 $('#app').innerHTML=`<div class="eyebrow">VINMARK · TRANG ÔN TẬP</div><h1>LUYỆN TẬP</h1><p class="lead">Tìm lại điều bạn từng hỏi. Ôn đến khi chắc chắn hơn.</p><div class="stats"><div class="stat"><strong>${S.items.filter(x=>x.status!=='done').length}</strong><span>Cần ôn</span></div><div class="stat"><strong>${S.items.filter(x=>x.status==='done').length}</strong><span>Đã ôn đạt</span></div><div class="stat"><strong>${S.items.length}</strong><span>Tổng đã lưu</span></div></div><div class="toolbar"><label class="search"><span>⌕</span><input id="query" type="search" aria-label="Tìm kiến thức" placeholder="Tìm theo kiến thức hoặc câu hỏi…" value="${esc(S.query)}"></label><select id="filter" aria-label="Lọc buổi học"><option value="all">Tất cả buổi học</option>${[...new Set(S.items.map(x=>x.session))].map(s=>`<option value="${esc(s)}" ${S.filter===s?'selected':''}>${esc(s)}</option>`).join('')}</select><div class="tabs" aria-label="Trạng thái">${[['need','Cần ôn'],['done','Đã ôn đạt'],['all','Tất cả']].map(([id,title])=>`<button class="${S.tab===id?'active':''}" data-action="tab" data-id="${id}" aria-pressed="${S.tab===id}">${title}</button>`).join('')}</div></div><div class="note">ⓘ <b>Dữ liệu minh họa CP2.</b> Agent kiểm tra ngữ cảnh và chọn bài quiz được mô phỏng trong bản này.</div>${S.notice?`<p role="status">${esc(S.notice)}</p>`:''}<section class="layout"><aside class="panel list"><div class="list-head"><h2>Kiến thức đã lưu</h2><span id="count"></span></div><div id="list"></div></aside><article class="panel detail" id="detail"></article></section>${footer()}`;
 $('#query').addEventListener('input',e=>{S.query=e.target.value;S.quiz=null;S.loading=false;S.requestId++;renderPracticeContent();});
 $('#filter').addEventListener('change',e=>{S.filter=e.target.value;S.quiz=null;S.loading=false;S.requestId++;renderPracticeContent();});
 renderPracticeContent();
}
function renderPracticeContent(){
 const arr=filtered();if(!arr.some(x=>x.id===S.selected)&&!S.quiz)S.selected=arr[0]?.id||null;
 $('#count').textContent=`${arr.length} mục`;
 $('#list').innerHTML=[...new Set(arr.map(x=>x.session))].map(g=>`<div class="group"><button class="session-toggle" data-action="toggle-session" data-id="${esc(g)}" aria-expanded="${!S.collapsed.has(g)}">${esc(g)}${icon(S.collapsed.has(g)?'next':'down')}</button>${S.collapsed.has(g)?'':arr.filter(x=>x.session===g).map(x=>`<button class="card ${x.id===S.selected?'sel':''}" data-action="select-item" data-id="${esc(x.id)}"><i class="dot ${x.status}"></i><span class="ct"><strong>${esc(x.title)}</strong><span class="meta">${esc(x.date)}<span class="pill">${esc(x.source)}</span></span><span class="item-status ${x.status}">${x.status==='done'?'Đã ôn đạt':x.status==='missing'?'Thiếu nguồn':x.lastResult?'Cần ôn lại':'Chưa ôn'}</span></span></button>`).join('')}</div>`).join('')||'<div class="empty">Không có mục phù hợp.<br>Thử đổi từ khóa hoặc bộ lọc.</div>';
 renderDetail();
}
function renderDetail(){
 const x=S.items.find(t=>t.id===S.selected),p=$('#detail');if(!x){p.innerHTML='<div class="empty">Chọn một kiến thức để bắt đầu ôn tập.</div>';return;}
 if(S.loading){p.innerHTML='<div class="empty"><div class="spinner"></div><h2>Đang chuẩn bị bài quiz</h2><p>Agent đang xem phạm vi kiến thức và các ý cần kiểm tra.</p><p class="tiny muted">Mô phỏng CP2</p></div>';return;}
 if(S.quiz){renderQuiz(x);return;}
 const chat=isChatItem(x),newTurns=chat&&x.aiQuiz?x.conversation.length-x.aiQuiz.basedOn:0;
 const saved=chat?`<div class="label">Hội thoại với AI tutor</div><div class="conversation">${x.conversation.map(t=>`<div class="turn"><div class="quote">${esc(t.question)}</div><div class="tutor-answer">${esc(t.answer)}${t.grounded===false?'<span class="off-slide">Ngoài phạm vi slide</span>':''}</div></div>`).join('')}</div>`:`<div class="label">${x.source==='Đánh dấu slide'?'Đoạn kiến thức đã lưu':'Câu hỏi đã lưu'}</div><div class="quote">${esc(x.question)}</div>`;
 const quizNote=!chat?'Bài quiz được chuẩn bị theo kiến thức bạn cần ôn. AI chọn 3–10 câu sau khi kiểm tra nội dung nguồn.':x.aiQuiz?`Quiz đã được AI tạo từ slide và hội thoại này; các lần làm sau dùng lại bộ câu hỏi đó.${newTurns>0?` ${newTurns} câu hỏi mới sau khi tạo quiz chưa có trong bộ câu hỏi.`:''}`:'AI sẽ tạo quiz 3–10 câu từ slide và hội thoại này. Quiz chỉ tạo một lần rồi được lưu lại.';
  p.innerHTML=`<div class="dhead"><div class="dtitle"><i class="dot ${x.status}"></i><div><h2>${esc(x.title)}</h2><div class="sub">${esc(x.session)} · ${esc(x.date)}</div></div></div><div class="buttons">${button('source','Mở slide nguồn','slides')}${button('start-quiz',chat&&!x.aiQuiz?'Tạo quiz':'Làm quiz','star','class="primary" '+(x.status==='missing'&&!x.sourceId&&!pdfSourceRef(x)?'disabled':''))}</div></div><div class="source"><div>${saved}<div class="summary"><h3>Kiến thức cần nhớ</h3><ul>${x.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></div><aside class="source-card"><div class="label">Nguồn tham chiếu</div><div class="slide">${esc(x.slide)}</div><p>${esc(x.src)}</p><button data-action="source">Xem đoạn slide →</button></aside></div><div class="quiet-notice">${icon('star')} ${esc(quizNote)}</div><div class="schedule"><div class="chip"><strong>${x.status==='done'?'✓ Đã ôn đạt':'◷ Cần ôn'}</strong>${x.status==='done'?'Đã dừng nhắc; vẫn lưu lịch sử':'Ôn theo tiến độ của bạn'}</div>${x.status==='done'?'':'<div class="chip"><strong>Ngày +1 · Ngày +3</strong>Lịch nhắc minh họa</div>'}</div>${x.status==='missing'?`<div class="state missing"><div><b>Chưa đủ nội dung nguồn để tạo quiz.</b><br>Thêm nội dung của slide trước khi làm bài.</div>${button('supplement','Bổ sung nguồn','note')}</div>`:x.status==='done'?'<div class="state done">✓ Đã ôn đạt. Bạn có thể làm lại quiz khi muốn.</div>':''}`;
}
// CP2 adapter: returns a variable-length plan, with no fixed question count in the UI.
// CP3 can replace this function with an API returning the same object.
function mockAgentPlan(item){
  const questions=structuredClone(item.quiz);
  if(!item.sourceReady||questions.length===0)return null;
  const reordered=item.attempts%2?questions.slice().reverse():questions;
  return {questions:reordered,reason:item.title.includes('RAG')?'Ôn khái niệm, phân biệt hai cách tiếp cận và kiểm tra khả năng áp dụng.':'Kiểm tra các ý cốt lõi có trong nguồn đã lưu.',passRatio:.8,generationMode:'fixture'};
}
function normalizeQuizPlan(plan){
  if(!plan||!Array.isArray(plan.questions))return null;
  const questions=plan.questions.map((q,i)=>Array.isArray(q)?{id:`fixture-${i+1}`,concept:'',prompt:q[0],options:q[1],correctIndex:q[2],explanation:q[3],sourceId:null,evidenceQuote:''}:q);
  if(questions.length<3||questions.length>10||questions.some(q=>!Array.isArray(q.options)||q.options.length!==4))return null;
  return {...plan,questions,questionCount:questions.length,passRatio:.8};
}
const isChatItem=item=>Array.isArray(item?.conversation)&&item.conversation.length>0;
async function postJson(url,payload,fallbackMessage){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
  let response;
  try{response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,body:JSON.stringify(payload)});}
  catch(error){if(error.name==='AbortError')throw new Error('API quá thời gian chờ 30 giây.');throw error;}finally{clearTimeout(timeout);}
  const body=await response.json().catch(()=>({status:'error',message:'API trả về dữ liệu không hợp lệ.'}));
  if(!response.ok||body.status==='error')throw new Error(body.message||fallbackMessage);
  return body;
}
// Quiz source for chat items: slide content plus tutor answers that stayed within the slide.
function chatSource(item){
  const turns=item.conversation.filter(t=>t.grounded!==false);
  return {title:item.title,text:[`${item.title} (${item.src})`,...(item.slideText||item.summary).map(s=>`- ${s}`),'',...turns.flatMap(t=>[`Học viên hỏi: ${t.question}`,`Tutor trả lời: ${t.answer}`])].join('\n')};
}
// Server-side source for items saved on a real PDF slide page, e.g. "d1:15".
const pdfSourceRef=item=>item.ref?.material==='main'&&pdfSlides(item.ref.lesson)?.[item.ref.page-1]?`d${item.ref.lesson}:${item.ref.page}`:null;
async function requestQuiz(item){
  const chat=isChatItem(item),pdfRef=pdfSourceRef(item);
  if(location.protocol==='file:'||(!item.sourceId&&!chat&&!pdfRef)){
    await new Promise(resolve=>setTimeout(resolve,650));
    return normalizeQuizPlan(mockAgentPlan(item));
  }
  if(chat&&item.aiQuiz)return normalizeQuizPlan(item.aiQuiz);
  const body=await postJson('/api/quiz',chat?{
    itemId:item.id,revision:1,mode:'initial',learnerQuestions:item.conversation.map(t=>t.question),
    ...(pdfRef?{sourceRef:pdfRef}:{sourceRef:`slide:${item.id}`,slideSource:chatSource(item)})
  }:{
    itemId:item.id,revision:item.revision||1,sourceRef:item.sourceId||pdfRef,learnerQuestions:item.id.startsWith('saved-')&&item.source==='Đánh dấu slide'?[]:[item.question],mode:item.lastResult?'retry':'initial',
    previousAttempt:item.lastResult?{questionCount:item.lastResult.total,wrongConcepts:item.lastResult.wrongConcepts||[]}:undefined
  },'Không thể chuẩn bị quiz.');
  if(body.status==='ready'){
    const plan=normalizeQuizPlan(body);if(!plan)throw new Error('API trả về quiz không đúng cấu trúc.');
    if(chat){item.aiQuiz={...plan,basedOn:item.conversation.length};persist();}
    return plan;
  }
  return body;
}
async function startQuiz(){
  const item=S.items.find(x=>x.id===S.selected);if(!item||item.status==='missing'&&!item.sourceId&&!pdfSourceRef(item))return;
  const token=++S.requestId;S.loading=true;renderDetail();
  try{
   if(item.sourceId&&item.status==='missing')item.status='need';
   const plan=await requestQuiz(item);if(token!==S.requestId||S.view!=='practice'||S.selected!==item.id)return;
   S.loading=false;
   if(plan?.status==='needs_context'||plan?.status==='out_of_scope'){if(!isChatItem(item)&&!pdfSourceRef(item)){item.status='missing';item.sourceReady=false;}persist();toast([plan.reason,plan.nextAction].filter(Boolean).join(' '));renderDetail();return;}
   if(!plan){toast('Chưa đủ nội dung để chuẩn bị bài quiz.');renderDetail();return;}
   if(plan.sourceVersion&&item.sourceVersion&&plan.sourceVersion!==item.sourceVersion){item.revision++;item.sourceVersion=plan.sourceVersion;item.status='need';persist();toast('Nguồn đã thay đổi. Hãy tạo lại quiz cho phiên bản mới.');renderDetail();return;}
   if(plan.sourceVersion)item.sourceVersion=plan.sourceVersion;
   item.sourceReady=true;
   S.quiz={itemId:item.id,plan,index:0,answers:[],submitted:false};renderDetail();
  }catch(error){
   if(token!==S.requestId)return;
   S.loading=false;toast(error.message||'Không thể chuẩn bị quiz. Hãy thử lại.');renderDetail();
  }
}
function renderQuiz(item){
 const run=S.quiz,plan=run.plan,total=plan.questions.length,required=Math.ceil(total*plan.passRatio);
 const head=`<div class="dhead"><div><h2>${run.submitted?'Kết quả ôn tập':'Quiz ôn tập'}</h2><div class="sub">${esc(item.title)}</div></div>${button('exit-quiz','Về kiến thức','back')}</div>`;
 if(run.submitted){
   const score=run.score,pass=score>=required;
   $('#detail').innerHTML=head+`<div class="quiz"><div class="result"><div class="score">${score}/${total}</div><div><h3>${pass?'Đã ôn đạt':'Cần ôn thêm'}</h3><p>Tiêu chí của demo: đúng ít nhất ${required}/${total} câu (80%).</p></div></div><div class="state ${pass?'done':'need'}">${pass?'Đã lưu kết quả và dừng lịch nhắc cho mục này.':'Đã lưu kết quả. Xem lại các ý trả lời sai trước khi ôn tiếp.'}</div>${plan.questions.map((q,i)=>`<div class="review-card ${run.answers[i]===q.correctIndex?'good':'bad'}"><h3>${run.answers[i]===q.correctIndex?'✓':'○'} Câu ${i+1}. ${esc(q.prompt)}</h3><p>Bạn chọn: ${esc(q.options[run.answers[i]])}</p><p><b>Đáp án: ${esc(q.options[q.correctIndex])}</b></p><p>${esc(q.explanation)}</p><button class="btn" data-action="source">${icon('slides')} ${esc(item.slide)}</button> ${button('report-quiz','Báo câu sai','note',`data-index="${i}"`)}</div>`).join('')}<div class="quizfoot">${button('exit-quiz','Về kiến thức','back')}${button('retry-quiz','Làm lại quiz','star')}</div></div>`;return;
 }
 const q=plan.questions[run.index],selected=run.answers[run.index];
  $('#detail').innerHTML=head+`<div class="quiet-notice"><b>Bài ôn đã sẵn sàng · ${total} câu</b><br>${esc(plan.reason||'Kiểm tra các ý cốt lõi có trong nguồn đã lưu.')}<br><span class="tiny muted">${plan.generationMode==='curated-demo'?'API demo dùng nguồn đã duyệt.':plan.generationMode==='fixture'?'Fixture demo được gắn nhãn rõ.':'Quiz do AI tạo từ nguồn đã lưu.'} Đạt khi đúng ít nhất ${required}/${total} câu.</span></div><div class="quiz-top"><div class="quiz-dots">${plan.questions.map((_,i)=>`<button data-action="quiz-goto" data-index="${i}" class="${run.index===i?'current':''} ${run.answers[i]!==undefined?'answered':''}" aria-label="Đến câu ${i+1}">${i+1}</button>`).join('')}</div><span class="muted tiny">${run.answers.filter(a=>a!==undefined).length}/${total} đã trả lời</span></div><div class="question">${run.index+1}. ${esc(q.prompt)}</div><div class="answers">${q.options.map((a,i)=>`<button class="answer ${selected===i?'sel':''}" data-action="answer" data-index="${i}" aria-pressed="${selected===i}"><span class="key">${String.fromCharCode(65+i)}</span>${esc(a)}</button>`).join('')}</div><div class="quizfoot">${button('quiz-prev','Câu trước','back',run.index===0?'disabled':'')}${run.index<total-1?button('quiz-next','Câu tiếp theo','next'):button('submit-quiz','Nộp bài','check',run.answers.filter(a=>a!==undefined).length<total?'disabled':'')}</div>`;
}
function finishQuiz(){
 const run=S.quiz;if(!run||run.submitted||run.answers.filter(a=>a!==undefined).length!==run.plan.questions.length)return;
  run.score=run.plan.questions.reduce((n,q,i)=>n+Number(run.answers[i]===q.correctIndex),0);run.submitted=true;
  const item=S.items.find(x=>x.id===run.itemId);item.attempts++;item.status=run.score>=Math.ceil(run.plan.questions.length*run.plan.passRatio)?'done':'need';
  const at=new Date().toISOString();const wrongConcepts=run.plan.questions.filter((q,i)=>run.answers[i]!==q.correctIndex).map(q=>q.concept).filter(Boolean);
  item.lastResult={score:run.score,total:run.plan.questions.length,wrongConcepts,at};item.attemptHistory=[...(item.attemptHistory||[]),{quizId:run.plan.quizId||`fixture-${item.revision}`,revision:item.revision,questionCount:run.plan.questions.length,questions:structuredClone(run.plan.questions),answers:[...run.answers],score:run.score,total:run.plan.questions.length,at}];persist();practice();
}
function moveSlide(page){S.ref.page=page;S.zoom=100;S.saveBanner=false;S.read[refKey(S.ref)]=true;persist();lesson();}
function makeQuestions(slide){
 if(slide.kind==='history')return [
 ['Hướng symbolic chủ yếu dựa vào điều gì?',['Luật và quy tắc do con người viết','Chỉ dữ liệu hình ảnh','Không cần biểu diễn tri thức','Một kho quiz'],0,'Hướng symbolic biểu diễn tri thức bằng luật và quy tắc.'],
 ['Khó khăn của hướng symbolic được nhắc trong slide là gì?',['Khó bao phủ nhiều ngữ cảnh bằng luật thủ công','Không có bất kỳ luật nào','Luôn hiểu ngữ cảnh hoàn hảo','Không có đầu vào'],0,'Thế giới có nhiều ngữ cảnh, nên viết đủ luật thủ công là khó.'],
 ['Perceptron học chủ yếu từ đâu?',['Ví dụ huấn luyện','Lịch sử điểm danh','Danh sách khóa học','Màu của slide'],0,'Perceptron là mô hình học từ ví dụ.'],
 ['Đường cong trong slide thể hiện điều gì?',['Minh họa khái niệm các giai đoạn AI','Số liệu lợi nhuận đã kiểm chứng','Độ chính xác mọi mô hình','Số lượng học viên'],0,'Đây là sơ đồ khái niệm, không phải biểu đồ đo lường định lượng.']
 ];
 return slide.bullets.slice(0,5).map((b,i)=>[`Theo nguồn, ý nào đúng về “${slide.title}” (ý ${i+1})?`,[b,'Không cần kiểm tra hoặc đối chiếu nguồn.','Mọi trường hợp đều có cùng một kết quả.','Có thể bỏ qua toàn bộ ngữ cảnh.'],0,`Nội dung nguồn: ${b}`]);
}
function saveLearning(source,question='',ref=S.ref,slide=currentSlide()){
 const key=refKey(ref);
 let item=S.items.find(x=>refKey(x.ref)===key && (source==='Đánh dấu slide'?x.source===source:x.question===question));
 if(!item){
 const canonical=topics.find(t=>t.id===slide.topicId);
 item={id:'saved-'+Date.now()+'-'+S.items.length,session:`Buổi ${String(ref.lesson).padStart(2,'0')} · ${lessonNames[ref.lesson].split(' · ').slice(1).join(' · ')||'Hackathon'}`,
 date:new Date().toLocaleDateString('vi-VN'),title:slide.title,source,question:question||slide.bullets[0],slide:`Slide ${slide.page}`,src:`${materialName(ref)} · trang ${slide.page}`,ref:{...ref},summary:slide.bullets.slice(0,6),slideText:[...slide.bullets],status:'need',sourceReady:true,quiz:canonical?structuredClone(canonical.quiz):makeQuestions(slide),attempts:0};
 S.items.unshift(item);
 }
 S.lastSaved=item.id;S.saveBanner=true;persist();return item;
}
// One saved item per slide collects every tutor turn asked on that slide.
function saveChatTurn(ref,slide,question,reply){
 let item=S.items.find(x=>Array.isArray(x.conversation)&&refKey(x.ref)===refKey(ref));
 if(!item){item=saveLearning('Từ chat Tutor',question,ref,slide);item.conversation=item.conversation||[];}
 item.conversation.push({question,answer:reply.answer,grounded:reply.grounded!==false,at:new Date().toISOString()});
 S.lastSaved=item.id;persist();return item;
}
async function requestTutor(ref,slide,question,history){
 if(location.protocol==='file:'){
  await new Promise(resolve=>setTimeout(resolve,650));
  return {answer:`Minh họa từ slide hiện tại: ${slide.bullets.join(' ')} Đây là phần nhắc lại nguồn, chưa phải câu trả lời cá nhân hóa từ AI thật.`,grounded:true};
 }
 return postJson('/api/chat',{slide:{title:slide.title,page:slide.page,lesson:lessonNames[ref.lesson],bullets:slide.bullets},question,
  history:history.map(m=>({role:m.role,text:m.text}))},'AI tutor chưa trả lời được. Hãy thử lại.');
}
async function askTutor(question){
 const ref={...S.ref},key=refKey(ref),slide=currentSlide(),history=S.chat[key]||[];
 S.chatPending=key;S.chat[key]=[...history,{role:'user',text:question}];chatDrawer();
 let failed=false;
 try{
  const reply=await requestTutor(ref,slide,question,history);
  S.chat[key]=[...S.chat[key],{role:'assistant',text:reply.answer,grounded:reply.grounded!==false}];
  saveChatTurn(ref,slide,question,reply);
  toast('Đã lưu hội thoại cùng slide nguồn vào Luyện tập.');
 }catch(error){
  failed=true;S.chat[key]=history;toast(error.message||'AI tutor chưa trả lời được. Hãy thử lại.');
 }finally{
  S.chatPending=null;persist();
  if(S.chatOpen&&S.view==='lesson'&&refKey(S.ref)===key){chatDrawer();if(failed)$('#chat-input').value=question;$('#chat-input').focus();}
 }
}
function chatDrawer(){
 $('#chat-drawer')?.remove();const key=refKey(S.ref),slide=currentSlide(),history=S.chat[key]||[],pending=S.chatPending===key;
 const context=location.protocol==='file:'?'Phản hồi minh họa · Chạy qua server để dùng AI thật':'AI trả lời dựa trên nội dung slide này';
 document.body.insertAdjacentHTML('beforeend',`<aside id="chat-drawer" class="chat-drawer" aria-label="AI Tutor"><div class="dialog-head"><h2>${icon('star')} AI Tutor</h2>${tool('close-chat','Đóng chat','close')}</div><div class="chat-context">${esc(slide.title)} · Slide ${slide.page}<br>${context}</div><div class="chat-history" aria-live="polite">${history.length?history.map(m=>`<div class="chat-message ${m.role}">${esc(m.text)}${m.role==='assistant'?`${m.grounded===false?'<span class="off-slide">Ngoài phạm vi slide</span>':''}<button class="citation" data-action="chat-citation">${icon('slides')} Nguồn: slide ${slide.page}</button><span class="tiny muted">Đã lưu cùng câu hỏi vào Luyện tập.</span>`:''}</div>`).join(''):'<div class="chat-message">Bạn muốn làm rõ điều gì ở slide này? Câu hỏi sẽ được lưu cùng nguồn để ôn lại.</div>'}${pending?'<div class="chat-message pending">AI đang đọc slide và trả lời…</div>':''}</div><form class="chat-compose" id="chat-form"><textarea id="chat-input" required maxlength="2000" aria-label="Câu hỏi cho Tutor" placeholder="Ví dụ: Giải thích ý chính của slide này…" ${pending?'disabled':''}></textarea><div class="chat-hint">Hội thoại được lưu trong trang Luyện tập để ôn và tạo quiz.</div><button type="submit" class="btn primary" ${pending?'disabled':''}>${icon('send')}${pending?'Đang trả lời…':'Gửi câu hỏi'}</button></form></aside>`);
 $('#chat-form').addEventListener('submit',e=>{e.preventDefault();const question=$('#chat-input').value.trim();if(!question||S.chatPending)return;askTutor(question);});
 $('.chat-history').scrollTop=$('.chat-history').scrollHeight;
}
function modal(title,body,actions=''){
 $('#dialog')?.remove();document.body.insertAdjacentHTML('beforeend',`<dialog id="dialog"><div class="dialog-head"><h2>${title}</h2>${tool('close-dialog','Đóng hộp thoại','close')}</div><div class="dialog-body">${body}</div>${actions?`<div class="dialog-foot">${actions}</div>`:''}</dialog>`);$('#dialog').showModal();
}
function render(){
 document.body.classList.toggle('in-lesson',S.view==='lesson');$('#chat-drawer')?.remove();header();
 if(S.view==='courses')courses();else if(S.view==='lesson')lesson();else practice();
}
function toast(text){const t=$('#toast');t.textContent=text;t.setAttribute('role','status');t.classList.add('show');clearTimeout(S.toastTimer);S.toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-view]');if(nav){e.preventDefault();S.view=nav.dataset.view;S.quiz=null;S.loading=false;S.requestId++;S.chatOpen=false;render();return;}
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;e.preventDefault();const action=b.dataset.action;
 const item=S.items.find(x=>x.id===S.selected);
 switch(action){
 case 'toggle-course':S.openCourses.has(b.dataset.id)?S.openCourses.delete(b.dataset.id):S.openCourses.add(b.dataset.id);courses();break;
 case 'open-day':openSlide({course:b.dataset.course,lesson:Number(b.dataset.day),material:'main',page:Number(b.dataset.day)===1?11:1});break;
 case 'open-lab':openSlide({course:'k4',lesson:1,material:'main',page:11});openReading('reading');break;
 case 'select-material':openSlide({...S.ref,material:b.dataset.id,page:1},S.origin);break;
 case 'back-lesson':if(S.origin)goPractice(S.origin);else{S.view='courses';S.chatOpen=false;render();}break;
 case 'practice':goPractice();break;
 case 'source':if(item)openSlide(item.ref,item.id);break;
 case 'tab':S.tab=b.dataset.id;S.quiz=null;S.loading=false;S.requestId++;practice();break;
 case 'select-item':S.selected=b.dataset.id;S.quiz=null;S.loading=false;S.requestId++;renderPracticeContent();break;
 case 'toggle-session':S.collapsed.has(b.dataset.id)?S.collapsed.delete(b.dataset.id):S.collapsed.add(b.dataset.id);renderPracticeContent();break;
  case 'start-quiz':case 'retry-quiz':S.quiz=null;startQuiz();break;
  case 'exit-quiz':S.quiz=null;practice();break;
  case 'report-quiz':{const q=S.quiz?.plan.questions[Number(b.dataset.index)];if(!q)break;modal('Báo câu quiz có lỗi',`<p>${esc(q.prompt)}</p><label for="quiz-feedback">Điều gì chưa đúng?</label><textarea id="quiz-feedback" maxlength="1000" required placeholder="Mô tả lỗi trong câu hỏi, đáp án hoặc nguồn…"></textarea>${button('save-quiz-feedback','Lưu phản hồi','save',`data-index="${b.dataset.index}"`)}`);break;}
  case 'save-quiz-feedback':{const feedback=$('#quiz-feedback').value.trim();if(!feedback){$('#quiz-feedback').focus();break;}const feedbackItem=S.items.find(x=>x.id===S.quiz?.itemId);if(feedbackItem){feedbackItem.feedback=[...(feedbackItem.feedback||[]),{quizId:S.quiz.plan.quizId||null,questionIndex:Number(b.dataset.index),text:feedback,at:new Date().toISOString()}];feedbackItem.status='need';feedbackItem.quizInvalidated=true;delete feedbackItem.aiQuiz;persist();}S.quiz=null;$('#dialog').close();practice();toast('Đã lưu phản hồi và vô hiệu bộ quiz cũ.');break;}
  case 'answer':S.quiz.answers[S.quiz.index]=Number(b.dataset.index);renderDetail();break;
 case 'quiz-goto':S.quiz.index=Number(b.dataset.index);renderDetail();break;
 case 'quiz-prev':S.quiz.index--;renderDetail();break;
 case 'quiz-next':S.quiz.index++;renderDetail();break;
 case 'submit-quiz':finishQuiz();break;
 case 'toggle-sidebar':S.sidebar=!S.sidebar;lesson();break;
 case 'toggle-slides':S.slidesOpen=!S.slidesOpen;lesson();break;
 case 'toggle-lab':S.labOpen=!S.labOpen;lesson();break;
 case 'goto-slide':moveSlide(Number(b.dataset.page));break;
 case 'prev-slide':case 'next-slide':{const pages=slidesFor(S.ref),idx=pages.findIndex(p=>p.page===S.ref.page);const next=pages[idx+(action==='next-slide'?1:-1)];if(next)moveSlide(next.page);break;}
 case 'zoom-in':S.zoom=Math.min(150,S.zoom+25);lesson();break;
 case 'zoom-out':S.zoom=Math.max(75,S.zoom-25);lesson();break;
 case 'expand':S.full=!S.full;lesson();break;
 case 'toggle-thumbs':S.thumbnails=!S.thumbnails;lesson();break;
 case 'mark-slide':{const key=refKey(S.ref);S.marks[key]=!S.marks[key];if(S.marks[key])saveLearning('Đánh dấu slide');persist();lesson();toast(S.marks[key]?'Đã đánh dấu và lưu vào VinMark.':'Đã bỏ đánh dấu; mục ôn vẫn được giữ.');break;}
 case 'save-slide':saveLearning('Đánh dấu slide');lesson();toast('Đã lưu slide vào Luyện tập.');break;
 case 'open-saved':goPractice(S.lastSaved);break;
 case 'open-chat':S.chatOpen=true;chatDrawer();$('#chat-input').focus();break;
 case 'close-chat':S.chatOpen=false;$('#chat-drawer')?.remove();break;
 case 'chat-citation':toast(`Đang xem đúng slide ${S.ref.page} được trích dẫn.`);S.chatOpen=false;$('#chat-drawer')?.remove();$('.slide-box').focus();break;
 case 'read-text':{const slide=currentSlide();modal(esc(slide.title),`<ul>${slide.bullets.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p class="muted">Slide ${slide.page} · nội dung minh họa</p>`);break;}
 case 'notes':$('#notes-card').open=true;$('#notes-card').scrollIntoView({behavior:'smooth',block:'center'});$('#slide-note').focus();break;
 case 'open-reading':openReading(b.dataset.id);break;
 case 'request-help':modal('Gửi yêu cầu hỗ trợ',`<p>Liên quan đến ${esc(lessonNames[S.ref.lesson])}, slide ${S.ref.page}.</p><label for="help-message">Bạn cần hỗ trợ điều gì?</label><textarea id="help-message" maxlength="2000" placeholder="Mô tả vấn đề…"></textarea><p class="muted tiny">Demo chỉ lưu yêu cầu trong trình duyệt, không gửi đến giảng viên.</p>`,button('save-help','Lưu yêu cầu mẫu','check'));break;
 case 'save-help':{const text=$('#help-message').value.trim();if(!text){$('#help-message').focus();break;}S.notes[refKey(S.ref)]=(S.notes[refKey(S.ref)]||'')+'\nYêu cầu hỗ trợ: '+text;persist();$('#dialog').close();toast('Đã lưu yêu cầu mẫu trong sổ ghi chú.');break;}
 case 'supplement':modal('Bổ sung nguồn',`<p>Mục này thiếu trích đoạn có thể dùng để tạo quiz. Trong demo, bạn có thể thêm nội dung để ghi chú hoặc dùng nguồn mẫu tương ứng với attention.</p><label for="source-text">Nội dung bổ sung</label><textarea id="source-text" placeholder="Dán đoạn tài liệu tại đây…"></textarea><p class="muted tiny">Nội dung tự nhập được lưu để xem lại, chưa được Agent thật kiểm chứng.</p>`,button('store-source','Lưu nội dung','save')+button('sample-source','Dùng nguồn mẫu','book'));break;
 case 'store-source':{const text=$('#source-text').value.trim();if(!text){$('#source-text').focus();break;}item.supplement=text;persist();$('#dialog').close();toast('Đã lưu nội dung bổ sung; cần kiểm chứng trước khi tạo quiz.');break;}
 case 'sample-source':item.status='need';item.sourceReady=true;item.quiz=structuredClone(ATTENTION);persist();$('#dialog').close();practice();toast('Đã thêm nguồn mẫu về attention.');break;
 case 'close-dialog':$('#dialog')?.close();break;
 case 'reset-demo':modal('Đặt lại dữ liệu minh họa?', '<p>Thao tác này xóa tiến độ, ghi chú và câu hỏi bạn tạo trong demo VinMark trên trình duyệt này.</p>',button('close-dialog','Giữ lại')+button('confirm-reset','Đặt lại demo'));break;
 case 'confirm-reset':try{['vinmark-items','vinmark-items-v2','vinmark-items-v3','vinmark-viewer-v1'].forEach(k=>localStorage.removeItem(k));}catch{}location.reload();break;
 }
});
function openReading(id){const titles={setup:'Lấy repo và nhìn thấy đích đến',baseline:'Dựng môi trường và chạy test baseline',reading:'Bài đọc · Gọi model và đo độ trễ',code:'Code gợi ý: Gọi model'};modal(titles[id]||titles.reading,`<p class="muted">Tài liệu minh họa CP2 · Buổi ${S.ref.lesson}</p><ol><li>Xác định câu hỏi và đầu ra mong đợi.</li><li>Gửi yêu cầu, ghi lại thời gian phản hồi.</li><li>Kiểm tra câu trả lời với tài liệu nguồn.</li></ol>${id==='code'?'<pre style="white-space:pre-wrap">input → model → output\nĐo latency và lưu kết quả kiểm thử.</pre>':''}`);}
document.addEventListener('keydown',e=>{if(S.view!=='lesson'||e.target.closest('input,textarea,select')||$('#dialog')?.open)return;
 if(e.key==='Escape'&&S.chatOpen){S.chatOpen=false;$('#chat-drawer')?.remove();}
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const arr=slidesFor(S.ref),i=arr.findIndex(p=>p.page===S.ref.page),s=arr[i+(e.key==='ArrowRight'?1:-1)];if(s){e.preventDefault();moveSlide(s.page);}}
});
render();
