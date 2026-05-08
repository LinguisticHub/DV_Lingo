const data = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260509T010000Z
DTEND:20260509T233000Z
END:VEVENT
END:VCALENDAR`;

const events = [];
const lines = data.split(/\r?\n/);
let currentEvent = null;

for (let line of lines) {
  if (line.startsWith('BEGIN:VEVENT')) {
    currentEvent = {};
  } else if (line.startsWith('END:VEVENT')) {
    if (currentEvent.start && currentEvent.end) events.push(currentEvent);
    currentEvent = null;
  } else if (currentEvent) {
    if (line.startsWith('DTSTART')) {
      const val = line.split(/[:;]/).pop();
      currentEvent.start = parseICSDate(val);
    } else if (line.startsWith('DTEND')) {
      const val = line.split(/[:;]/).pop();
      currentEvent.end = parseICSDate(val);
    }
  }
}

function parseICSDate(dateStr) {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(9, 11)) || 0;
  const min = parseInt(dateStr.substring(11, 13)) || 0;
  const sec = parseInt(dateStr.substring(13, 15)) || 0;
  return new Date(Date.UTC(year, month, day, hour, min, sec));
}

console.log(events);

// Let's test the availability logic
const date = new Date('2026-05-09T00:00:00'); // Let's say it's local May 9
// h = 9, m = 0
const slotDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 9 - 8, 0));
const slotEndUTC = new Date(slotDateUTC.getTime() + 60 * 60 * 1000); 

let isBusy = false;
if (events.some(event => slotDateUTC < event.end && slotEndUTC > event.start)) {
  isBusy = true;
}
console.log('isBusy for 09:00 MYT (01:00 UTC):', isBusy, slotDateUTC, slotEndUTC);
