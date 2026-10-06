import {date, between} from './calendar.ts';

export type BreakPlan = {start:string; end:string; days:number; leave:string[]};
export function suggestBreaks(anchor:string, holidays:string[], weekend:number[], earliest:string): BreakPlan[] {
 const target=date(anchor), daysOff=new Set(holidays), plans:BreakPlan[]=[];
 for(let budget=0;budget<=2;budget++){
  let best:BreakPlan[]=[];
  for(let before=0;before<=10;before++)for(let after=0;after<=10;after++){
   const start=target.subtract({days:before}),end=target.add({days:after});
   if(start.toString()<earliest)continue;
   const leave:string[]=[];
   for(let d=start;d.toString()<=end.toString();d=d.add({days:1})){
    if(!weekend.includes(d.dayOfWeek)&&!daysOff.has(d.toString()))leave.push(d.toString());
   }
   if(leave.length>budget)continue;
   const candidate={start:start.toString(),end:end.toString(),days:between(start.toString(),end.toString(),true),leave};
   if(!best.length||candidate.days>best[0].days||(candidate.days===best[0].days&&candidate.leave.length<best[0].leave.length))best=[candidate]; else if(candidate.days===best[0].days&&candidate.leave.length===best[0].leave.length)best.push(candidate);
  }
  best.sort((a,b)=>a.start.localeCompare(b.start)); for(const option of best)if(!plans.some(p=>p.start===option.start&&p.end===option.end))plans.push(option);
 }
 return plans;
}
