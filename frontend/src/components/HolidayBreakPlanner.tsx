import {useState} from 'react';
import {suggestBreaks} from '../features/calendar/breaks';
import {today} from '../features/calendar/calendar';
import {holidayZone,defaultWeekend,malaysiaStates,replacementDays} from '../features/calendar/holidays';

type Props={name:string;date:string;country:string;state:string;onStateChange:(state:string)=>void;availableStates:string[];holidayNames:Record<string,string>;holidays:string[];onClose:()=>void};
const shortDate=(value:string)=>new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const display=(value:string)=>new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
export function HolidayBreakPlanner(props:Props){
 const suggestedWeekend=defaultWeekend(props.country,props.state);
 const weekend=suggestedWeekend;
 const [extra,setExtra]=useState('');
 const needsState=props.country==='MY'&&props.state==='all';
 const localToday=today(holidayZone(props.country));
 const validExtra=/^\d{4}-\d{2}-\d{2}$/.test(extra)&&extra>=localToday;
 const replacements=replacementDays(props.country,props.state,props.holidays);
 const plans=needsState?[]:suggestBreaks(props.date,[...props.holidays,...replacements.map(day=>day.observed),...(validExtra?[extra]:[])],weekend==='sat-sun'?[6,7]:[5,6],localToday);
 const groups=[...new Set(plans.map(plan=>plan.days))].sort((a,b)=>a-b).map(days=>({days,options:plans.filter(plan=>plan.days===days)}));
 return <section className="break-planner" aria-labelledby="break-heading" tabIndex={-1}>
  <div className="section-heading"><div><h2 id="break-heading">Plan your break around {props.name}</h2><p>{display(props.date)} · Up to 2 leave days. Choose from the alternatives below.</p></div><button onClick={props.onClose}>Close suggestions</button></div>
  <p className="small muted">{needsState?'Choose a state to set the weekend automatically.':`Weekend defaults to ${suggestedWeekend==='fri-sat'?'Friday–Saturday':'Saturday–Sunday'} for ${props.country==='MY'?malaysiaStates[props.state]:'Singapore'}. Weekend calculated from the selected state; confirm your employer’s work schedule.`}{props.country==='MY'&&props.state==='JHR'?' Johor changed to Saturday–Sunday on 1 January 2025.':''}</p>
  <div className="holiday-filters">{props.country==='MY'&&<label className="field">Suggestion state / territory<select value={props.state} onChange={e=>props.onStateChange(e.target.value)}>{Object.entries(malaysiaStates).filter(([code])=>props.availableStates.includes(code)).map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label>}<label className="field">Additional confirmed day off (optional)<input type="date" min={localToday} value={extra} onChange={e=>setExtra(e.target.value)}/></label></div>
  {replacements.filter(day=>plans.some(plan=>day.observed>=plan.start&&day.observed<=plan.end)).map(day=><p className="small" key={day.original}>{day.original===props.date?'Replacement for this holiday':'Nearby holiday in this break'}: <strong>{props.holidayNames[day.original] || 'Public holiday'}</strong> falls on {shortDate(day.original)}; its replacement is <strong>{display(day.observed)}</strong>.</p>)}
  {needsState?<p>Select your Malaysian state or territory above to see applicable break suggestions.</p>:<div className="break-options">{groups.map(group=><article className="break-card" key={group.days}><header><h3>{group.days} days off</h3><p className="break-cost">{group.options[0].leave.length===0?'No leave needed':`${group.options[0].leave.length} leave ${group.options[0].leave.length===1?'day':'days'}`}</p></header><ul className="break-alternatives" aria-label={`${group.days}-day break options`}>{group.options.map(plan=><li className="break-alternative" key={plan.start+plan.end}>{group.options.length>1&&<p className="break-option-label">{plan.leave.every(day=>day<props.date)?'Start earlier':plan.leave.every(day=>day>props.date)?'Extend after':'Before and after'}</p>}<p className="break-range">{shortDate(plan.start)} – {shortDate(plan.end)}<span className="break-year">{plan.start.slice(0,4)===plan.end.slice(0,4)?plan.start.slice(0,4):`${plan.start.slice(0,4)}–${plan.end.slice(0,4)}`}</span></p><ul className="break-holidays" aria-label="Holidays included">{props.holidays.filter(day=>day>=plan.start&&day<=plan.end).map(day=><li key={day}>{props.holidayNames[day] || 'Public holiday'} · {shortDate(day)}</li>)}{replacements.filter(day=>day.observed>=plan.start&&day.observed<=plan.end).map(day=><li key={day.original+'-replacement'}>{props.holidayNames[day.original] || 'Public holiday'} (replacement) · {shortDate(day.observed)}</li>)}</ul>{plan.leave.length>0&&<p className="break-leave"><strong>Take leave</strong><span>{plan.leave.map(shortDate).join(' · ')}</span></p>}</li>)}</ul></article>)}</div>}
  <p className="small muted">Assumes your selected weekend and the published holidays for this location. Leave needs employer approval. Applicable replacement days are included for supported Malaysian states. Terengganu, Sabah and Sarawak replacement dates still require confirmation; add a confirmed day off above. Special additional gazettes are not included. Dates marked subject to change still need confirmation. Suggestions use the selected year’s schedule.</p>
 </section>;
}
