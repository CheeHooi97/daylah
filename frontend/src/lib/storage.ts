import { getStored, setStored, apiOrigin } from '../platform/native';
import { date, validateZone } from '../features/calendar/calendar';
import type { LeapPolicy, Recurrence } from '../features/calendar/calendar';
export type Event = {
    schemaVersion: 1;
    savedAt?: string;
    id: string;
    title: string;
    date: string;
    timezone: string;
    recurrence: Recurrence;
    leapPolicy: LeapPolicy;
    theme: 'indigo' | 'rose' | 'forest';
    notes: string;
};
export type OwnedShare = {
    publicId: string;
    deletionToken: string;
    title: string;
};
export function validEvent(v: unknown): v is Event {
    try {
        const e = v as Event;
        date(e.date);
        validateZone(e.timezone);
        return e.schemaVersion === 1 && typeof e.id === 'string' && typeof e.title === 'string' && e.title.trim().length > 0 && [...e.title].length <= 120 && ['none', 'annual'].includes(e.recurrence) && ['feb28', 'mar1'].includes(e.leapPolicy) && ['indigo', 'rose', 'forest'].includes(e.theme) && typeof e.notes === 'string';
    }
    catch {
        return false;
    }
}
export function readEvents(): Event[] { const raw = getStored('daylah.events.v1'); if (!raw)
    return []; const list: unknown = JSON.parse(raw); if (!Array.isArray(list) || !list.every(validEvent))
    throw new Error('Saved data could not be read. Export or clear browser storage to recover.'); return list; }
export async function writeEvents(events: Event[]) { await setStored('daylah.events.v1', JSON.stringify(events)); }
export function readShares(): OwnedShare[] { const data = JSON.parse(getStored('daylah.shares.v1') || '[]'); if (!Array.isArray(data) || !data.every(s => typeof s.publicId === 'string' && typeof s.deletionToken === 'string' && typeof s.title === 'string'))
    throw new Error('Share ownership data could not be read.'); return data; }
export async function writeShares(shares: OwnedShare[]) { await setStored('daylah.shares.v1', JSON.stringify(shares)); }
export async function api<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${apiOrigin()}/v1${path}`, init); if (!response.ok) {
    let message = 'Sharing is unavailable. Check your connection and try again.';
    try {
        message = (await response.json()).error || message;
    }
    catch { }
    throw new Error(message);
} return response.status === 204 ? undefined as T : response.json(); }
