import { date, between } from '../features/calendar/calendar';
export function Icon({name}:{name:string}) {
 const paths:Record<string,string>={between:'M4 6h16M4 18h16M7 3v6M17 15v6M8 12h8m-3-3 3 3-3 3',until:'M8 3v4m8-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1M12 12v3l2 1',age:'M5 13h14v7H5zM4 13h16M8 9v4m4-4v4m4-4v4M8 5v1m4-3v3m4-1v1',anniversary:'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12',saved:'M6 3h12v18l-6-4-6 4z',holiday:'M5 21V3m0 1c5-3 9 3 14 0v9c-5 3-9-3-14 0',copy:'M9 9h11v11H9zM15 5V3H3v12h2',plus:'M12 5v14M5 12h14',lock:'M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3'};
 return <svg className="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.between}/></svg>;
}
export function CalendarSpan({start,end}:{start:string;end:string}){
 try{const first=date(start);const total=between(start,end);return <div className="calendar-strip" aria-hidden="true">{Array.from({length:7},(_,i)=>{const d=first.add({days:Math.round(total*i/6)});return <span className={i===0||i===6?'endpoint':''} key={i}><small>{d.toLocaleString('en',{month:'short'})}</small><b>{d.day}</b></span>;})}</div>;}catch{return null;}
}
