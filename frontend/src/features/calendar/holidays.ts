import { between, today, date } from './calendar.ts';

export type Replacement = {original:string; observed:string};
export function replacementDays(country:string,state:string,holidays:string[]):Replacement[] {
    // Singapore observed dates are supplied by MOM in the dataset.
    // Sabah/Sarawak require their own gazettes; do not infer them from Act 369.
    if(country!=='MY'||state==='all'||['SBH','SWK','TRG'].includes(state))return [];
    const restDay=state==='KDH'?5:state==='KTN'?6:7;
    const occupied=new Set(holidays), replacements:Replacement[]=[];
    for(const original of [...new Set(holidays)].sort()){
        if(date(original).dayOfWeek!==restDay)continue;
        let next=date(original).add({days:1});
        while(occupied.has(next.toString())||next.dayOfWeek===restDay||((state==='KDH'||state==='KTN')&&next.dayOfWeek===5)|| (state==='KDH'&&next.dayOfWeek===6))next=next.add({days:1});
        occupied.add(next.toString());replacements.push({original,observed:next.toString()});
    }
    return replacements;
}

export const malaysiaStates: Record<string, string> = {
    KUL: 'Kuala Lumpur', LBN: 'Labuan', PJY: 'Putrajaya', JHR: 'Johor',
    KDH: 'Kedah', KTN: 'Kelantan', MLK: 'Melaka', NSN: 'Negeri Sembilan',
    PHG: 'Pahang', PRK: 'Perak', PLS: 'Perlis', PNG: 'Penang', SBH: 'Sabah',
    SWK: 'Sarawak', SGR: 'Selangor', TRG: 'Terengganu',
};

// Current defaults for the supported 2026/2027 schedules. Employer rosters can differ.
export function defaultWeekend(country: string, state: string) {
    return country === 'MY' && ['KDH', 'KTN', 'TRG'].includes(state) ? 'fri-sat' : 'sat-sun';
}

export function holidayZone(country: string) {
    return country === 'MY' ? 'Asia/Kuala_Lumpur' : 'Asia/Singapore';
}

export function holidayExpired(date: string, localToday: string) {
    return between(localToday, date) < 0;
}

export function canUseHoliday(date: string, country: string) {
    return !holidayExpired(date, today(holidayZone(country)));
}

export function holidaySortDescending(year: number, localToday: string) {
    const start = `${year}-01-01`;
    const nextYear = `${year + 1}-01-01`;
    return between(start, localToday) > between(start, nextYear) / 2;
}
