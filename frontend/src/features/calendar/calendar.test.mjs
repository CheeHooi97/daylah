import test from 'node:test';
import assert from 'node:assert/strict';
import { Temporal } from '@js-temporal/polyfill';
import { between,date,calendarPeriod,nextOccurrence,millisecondsToMidnight,today } from './calendar.ts';
import {holidayExpired,holidayZone,defaultWeekend,malaysiaStates,replacementDays} from './holidays.ts';
test('state weekend defaults use current Johor and northern state rules',()=>{
 for(const state of Object.keys(malaysiaStates)) assert.equal(defaultWeekend('MY',state),['KDH','KTN','TRG'].includes(state)?'fri-sat':'sat-sun');
 assert.equal(defaultWeekend('MY','JHR'),'sat-sun');
 assert.equal(defaultWeekend('SG','all'),'sat-sun');
 const plans=suggestBreaks('2027-05-17',['2027-05-16','2027-05-17','2027-05-18','2027-05-20'],[5,6],'2027-05-01');
 assert.ok(plans.some(p=>p.days===9&&p.leave.length===1&&p.leave[0]==='2027-05-19'));
});
import {suggestBreaks} from './breaks.ts';
test('break suggestions count leave separately from weekends and confirmed holidays',()=>{
 const plans=suggestBreaks('2026-11-08',['2026-11-08','2026-11-09'],[6,7],'2026-10-04');
 assert.equal(plans[0].days,3);
 assert.equal(plans[0].leave.length,0);
 assert.ok(plans.some(p=>p.days===5&&p.leave.length===2));
 for(const p of plans) assert.ok(!p.leave.includes('2026-11-09'));
 const unconfirmed=suggestBreaks('2026-11-08',['2026-11-08'],[6,7],'2026-10-04');
 assert.equal(unconfirmed[0].days,2);
 const past=suggestBreaks('2026-01-01',['2026-01-01'],[6,7],'2026-10-04');
 assert.equal(past.length,0);
});
test('holiday presets reject past dates but allow today and future dates',()=>{
 assert.equal(holidayExpired('2026-10-03','2026-10-04'),true);
 assert.equal(holidayExpired('2026-10-04','2026-10-04'),false);
 assert.equal(holidayExpired('2026-11-08','2026-10-04'),false);
 assert.equal(holidayZone('MY'),'Asia/Kuala_Lumpur');
 assert.equal(holidayZone('SG'),'Asia/Singapore');
});
test('strict dates and signed inclusive counts',()=>{
 assert.equal(between('2026-01-01','2026-01-01'),0); assert.equal(between('2026-01-01','2026-01-01',true),1);
 assert.equal(between('2026-01-03','2026-01-01',true),-3); assert.equal(between('2024-02-28','2024-03-01'),2);
 for(const v of ['2026-02-29','2026-04-31','2026-1-01','0000-01-01','']) assert.throws(()=>date(v));
 assert.equal(between('2026-12-31','2027-01-01'),1);
});
test('constrained calendar periods and future originals',()=>{
 assert.deepEqual(calendarPeriod('2024-02-29','2025-03-01'),{years:1,months:0,days:1,totalDays:366});
 assert.deepEqual(calendarPeriod('2026-01-31','2026-02-28'),{years:0,months:1,days:0,totalDays:28});
 assert.throws(()=>calendarPeriod('2027-01-01','2026-01-01'));
});
test('annual recurrence keeps leap policy and today',()=>{
 assert.equal(nextOccurrence('2000-02-29','2027-02-01','feb28'),'2027-02-28');
 assert.equal(nextOccurrence('2000-02-29','2027-02-01','mar1'),'2027-03-01');
 assert.equal(nextOccurrence('2000-02-29','2027-03-02','feb28'),'2028-02-29');
 assert.equal(nextOccurrence('2026-10-04','2026-10-04'),'2026-10-04');
 assert.equal(nextOccurrence('2030-01-01','2026-10-04'),'2030-01-01');
});
test('DST midnight is calendar-aware',()=>{
 assert.equal(millisecondsToMidnight('America/New_York',Temporal.Instant.from('2026-03-08T05:00:00Z')),23*3600000);
 assert.equal(millisecondsToMidnight('America/New_York',Temporal.Instant.from('2026-11-01T04:00:00Z')),25*3600000);
 assert.throws(()=>today('Not/AZone'));
});
test('Selangor birthday offers Thursday and Monday alternatives with at most two leave days',()=>{
 const plans=suggestBreaks('2026-12-11',['2026-12-11'],[6,7],'2026-10-04');
 assert.ok(plans.some(p=>p.days===4&&p.leave.length===1&&p.leave[0]==='2026-12-10'));
 assert.ok(plans.some(p=>p.days===4&&p.leave.length===1&&p.leave[0]==='2026-12-14'));
 assert.equal(plans.filter(p=>p.days===5&&p.leave.length===2).length,3);
 assert.ok(plans.every(p=>p.leave.length<=2));
});
test('replacement dates respect state rules, collisions and Saturday exclusions',()=>{
 assert.deepEqual(replacementDays('MY','SGR',['2026-11-08']),[{original:'2026-11-08',observed:'2026-11-09'}]);
 assert.deepEqual(replacementDays('MY','JHR',['2026-05-31','2026-06-01']),[{original:'2026-05-31',observed:'2026-06-02'}]);
 assert.deepEqual(replacementDays('MY','SGR',['2027-12-11']),[]);
 assert.deepEqual(replacementDays('MY','KDH',['2026-05-01']),[{original:'2026-05-01',observed:'2026-05-03'}]);
 assert.deepEqual(replacementDays('MY','KTN',['2026-05-01']),[]);
 assert.deepEqual(replacementDays('MY','KTN',['2026-03-21','2026-03-22']),[{original:'2026-03-21',observed:'2026-03-23'}]);
 assert.deepEqual(replacementDays('SG','all',['2026-11-08','2026-11-09']),[]);
 const replacement=replacementDays('MY','SGR',['2026-11-08']);
 const plans=suggestBreaks('2026-11-08',['2026-11-08',...replacement.map(r=>r.observed)],[6,7],'2026-10-04');
 assert.equal(plans[0].days,3);assert.equal(plans[0].leave.length,0);
});
test('Perak Friday birthday has no replacement but nearby Deepavali extends its break',()=>{
 const holidays=['2026-11-06','2026-11-08'];
 const replacements=replacementDays('MY','PRK',holidays);
 assert.deepEqual(replacements,[{original:'2026-11-08',observed:'2026-11-09'}]);
 const plans=suggestBreaks('2026-11-06',[...holidays,...replacements.map(r=>r.observed)],[6,7],'2026-10-04');
 assert.ok(plans.some(p=>p.start==='2026-11-06'&&p.end==='2026-11-09'&&p.days===4&&p.leave.length===0));
});
test('holiday order changes after the selected year halfway point',async()=>{
 const {holidaySortDescending}=await import('./holidays.ts');
 assert.equal(holidaySortDescending(2026,'2026-10-04'),true);
 assert.equal(holidaySortDescending(2027,'2026-10-04'),false);
 assert.equal(holidaySortDescending(2026,'2026-07-02'),false);
 assert.equal(holidaySortDescending(2026,'2026-07-03'),true);
 assert.equal(holidaySortDescending(2024,'2024-07-02'),false);
 assert.equal(holidaySortDescending(2024,'2024-07-03'),true);
});
