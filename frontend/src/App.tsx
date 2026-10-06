import { HolidayBreakPlanner } from './components/HolidayBreakPlanner';
import { canUseHoliday, holidayZone, malaysiaStates, holidaySortDescending } from './features/calendar/holidays';
import { initializeStorage, copyText, publicLink, shareLink, native } from './platform/native';
import { useEffect, useState, useId } from 'react';
import { between, calendarPeriod, dayLabel, millisecondsToMidnight, nextOccurrence, today, validateZone } from './features/calendar/calendar';
import { api, readEvents, readShares, writeEvents, writeShares } from './lib/storage';
import type { Event, OwnedShare } from './lib/storage';
import type { LeapPolicy } from './features/calendar/calendar';
import './styles.css';
import { Icon, CalendarSpan } from './components/CalendarVisual';
type Mode = 'between' | 'until' | 'age' | 'anniversary';
type Snapshot = Pick<Event, 'title' | 'date' | 'timezone' | 'recurrence' | 'leapPolicy' | 'theme'> & {
    publicId?: string;
};
type Holiday = {
    states?: string[];
    name: string;
    date: string;
    observedDate?: string;
    sourceUrl: string;
    verificationDate: string;
    jurisdiction: string;
    note?: string;
};
type Coverage = {
    country: string;
    year: number;
    status: string;
    scope: string;
    records: Holiday[];
    version: string;
};
// Sharing stays locked until server-verified subscriber access is implemented.
const sharingEnabled = false;
const modes: Record<Mode, string> = { between: 'Between dates', until: 'Until a date', age: 'Age', anniversary: 'Anniversary' };
function detectedZone() { try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
catch {
    return 'UTC';
} }
function DateField({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) { const [manual, setManual] = useState(false); const id = useId(); return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type={manual ? 'text' : 'date'} value={value} placeholder="YYYY-MM-DD" onChange={e => onChange(e.target.value)}/><button className="text-button small" type="button" onClick={() => setManual(!manual)}>{manual ? 'Use calendar' : 'Type date instead'}</button></div>; }
function App() {
    const [, setClockTick] = useState(0);
    const [activeSection,setActiveSection]=useState("calculator");
    const [settingsOpen,setSettingsOpen]=useState(()=>matchMedia("(min-width:701px)").matches);
    useEffect(()=>{const media=matchMedia("(min-width:701px)");const change=()=>setSettingsOpen(media.matches);media.addEventListener("change",change);return()=>media.removeEventListener("change",change);},[]);
    const [zone, setZone] = useState(detectedZone), [now, setNow] = useState(() => today(detectedZone()));
    const [mode, setMode] = useState<Mode>(() => location.pathname.includes('anniversary') ? 'anniversary' : location.pathname.includes('age') ? 'age' : location.pathname.includes('until') ? 'until' : 'between');
    const [start, setStart] = useState(now), [end, setEnd] = useState(() => nextOccurrence(`${now.slice(0, 4)}-12-25`, now)), [inclusive, setInclusive] = useState(false), [policy] = useState<LeapPolicy>('feb28');
    const [events, setEvents] = useState<Event[]>([]), [shares, setShares] = useState<OwnedShare[]>([]), [storageReady, setStorageReady] = useState(false), [message, setMessage] = useState('');
    const [holidayEditorCountry, setHolidayEditorCountry] = useState<string | null>(null);
    useEffect(() => {
        if (!message.startsWith('Break suggestions use ')) return;
        const timer = setTimeout(() => setMessage(current => current === message ? '' : current), 5000);
        return () => clearTimeout(timer);
    }, [message]);
    const [editor, setEditor] = useState<Event | null>(null), [preview, setPreview] = useState<Snapshot | null>(null), [originalYear, setOriginalYear] = useState(false), [busy, setBusy] = useState(false), [publicSnapshot, setPublicSnapshot] = useState<Snapshot | null>(null), [shareLoading, setShareLoading] = useState(location.pathname.startsWith('/s/'));
    const [breakState, setBreakState] = useState('SGR');
    const [holidayBreak, setHolidayBreak] = useState<{name:string;date:string;country:string} | null>(null);
    const [holidayState, setHolidayState] = useState('all');
    const [country, setCountry] = useState('MY'), [year, setYear] = useState('2026'), [coverage, setCoverage] = useState<Coverage | null>(null), [cached, setCached] = useState(false);
    useEffect(() => { void initializeStorage().then(()=>{ try {
        setEvents(readEvents());
        setShares(readShares());
        setStorageReady(true);
    }
    catch (e) {
        setMessage((e as Error).message + ' Existing data has been preserved.');
    } }).catch(()=>setMessage('Device storage is unavailable. Calculations still work.')); }, []);
    useEffect(() => { let timer: ReturnType<typeof setTimeout>; const refresh = () => { try {
        setNow(today(zone));
        setClockTick(t => t + 1);
        timer = setTimeout(refresh, Math.min(...[zone, ...events.map(e => e.timezone), ...(publicSnapshot ? [publicSnapshot.timezone] : [])].map(z => millisecondsToMidnight(z))) + 100);
    }
    catch { } }; refresh(); const visible = () => { if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        refresh();
    } }; document.addEventListener('visibilitychange', visible); window.addEventListener("daylah:resume",visible); return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', visible);window.removeEventListener('daylah:resume',refresh); }; }, [zone, events, publicSnapshot]);
    useEffect(() => { if (!location.pathname.startsWith('/s/'))
        return; document.querySelector('meta[name="robots"]')?.remove(); const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex,nofollow'; document.head.append(meta); api<Snapshot>(`/countdowns/${encodeURIComponent(location.pathname.split('/')[2])}`).then(setPublicSnapshot).catch(e => setMessage(e.message)).finally(() => setShareLoading(false)); }, []);
    useEffect(() => { let active = true; setCoverage(null); setCached(false); fetch(`/holidays/${country}-${year}.json`).then(r => { if (!r.ok)
        throw Error(); if (active)
        setCached(!navigator.onLine || r.headers.get('X-Daylah-Cached') === 'true'); return r.json(); }).then(data => { if (active) {
        setCoverage(data);
    } }).catch(() => { if (active)
        setCoverage({ country, year: Number(year), status: 'unavailable', scope: 'No verified coverage is available for this selection.', records: [], version: '2026-10-04' }); }); return () => { active = false; }; }, [country, year]);
    useEffect(() => { const element = editor ? document.querySelector<HTMLInputElement>('.editor input') : preview ? document.querySelector<HTMLElement>('.share-preview h2') : null; if (element) {
        element.tabIndex = element.tabIndex < 0 ? 0 : element.tabIndex;
        element.focus({ preventScroll: true });
        element.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    } }, [editor?.id, preview]);
    useEffect(()=>{let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const sections=['calculator','saved','holidays'];let current='calculator';for(const id of sections){const node=document.getElementById(id);if(node&&node.getBoundingClientRect().top<Math.min(120,innerHeight*.2))current=id;}setActiveSection(current);});};window.addEventListener('scroll',update,{passive:true});update();return()=>{window.removeEventListener('scroll',update);cancelAnimationFrame(frame);};},[]);
    let answer = '', detail = '', error = '', count = 0;
    try {
        validateZone(zone);
        if (mode === 'between') {
            count = between(start, end, inclusive);
            answer = count.toLocaleString();
            detail = `${count < 0 ? 'Backwards interval · ' : ''}${inclusive ? 'Including both dates' : 'Elapsed days, excluding the start date'}`;
        }
        else if (mode === 'until') {
            count = between(now, end);
            answer = count === 0 ? 'Today' : Math.abs(count).toLocaleString();
            detail = count === 0 ? 'Your date is here.' : count > 0 ? 'days until your date' : 'days since your date';
        }
        else {
            const p = calendarPeriod(start, now);
            answer = `${p.years}`;
            count = p.totalDays;
            detail = `years, ${p.months} months, ${p.days} days · ${p.totalDays.toLocaleString()} days total`;
        }
    }
    catch (e) {
        error = (e as Error).message;
    }
    async function copy(text: string) { try {
        await copyText(text);
        setMessage('Copied to clipboard.');
    }
    catch {
        setMessage('Clipboard access failed. Select and copy the text below.');
        const textArea = document.getElementById('copy-fallback') as HTMLTextAreaElement | null;
        if (textArea) {
            textArea.value = text;
            textArea.hidden = false;
            textArea.focus();
            textArea.select();
        }
    } }
    async function save() { if (!editor)
        return; try {
        if (!storageReady)
            throw Error('Storage is unavailable. Your calculation still works.');
        between(editor.date, editor.date);
        if (holidayEditorCountry && !canUseHoliday(editor.date, holidayEditorCountry)) throw Error('This holiday date has passed. Choose today or a future date.');
        validateZone(editor.timezone);
        if (!editor.title.trim() || [...editor.title].length > 120)
            throw Error('Enter a title between 1 and 120 characters.');
        const next = [...events.filter(e => e.id !== editor.id), { ...editor, title: editor.title.trim(), savedAt: new Date().toISOString() }];
        await writeEvents(next);
        setEvents(next);
        setEditor(null);
        setMessage('Saved on this device.');
    }
    catch (e) {
        setMessage((e as Error).message);
    } }
    async function remove(id: string) { try {
        const next = events.filter(e => e.id !== id);
        await writeEvents(next);
        setEvents(next);
        setMessage('Event removed from this device.');
    }
    catch {
        setMessage('Storage failed. The event has not been removed.');
    } }
    function newEvent(dateValue = end, title = '') { setHolidayEditorCountry(null); setEditor({ schemaVersion: 1, id: crypto.randomUUID(), title, date: dateValue, timezone: zone, recurrence: mode === 'age' || mode === 'anniversary' ? 'annual' : 'none', leapPolicy: policy, theme: 'indigo', notes: '' }); }
    function review(e: Event) { if (!sharingEnabled) return; setPreview({ title: e.title, date: e.date, timezone: e.timezone, recurrence: e.recurrence, leapPolicy: e.leapPolicy, theme: e.theme }); setOriginalYear(false); }
    function useHoliday(date: string, title: string) {
        if (!canUseHoliday(date, country)) return;
        if (country === 'MY' && holidayState === 'all') {
            const holiday = coverage?.records.find(h => h.date === date && h.name === title)
                ?? coverage?.records.find(h => h.observedDate === date && `${h.name} (observed)` === title);
            const applicable = holiday?.states ?? [];
            const selected = applicable.includes('SGR') ? 'SGR' : applicable[0];
            if (selected) {
                setBreakState(selected);
                setMessage(`Break suggestions use ${malaysiaStates[selected]}. Change the suggestion state if needed.`);
            }
        }
        if (holidayState !== 'all') setBreakState(holidayState);
        setHolidayBreak({name:title,date,country});
        setMode('until'); setEnd(date); setZone(holidayZone(country));
        requestAnimationFrame(() => { const element=document.querySelector<HTMLElement>('.break-planner'); element?.focus({preventScroll:true}); element?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); });
        newEvent(date, title); setHolidayEditorCountry(country);
        setEditor(current => current ? { ...current, timezone: holidayZone(country), recurrence: 'none' } : current);
    }
    const reviewed = preview ? { ...preview, date: preview.recurrence === 'annual' && !originalYear ? nextOccurrence(preview.date, today(preview.timezone), preview.leapPolicy) : preview.date } : null;
    async function publish() { if (!sharingEnabled || !reviewed || busy)
        return; setBusy(true); try {
        if (!storageReady)
            throw Error('Device storage is unavailable. Sharing requires saving your revocation token.');
        publicLink("preview");
        await writeShares(shares);
        const result = await api<{
            snapshot: Snapshot & {
                publicId: string;
            };
            deletionToken: string;
        }>('/countdowns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewed) });
        const owned = { publicId: result.snapshot.publicId, deletionToken: result.deletionToken, title: result.snapshot.title };
        const next = [...shares, owned];
        try {
            await writeShares(next);
        }
        catch {
            try {
                await api(`/countdowns/${owned.publicId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${owned.deletionToken}` } });
            }
            catch {
                setShares(next);
                setMessage(`Storage failed and automatic revocation failed. Keep this deletion token: ${owned.deletionToken}`);
                return;
            }
            throw Error('Storage failed. The new public link was revoked.');
        }
        setShares(next);
        setPreview(null);
        await copy(publicLink(owned.publicId));
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function shareOwned(s: OwnedShare) { try { const url=publicLink(s.publicId); if(native)await shareLink(s.title,url);else await copy(url); } catch(e) { setMessage((e as Error).message); } }
    async function revoke(s: OwnedShare) { setBusy(true); try {
        await api(`/countdowns/${s.publicId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${s.deletionToken}` } });
        const next = shares.filter(x => x.publicId !== s.publicId);
        await writeShares(next);
        setShares(next);
        setMessage('Public link revoked.');
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    const holidaysPage = location.pathname.replace(/\/$/, '') === '/holidays';
    const savedPage = location.pathname.replace(/\/$/, '') === '/saved-dates';
    const sorted = events.map(e => { const current = today(e.timezone); const target = e.recurrence === 'annual' ? nextOccurrence(e.date, current, e.leapPolicy) : e.date; return { ...e, target, label: dayLabel(target, current), days: between(current, target) }; }).sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? '') || events.findIndex(e=>e.id===b.id) - events.findIndex(e=>e.id===a.id));
    const visibleEvents = savedPage ? sorted : sorted.slice(0, 2);
    const applicableHolidays = coverage?.records.filter(h => country !== 'MY' || holidayState === 'all' || h.states?.includes(holidayState)) ?? [];
    const descendingHolidays = holidaySortDescending(Number(year), today(holidayZone(country)));
    const visibleHolidays = holidaysPage ? [...applicableHolidays].sort((a,b) => descendingHolidays ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)) : applicableHolidays.filter(h => canUseHoliday(h.date, country)).sort((a,b) => a.date.localeCompare(b.date)).slice(0,6);
    const sharedPage = location.pathname.startsWith('/s/');
    return <><a className="skip-link" href={savedPage || holidaysPage ? "/#calculator" : "#calculator"}>Skip to calculator</a><header className="site-header"><a className="brand" href="/"><img src="/symbol.svg" alt=""/><span className="brand-wordmark">Day<span className="brand-lah">Lah</span><span className="brand-dot" aria-hidden="true"></span></span></a><nav aria-label="Main navigation"><a href={savedPage || holidaysPage ? "/#calculator" : "#calculator"} aria-current={activeSection === "calculator" ? "location" : undefined}>Calculator</a><a href="/saved-dates/" aria-current={savedPage ? "page" : undefined}>Your dates</a><a href="/holidays/" aria-current={holidaysPage ? "page" : undefined}>Holidays</a></nav><span className="header-note">A little clarity for your calendar.</span></header><main>
 {sharedPage ? <section className={`shared theme-${publicSnapshot?.theme || 'indigo'}`}><h1>{publicSnapshot?.title || 'Shared countdown'}</h1>{shareLoading ? <p>Loading countdown…</p> : publicSnapshot ? <><div className="result-number">{dayLabel(publicSnapshot.recurrence === 'annual' ? nextOccurrence(publicSnapshot.date, today(publicSnapshot.timezone), publicSnapshot.leapPolicy) : publicSnapshot.date, today(publicSnapshot.timezone))}</div><p>{publicSnapshot.date} · {publicSnapshot.timezone} · {publicSnapshot.recurrence === 'annual' ? 'Every year' : 'One time'}</p></> : <p>This link is unavailable or has been revoked.</p>}<a href="/">Calculate your own dates</a></section> : <>
 {!savedPage && !holidaysPage && <><section className="intro"><h1>Make every day <span>count.</span></h1><p>For the plans ahead. And the moments that matter.</p></section>
 <section id="calculator" className="calculator" aria-label="Date calculator"><div className="mode-nav" aria-label="Calculation mode">{Object.entries(modes).map(([key, label]) => <button key={key} aria-pressed={mode === key} className={mode === key ? 'active' : ''} onClick={() => setMode(key as Mode)}><Icon name={key}/>{label}</button>)}</div><div className="calculator-body"><div className="inputs"><h2>{mode === 'between' ? 'How many days between?' : mode === 'until' ? 'Something to look forward to.' : mode === 'age' ? 'A lifetime, in days.' : 'Another year of your story.'}</h2><p className="muted">{mode === 'between' ? 'Pick two dates. We’ll take care of the counting.' : mode === 'until' ? 'Choose a date to see how near (or far) it is.' : 'Start with the date it all began.'}</p><div className="date-pair">{mode !== 'until' && <DateField label={mode === 'age' ? 'Date of birth' : mode === 'anniversary' ? 'Original anniversary' : 'Start date'} value={start} onChange={setStart}/>} {(mode === 'between' || mode === 'until') && <DateField label={mode === 'between' ? 'End date' : 'Your date'} value={end} onChange={setEnd}/>}</div>{mode === 'between' ? <label className="check"><input type="checkbox" checked={inclusive} onChange={e => setInclusive(e.target.checked)}/> Include both start and end dates</label> : <p className="small muted">Today is {now} in {zone}.</p>}<details className="timezone-settings" open={settingsOpen} onToggle={e=>setSettingsOpen(e.currentTarget.open)}><summary>Timezone <span>{zone}</span></summary><label className="field timezone">Timezone<input aria-label="Timezone" list="zones" value={zone} onChange={e => setZone(e.target.value)}/><datalist id="zones">{['UTC', 'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Europe/London', 'America/New_York', 'Australia/Sydney'].map(z => <option key={z}>{z}</option>)}</datalist></label></details>{zone === 'UTC' && <p className="small muted">UTC is used if browser timezone detection is unavailable.</p>}</div><div className="result" aria-live="polite" aria-atomic="true"><div className="result-heading"><Icon name={mode}/><span>{mode === "between" ? "Your date interval" : mode === "until" ? "Your countdown" : mode === "age" ? "Your calendar age" : "Your anniversary"}</span></div>{error ? <p className="error">{error}</p> : <><span className="result-number">{answer}</span><p className="result-unit">{mode === 'between' ? 'days' : mode === 'age' || mode === 'anniversary' ? 'years' : detail}</p>{mode === 'between' || mode === 'age' || mode === 'anniversary' ? <p className="result-detail">{detail}</p> : null}{(mode === 'age' || mode === 'anniversary') && <p className="next-date">{dayLabel(nextOccurrence(start, now, policy), now)} {mode === 'age' ? 'your next birthday' : 'your next anniversary'}</p>}<CalendarSpan start={mode === "between" ? start : now} end={mode === "between" || mode === "until" ? end : nextOccurrence(start, now, policy)}/><p className="small">{mode === 'between' ? `${start} → ${end}` : `As of ${now}`} · {zone}</p><div className="result-actions"><button className="primary" onClick={() => newEvent(mode === 'age' || mode === 'anniversary' ? start : end)}><Icon name="saved"/>Save a date</button><button onClick={() => copy(`${answer} ${mode === 'between' ? 'days' : detail} · ${zone}`)}><Icon name="copy"/>Copy result</button></div></>}</div></div></section>
 </>}
 {savedPage && <section className="intro"><h1>Your saved dates</h1><p>All your countdowns, saved privately on this device.</p></section>}
 {!holidaysPage && <section id="saved" className="saved"><div className="section-heading"><div><h2>Your dates, close at hand.</h2><p className="muted local-caption"><Icon name="lock"/>Saved on this device. No account needed.</p></div><button onClick={() => newEvent()}><Icon name="plus"/>Add a date</button></div>{editor && <div className="editor"><h3>{events.some(e => e.id === editor.id) ? 'Edit your date' : 'Save something meaningful'}</h3><div className="form-grid"><label className="field">Event name<input maxLength={120} value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} placeholder="A birthday, a trip, a new beginning…"/></label><DateField label="Original date" value={editor.date} onChange={v => setEditor({ ...editor, date: v })}/><label className="field">Timezone<input value={editor.timezone} onChange={e => setEditor({ ...editor, timezone: e.target.value })}/></label><label className="field">Repeat<select value={editor.recurrence} onChange={e => setEditor({ ...editor, recurrence: e.target.value as Event['recurrence'] })}><option value="none">One time</option><option value="annual">Every year</option></select></label><label className="field">Colour<select value={editor.theme} onChange={e => setEditor({ ...editor, theme: e.target.value as Event['theme'] })}><option value="indigo">Indigo</option><option value="rose">Rose</option><option value="forest">Forest</option></select></label><label className="field notes">Private notes<textarea value={editor.notes} onChange={e => setEditor({ ...editor, notes: e.target.value })}/></label></div><button className="primary" onClick={save}>Save on this device</button> <button onClick={() => setEditor(null)}>Cancel</button></div>}{sorted.length === 0 ? <div className="empty"><div className="empty-calendar" aria-hidden="true"><span>{new Intl.DateTimeFormat("en",{month:"short",timeZone:"UTC"}).format(new Date(`${now}T12:00:00Z`))}</span><b>{Number(now.slice(-2))}</b></div><div><h3>A space for your next special day.</h3><p>Add a date and come back to see it getting closer.</p></div></div> : <div className="event-list">{visibleEvents.map(e => <article className={`event theme-${e.theme}`} key={e.id}><div><h3>{e.title}</h3><p>{e.target} · {e.timezone}{e.recurrence === 'annual' ? ' · Every year' : ''}</p>{e.notes && <p>{e.notes}</p>}</div><strong>{e.label}{e.days < 0 ? ' · Overdue' : ''}</strong><div className="event-actions"><button onClick={() => { setHolidayEditorCountry(null); setEditor(e); }}>Edit</button><button disabled={!sharingEnabled} title="Sharing is coming soon" onClick={() => review(e)}>Share · Coming soon</button><button onClick={() => remove(e.id)}>Delete</button></div></article>)}</div>}{!savedPage && sorted.length > 2 && <div className="saved-list-footer"><p>Showing your 2 latest dates</p><a className="view-more" href="/saved-dates/"><span>View all dates</span><span className="view-more-count">{sorted.length}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>}</section>}
 {reviewed && <section className="share-preview"><h2>Review your public countdown</h2><p>Anyone with the link can see these exact fields. Private notes stay on this device.</p><dl>{Object.entries(reviewed).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{preview?.recurrence === 'annual' && <label className="check"><input type="checkbox" checked={originalYear} onChange={e => setOriginalYear(e.target.checked)}/> Include the original year (can reveal age)</label>}<p className="small">Your deletion token is saved on this device. Clearing browser data loses anonymous revocation access. Editing a local event won’t change this snapshot.</p><button className="primary" disabled={!sharingEnabled || busy} onClick={publish}>{busy ? 'Creating…' : 'Create public link'}</button> <button onClick={() => setPreview(null)}>Cancel</button></section>}
 {shares.length > 0 && <section><h2>Your public links</h2>{shares.map(s => <div className="share-row" key={s.publicId}><span>{s.title}</span><button disabled={!sharingEnabled} title="Sharing is coming soon" onClick={() => void shareOwned(s)}>{native ? "Share link" : "Copy link"}</button><button disabled={busy} onClick={() => revoke(s)}>Revoke</button></div>)}</section>}
 {holidaysPage && <section className="intro"><h1>Plan around the holidays</h1><p>Find public holidays and make more of your days off.</p></section>}
 {!savedPage && <section id="holidays" className="holidays"><div className="section-heading"><div><h2>A date worth planning around.</h2><p className="muted">Government-published holiday presets for Malaysia and Singapore.</p></div><div className="holiday-filters"><label className="field">Country<select value={country} onChange={e => setCountry(e.target.value)}><option value="SG">Singapore</option><option value="MY">Malaysia</option></select></label>{country === 'MY' && <label className="field">State / territory<select value={holidayState} onChange={e => setHolidayState(e.target.value)}><option value="all">All states</option>{Object.entries(malaysiaStates).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>}<label className="field">Year<select value={year} onChange={e => setYear(e.target.value)}><option>2026</option><option>2027</option></select></label></div></div>{coverage ? <><p className="coverage">{coverage.scope} {cached ? 'Cached coverage · ' : ''}Dataset {coverage.version}. Calendar days only; holidays are not excluded from calculations.</p>{holidayBreak && holidayBreak.country === country && holidayBreak.date.startsWith(year) && <HolidayBreakPlanner key={holidayBreak.date+country+breakState} name={holidayBreak.name} date={holidayBreak.date} country={country} state={breakState} onStateChange={setBreakState} availableStates={coverage.records.find(h => h.name === holidayBreak.name && h.date === holidayBreak.date)?.states ?? Object.keys(malaysiaStates)} holidayNames={Object.fromEntries(coverage.records.map(h => [h.date, h.name]))} holidays={coverage.records.filter(h => country !== 'MY' || h.states?.includes(breakState)).flatMap(h => [h.date, ...(h.observedDate ? [h.observedDate] : [])])} onClose={() => setHolidayBreak(null)}/>}<div className="holiday-list">{visibleHolidays.map((h, i) => <article key={`${h.date}-${i}`}><div><h3>{h.name}</h3><p>{h.date} · {h.jurisdiction}{h.observedDate ? ` · Observed ${h.observedDate}` : ''}</p>{h.note && <p>{h.note}</p>}<a className="small" href={h.sourceUrl} target="_blank" rel="noreferrer">Government source</a></div><button disabled={!canUseHoliday(h.date, country)} title={!canUseHoliday(h.date, country) ? 'This holiday has passed' : undefined} onClick={() => useHoliday(h.date, h.name)}>{canUseHoliday(h.date, country) ? 'Use date' : 'Date passed'}</button>{h.observedDate && <button disabled={!canUseHoliday(h.observedDate!, country)} onClick={() => useHoliday(h.observedDate!, `${h.name} (observed)`)}>{canUseHoliday(h.observedDate!, country) ? 'Use observed date' : 'Observed date passed'}</button>}</article>)}</div>{!holidaysPage && <div className="saved-list-footer"><p>Next {visibleHolidays.length} upcoming holidays</p><a className="view-more" href="/holidays/">View all holidays<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>}</> : <p>Loading holiday coverage…</p>}</section>}</>}
 {message && <div className="message" role="status"><p>{message}</p><button aria-label="Dismiss message" onClick={() => setMessage('')}>Dismiss</button></div>}{!sharedPage && <nav className="mobile-nav" aria-label="Mobile navigation"><a href={savedPage || holidaysPage ? "/#calculator" : "#calculator"} aria-current={activeSection === "calculator" ? "location" : undefined}><Icon name="between"/><span>Calculate</span></a><a href="/saved-dates/" aria-current={savedPage ? "page" : undefined}><Icon name="saved"/><span>Your dates</span></a><a href="/holidays/" aria-current={holidaysPage ? "page" : undefined}><Icon name="holiday"/><span>Holidays</span></a></nav>}<textarea id="copy-fallback" aria-label="Copy this result manually" hidden readOnly/><footer><a className="brand" href="/"><span className="brand-wordmark">Day<span className="brand-lah">Lah</span><span className="brand-dot" aria-hidden="true"></span></span></a><p>A little tool for the days that matter.</p><p>Calculations &amp; saved dates work offline. <a href={native ? "/privacy/index.html" : "/privacy/"}>Privacy policy</a></p></footer></main></>;
}
export default App;
