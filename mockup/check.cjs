const {chromium}=require('/Users/huynguyen/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const assert=require('node:assert/strict');
const target=process.argv[2]||'file:///tmp/vinmark-upgrade/index.html';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 try {
 const page=await browser.newPage({viewport:{width:1512,height:982}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(target);await page.evaluate(()=>{localStorage.clear();});await page.reload();
 await page.locator('[data-action="start-quiz"]').waitFor();
 assert.equal(await page.locator('[data-action="start-quiz"]').innerText(),'Làm quiz');
 await page.locator('#query').fill('rag');assert.equal(await page.locator('.card').count(),1);
 await page.locator('[data-action="source"]').first().click();
 assert.match(await page.locator('.slide-box').innerText(),/RAG/);
 assert.equal(await page.locator('#page-number').inputValue(),'12');
 await page.locator('[data-action="zoom-in"]').click();assert.match(await page.locator('.zoom-group').innerText(),/125%/);
 await page.locator('[data-action="next-slide"]').click();assert.equal(await page.locator('#page-number').inputValue(),'18');
 await page.locator('[data-action="prev-slide"]').click();assert.equal(await page.locator('#page-number').inputValue(),'12');
 assert.match(await page.locator('.page-total').innerText(),/3\/4/);
 await page.locator('[data-action="back-lesson"]').first().click();
 assert.match(await page.locator('#detail').innerText(),/RAG/);
 await page.locator('[data-action="start-quiz"]').click();await page.locator('[data-action="answer"]').first().waitFor();
 const total=await page.locator('.quiz-dots button').count();assert.equal(total,5);
 for(let i=0;i<total;i++){
  const answer=await page.evaluate(()=>S.quiz.plan.questions[S.quiz.index][2]);
  await page.locator(`[data-action="answer"][data-index="${answer}"]`).click();
  await page.locator(i===total-1?'[data-action="submit-quiz"]':'[data-action="quiz-next"]').click();
 }
 assert.match(await page.locator('.result').innerText(),/5\/5/);
 assert.equal(await page.evaluate(()=>S.items.find(x=>x.id==='1').status),'done');
 await page.reload();assert.equal(await page.evaluate(()=>S.items.find(x=>x.id==='1').status),'done');
 await page.locator('[data-action="select-item"][data-id="2"]').click();await page.locator('[data-action="start-quiz"]').click();await page.locator('[data-action="answer"]').first().waitFor();
 assert.equal(await page.locator('.quiz-dots button').count(),4);
 for(let i=0;i<4;i++){
  const wrong=await page.evaluate(()=>(S.quiz.plan.questions[S.quiz.index][2]+1)%4);
  await page.locator(`[data-action="answer"][data-index="${wrong}"]`).click();
  await page.locator(i===3?'[data-action="submit-quiz"]':'[data-action="quiz-next"]').click();
 }
 assert.equal(await page.evaluate(()=>S.items.find(x=>x.id==='2').status),'need');
 await page.locator('[data-action="exit-quiz"]').first().click();
 await page.locator('[data-action="select-item"][data-id="5"]').click();
 assert.equal(await page.locator('[data-action="start-quiz"]').isDisabled(),true);
 await page.locator('[data-action="supplement"]').click();await page.locator('[data-action="sample-source"]').click();
 await page.locator('[data-action="start-quiz"]').click();await page.locator('[data-action="answer"]').first().waitFor();
 assert.match(await page.locator('.question').innerText(),/Attention/);
 await page.locator('[data-view="courses"]').last().click();
 await page.locator('[data-action="toggle-course"][data-id="k4"]').click();assert.equal(await page.locator('[data-action="open-day"][data-day="1"][data-course="k4"]').isVisible(),false);
 await page.locator('[data-action="toggle-course"][data-id="k4"]').click();
 await page.screenshot({path:'/tmp/vinmark-courses.png',fullPage:true});
 await page.locator('[data-action="open-day"][data-course="k4"][data-day="1"]').click();
 await page.screenshot({path:'/tmp/vinmark-lesson.png',fullPage:true});
 assert.equal(await page.locator('.top').isVisible(),false);
 await page.locator('[data-action="goto-slide"][data-page="15"]').click();assert.match(await page.locator('.slide-box').innerText(),/token/);
 await page.locator('[data-action="select-material"][data-id="intro"]').click();assert.equal(await page.locator('.thumb').count(),2);
 await page.locator('[data-action="select-material"][data-id="main"]').click();await page.locator('[data-action="goto-slide"][data-page="11"]').click();
 const before=await page.evaluate(()=>S.items.length);
 const slideCount=await page.locator('.thumb').count();
 await page.locator('[data-action="save-slide"]').click();assert.equal(await page.evaluate(()=>S.items.length),before+1);assert.equal(await page.locator('.thumb').count(),slideCount);
 await page.locator('[data-action="save-slide"]').click();assert.equal(await page.evaluate(()=>S.items.length),before+1);
 await page.locator('[data-action="notes"]').click();await page.locator('#slide-note').fill('Ghi chú kiểm thử');
 await page.locator('[data-action="open-chat"]').first().click();await page.locator('#chat-input').fill('Vì sao Perceptron gặp giới hạn?');await page.locator('#chat-form button').click();
 assert.equal(await page.locator('.chat-message.assistant').count(),1);assert.equal(await page.evaluate(()=>S.items.length),before+2);
 await page.locator('[data-action="close-chat"]').click();await page.locator('[data-action="practice"]').click();
 await page.locator('#query').fill('perceptron');await page.locator('.card').first().click();await page.locator('[data-action="source"]').first().click();assert.equal(await page.locator('#page-number').inputValue(),'11');
 await page.locator('[data-action="back-lesson"]').first().click();await page.locator('#query').fill('<script>test</script>');assert.equal(await page.locator('.card').count(),0);
 await page.locator('#query').fill('');await page.screenshot({path:'/tmp/vinmark-practice.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.reload();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Practice mobile overflow');
 await page.locator('[data-view="courses"]').last().click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Courses mobile overflow');
 await page.locator('[data-action="open-day"][data-course="k4"][data-day="1"]').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Lesson mobile overflow');
 await page.screenshot({path:'/tmp/vinmark-mobile.png',fullPage:true});
 await page.locator('[data-action="toggle-sidebar"]').first().click();assert.equal(await page.locator('.lesson-sidebar').isVisible(),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: source navigation, search, 5/4-question plans, pass/fail persistence, missing context, courses, materials, slides, zoom, save deduplication, notes, tutor chat, mobile layouts.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
