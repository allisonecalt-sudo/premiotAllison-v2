/* eslint-disable no-unused-vars */
// premiotAllison-v2 — multi-clinic premium calculator
// Hebrew RTL. Domain terms in Hebrew. Calc logic unchanged from v1, just per-clinic.

// ---- Currency / number formatters (single canonical pair) ----
const ILS = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const ILS0 = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
function fmtILS(n) {
  if (!isFinite(n)) return ILS.format(0);
  return ILS.format(n);
}
function fmtILS0(n) {
  if (!isFinite(n)) return ILS0.format(0);
  return ILS0.format(n);
}

function v(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  return parseFloat(el.value) || 0;
}
function set(id, val, unit) {
  const el = document.getElementById(id);
  if (el) el.textContent = val + (unit ? ' ' + unit : '');
}

// ---- TOOLTIPS ----
const TIPS = {
  ntNothing:
    'שעות עבודה שלא נרשמה בהן תפוקה (שעות עבודה פחות תפוקות).\nכל עוד הממוצע מספיק כדי להגיע לתקרה — הפרמיה נשארת מקסימלית.\nהמספר מתעדכן אוטומטית כשמשנים שלט, היעדרויות או תפוקות.',
  tarif: 'תעריף הסכם קבוע: 40.49 ₪ לשעה לטיפול. לא ניתן לשינוי.',
  takara:
    'התקרה המוצגת היא למשרה מלאה (100%):\n• עובדת רגילה: ₪5,400\n• ותיקה: ₪5,838.25\n\nהתקרה בפועל מחושבת לפי אחוז המשרה החודשי לכל מרפאה:\nתקרה בפועל למרפאה = (שעות תקן + שעות נוספות + היעדרות מזכה במרפאה ÷ שעות פוטנציאליות משותף) × תקרה מלאה',
  makdam: 'בהתפתחות הילד ריפוי בעיסוק: כל תפוקה שווה ×2 טיפולים משוקללים. לא ניתן לשינוי.',
  shaPotential:
    'מקסימום שעות לחודש למשרה מלאה (100%):\n• יום רגיל (א-ה): 8 שעות\n• ערב חג: 4 שעות\n• חול המועד: 5 שעות\n• יום חג: 0 שעות\n• יום מקוצר (פורים/חנוכה/יום המשפחה): 8 שעות ✓\n\nשעות פוטנציאליות הן משותפות לכל המרפאות.',
  shaTeken:
    'שעות תקן לפי המשרה שלך במרפאה הזו.\n\nלדוגמה: את עובדת א׳ (7 שעות), ד׳ (7 שעות), ה׳ (8 שעות)\nבחודש עם 5 ימי א׳, 5 ימי ד׳, 4 ימי ה׳:\n(7×5) + (7×5) + (8×4) = 102 שעות',
  headrutMazaka:
    'היעדרויות המזכות בפרמיית העדרות:\n• חופש שנתי\n• יום בחירה\n• יום זיכרון – עובד שכול\n• השתלמות מתחת ל־3 ימים',
  headrutLoMazaka:
    'היעדרויות שאינן מזכות בפרמיית העדרות:\n• מחלת עובד / מחלת ילד / הצהרה\n• מחלת בן משפחה\n• הריון / טיפולי פריה / תאונת עבודה\n• נישואים / יום לידה בן/בת / ברית מילה\n• ימי אבל / שביתה / מילואים\n• השתלמות מעל 3 ימים\n• ביקור אצל רופא תעסוקתי',
  shaAvoda: 'שעות עבודה = שעות תקן − היעדרות מזכה − מחלה − שלט + שעות עודפות',
  shaLaTipulit:
    'שעות לא טיפוליות, המאושרות על ידי מנהלת המכון.\n⚠️ שלט מופחת משעות העבודה ולא נכנס למכנה — פחות שלט = ממוצע גבוה יותר.',
  shaNosfot: 'שעות עודפות מעבר לשעות התקן שלך, שמופיעות בדף הפרמיות.',
  tifukot:
    'קודי תפוקה ב-Clicks:\n• 50011 - טיפול\n• 50008 - אבחון\n• 50016 - ישיבה\n• 50038 - דוח\n• 50042 - ישיבה עם גננת\n\nכל קוד = תפוקה אחת.',
  avgShnati:
    'ממוצע הטיפולים לתשלום של 12 החודשים הקודמים.\nמשמש לחישוב פרמיית ההעדרות.\nהכנס ידנית מהתלוש החודשי.',
  shalet:
    'כשמעבירים שעות עבודה לשלט:\n• המכנה קטן ← ממוצע עולה\n• סך שעות לתשלום לא משתנה\n• התקרה לא משתנה',
  mishra:
    'אחוז המשרה בפועל החודש:\n(שעות תקן − היעדרות לא מזכה + עודפות) ÷ שעות פוטנציאליות.\n\nהתקרה שלך = אחוז המשרה × התקרה המלאה.\nלכן ימי מחלה מקטינים את התקרה.',
  mecane:
    'שעות העבודה בפועל:\nשעות תקן − היעדרויות − שלט + עודפות.\n\nהטיפולים מחולקים בשעות האלה — פחות מכנה = ממוצע גבוה יותר.',
  avgTashlum:
    'כמה הממוצע שלך מעל הרף (1.0), עד מקסימום 1:\nטיפולים משוקללים ÷ מכנה, פחות 1.\n\nזה ה"ממוצע לתשלום" שמופיע בפירוט הפרמיה.',
  shaTashlum:
    'השעות שהפרמיה משולמת עליהן:\nשעות תקן − היעדרויות + עודפות (השלט נשאר בפנים).\n\nפרמיית עבודה = שעות לתשלום × ממוצע × תעריף.',
};

// Tooltip popup (built once)
const tipPopup = document.createElement('div');
Object.assign(tipPopup.style, {
  position: 'fixed',
  zIndex: '9999',
  width: '240px',
  display: 'none',
  background: '#1e293b',
  color: '#f1f5f9',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '12px',
  lineHeight: '1.7',
  whiteSpace: 'pre-line',
  textAlign: 'right',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  pointerEvents: 'none',
  direction: 'rtl',
  fontFamily: "Heebo, 'Arial Hebrew', Arial, sans-serif",
});
document.body.appendChild(tipPopup);

let activeTipBtn = null;
function showTip(btn) {
  const key = btn.getAttribute('data-tip');
  if (!key || !TIPS[key]) return;
  if (activeTipBtn === btn) {
    hideTip();
    return;
  }
  hideTip();
  activeTipBtn = btn;
  btn.classList.add('open');
  tipPopup.textContent = TIPS[key];
  tipPopup.style.visibility = 'hidden';
  tipPopup.style.display = 'block';
  const popupWidth = 240;
  const popupHeight = tipPopup.offsetHeight;
  const rect = btn.getBoundingClientRect();
  let left = rect.right - popupWidth;
  if (left < 8) left = 8;
  if (left + popupWidth > window.innerWidth - 8) left = window.innerWidth - popupWidth - 8;
  let top = rect.top - popupHeight - 8;
  if (top < 8) top = rect.bottom + 8;
  tipPopup.style.left = left + 'px';
  tipPopup.style.top = top + 'px';
  tipPopup.style.visibility = 'visible';
}
function hideTip() {
  if (activeTipBtn) {
    activeTipBtn.classList.remove('open');
    activeTipBtn = null;
  }
  tipPopup.style.display = 'none';
}
document.addEventListener('mouseover', function (e) {
  const btn = e.target.closest('[data-tip]');
  if (btn) showTip(btn);
});
document.addEventListener('mouseout', function (e) {
  const btn = e.target.closest('[data-tip]');
  if (btn) hideTip();
});
document.addEventListener(
  'touchstart',
  function (e) {
    const btn = e.target.closest('[data-tip]');
    if (btn) {
      e.preventDefault();
      if (activeTipBtn === btn) {
        hideTip();
        return;
      }
      showTip(btn);
    } else {
      hideTip();
    }
  },
  { passive: false },
);

// WebView detector
(function () {
  try {
    const ua = navigator.userAgent || '';
    const isWebView = /; wv\)/.test(ua);
    if (isWebView) {
      document.getElementById('wrong-app-banner').style.display = 'block';
    }
  } catch (e) {
    document.getElementById('wrong-app-banner').style.display = 'block';
  }
})();

// ---- STATE: clinics ----
/** @type {Array<{id:string,name:string,shaTeken:string,shaNosfot:string,shaLaTipulit:string,headrutMazaka:string,headrutLoMazaka:string,tifukot:string,expanded:boolean}>} */
let clinics = [];
let lastEditedClinicId = null;
let sharedLocked = false;

function newClinicObj(name) {
  return {
    id: 'c_' + Math.random().toString(36).slice(2, 9),
    name: name || '',
    shaTeken: '',
    shaNosfot: '',
    shaLaTipulit: '',
    headrutMazaka: '',
    headrutLoMazaka: '',
    tifukot: '',
    expanded: true,
  };
}

// ---- UNDO SYSTEM ----
let undoStack = [];
const MAX_UNDO = 20;

function snapshotState() {
  return {
    isVetek: parseFloat(document.getElementById('takara').value) === 5838.25 ? '1' : '0',
    shaPotential: document.getElementById('shaPotential').value,
    avgShnati: document.getElementById('avgShnati').value,
    clinics: clinics.map((c) => ({ ...c })),
  };
}
function statesEqual(a, b) {
  if (a.isVetek !== b.isVetek) return false;
  if (a.shaPotential !== b.shaPotential) return false;
  if (a.avgShnati !== b.avgShnati) return false;
  if (a.clinics.length !== b.clinics.length) return false;
  for (let i = 0; i < a.clinics.length; i++) {
    const fields = [
      'name',
      'shaTeken',
      'shaNosfot',
      'shaLaTipulit',
      'headrutMazaka',
      'headrutLoMazaka',
      'tifukot',
    ];
    for (const f of fields) {
      if (a.clinics[i][f] !== b.clinics[i][f]) return false;
    }
  }
  return true;
}
function saveUndoSnapshot() {
  const snap = snapshotState();
  if (undoStack.length > 0 && statesEqual(undoStack[undoStack.length - 1], snap)) return;
  undoStack.push(snap);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoBtn();
}
function undoFields() {
  if (undoStack.length === 0) return;
  const snap = undoStack.pop();
  document.getElementById('shaPotential').value = snap.shaPotential || '';
  document.getElementById('avgShnati').value = snap.avgShnati || '';
  if (snap.isVetek === '1') setVetek(true, true);
  else setVetek(false, true);
  clinics = snap.clinics.map((c) => ({ ...c }));
  renderClinics();
  renderHoursClinics();
  updateUndoBtn();
  calc();
}
function updateUndoBtn() {
  const btn = document.getElementById('undoBtn');
  if (!btn) return;
  btn.style.display = undoStack.length > 0 ? '' : 'none';
}

// ---- MONTH SELECTOR (for the small display + persistence) ----
(function () {
  const monthNames = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const sel = document.getElementById('selectedMonth');
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  for (let offset = -2; offset <= 2; offset++) {
    const m = (curMonth + offset + 12) % 12;
    const y = curYear + Math.floor((curMonth + offset) / 12);
    const opt = document.createElement('option');
    opt.value = monthNames[m] + ' ' + y;
    opt.textContent = monthNames[m] + ' ' + y;
    if (offset === 0) opt.selected = true;
    sel.appendChild(opt);
  }
})();

// snapshot capture on focus of any input
document.addEventListener('focusin', function (e) {
  const t = e.target;
  if (!t) return;
  if (
    t.id === 'shaPotential' ||
    t.id === 'avgShnati' ||
    t.matches('[data-field]') ||
    t.matches('[data-clinic-name]')
  ) {
    saveUndoSnapshot();
  }
});

// ---- LOCAL STORAGE ----
const STORAGE_KEY = 'premiot_clinics_v2';
const LEGACY_KEY = 'premiot_data';

function saveToStorage() {
  try {
    const data = {
      isVetek: parseFloat(document.getElementById('takara').value) === 5838.25 ? '1' : '0',
      shaPotential: document.getElementById('shaPotential').value,
      avgShnati: document.getElementById('avgShnati').value,
      selectedMonth: document.getElementById('selectedMonth').value,
      clinics: clinics,
      sharedLocked: sharedLocked,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.shaPotential !== undefined)
        document.getElementById('shaPotential').value = data.shaPotential;
      if (data.avgShnati !== undefined) document.getElementById('avgShnati').value = data.avgShnati;
      if (data.isVetek === '1') setVetek(true, true);
      if (data.selectedMonth) {
        const sel = document.getElementById('selectedMonth');
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === data.selectedMonth) {
            sel.selectedIndex = i;
            break;
          }
        }
        document.getElementById('selectedMonthDisplay').textContent = data.selectedMonth;
      }
      if (Array.isArray(data.clinics) && data.clinics.length > 0) {
        clinics = data.clinics.map((c) => ({ ...newClinicObj(), ...c }));
      }
      if (data.sharedLocked) sharedLocked = true;
      return;
    }
    // Migration from legacy single-clinic key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      if (old.shaPotential !== undefined)
        document.getElementById('shaPotential').value = old.shaPotential || '';
      if (old.avgShnati !== undefined)
        document.getElementById('avgShnati').value = old.avgShnati || '';
      if (old.isVetek === '1') setVetek(true, true);
      const c0 = newClinicObj('מרפאה 1');
      c0.shaTeken = old.shaTeken || '';
      c0.shaNosfot = old.shaNosfot || '';
      c0.shaLaTipulit = old.shaLaTipulit || '';
      c0.headrutMazaka = old.headrutMazaka || '';
      c0.headrutLoMazaka = old.headrutLoMazaka || '';
      c0.tifukot = old.tifukot || '';
      clinics = [c0];
      if (old.selectedMonth) {
        const sel = document.getElementById('selectedMonth');
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === old.selectedMonth) {
            sel.selectedIndex = i;
            break;
          }
        }
        document.getElementById('selectedMonthDisplay').textContent = old.selectedMonth;
      }
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch (e) {
        /* ignore */
      }
    }
  } catch (e) {
    /* ignore */
  }
}

// ---- CLINIC RENDER ----
function renderClinics() {
  const container = document.getElementById('clinicsContainer');
  const template = document.getElementById('clinic-template');
  container.innerHTML = '';

  clinics.forEach((c, idx) => {
    if (!c.name) c.name = 'מרפאה ' + (idx + 1);
    const node = template.content.cloneNode(true);
    const card = node.querySelector('[data-clinic-card]');
    card.setAttribute('data-clinic-id', c.id);
    if (c.expanded) card.classList.add('expanded');

    const nameInput = card.querySelector('[data-clinic-name]');
    nameInput.value = c.name;
    nameInput.addEventListener('input', () => {
      c.name = nameInput.value;
      lastEditedClinicId = c.id;
      saveToStorage();
      // Keep Hours-tab section labels in sync with calc-tab clinic names
      const hoursName = document.querySelector(
        `[data-hours-card][data-hours-clinic-id="${c.id}"] [data-hours-name]`,
      );
      if (hoursName) hoursName.textContent = c.name || 'מרפאה';
      updateChips();
    });
    nameInput.addEventListener('focus', saveUndoSnapshot);

    const header = card.querySelector('[data-clinic-header]');
    header.addEventListener('click', (e) => {
      if (e.target.closest('[data-clinic-name]')) return;
      if (e.target.closest('[data-clinic-delete]')) return;
      c.expanded = !c.expanded;
      card.classList.toggle('expanded', c.expanded);
      saveToStorage();
    });

    const deleteBtn = card.querySelector('[data-clinic-delete]');
    deleteBtn.style.display = clinics.length > 1 ? '' : 'none';
    deleteBtn.addEventListener('click', () => {
      if (clinics.length <= 1) return;
      saveUndoSnapshot();
      const removedId = c.id;
      clinics = clinics.filter((cc) => cc.id !== removedId);
      if (lastEditedClinicId === removedId) lastEditedClinicId = null;
      // Drop the clinic's Hours-tab section data too
      if (hoursState.byClinic[removedId]) {
        delete hoursState.byClinic[removedId];
        saveHoursState();
      }
      renderClinics();
      renderHoursClinics();
      calc();
    });

    // Wire input fields
    const inputs = card.querySelectorAll('[data-field]');
    inputs.forEach((inp) => {
      const field = inp.getAttribute('data-field');
      inp.value = c[field] || '';
      inp.setAttribute('data-clinic-id', c.id);
    });

    container.appendChild(node);
  });

  // Adjust expanded state — only most-recently-edited expanded when N>1
  if (clinics.length > 1 && lastEditedClinicId) {
    clinics.forEach((c) => {
      c.expanded = c.id === lastEditedClinicId;
      const card = container.querySelector(`[data-clinic-id="${c.id}"]`);
      if (card) card.classList.toggle('expanded', c.expanded);
    });
  }
}

function onClinicInput(inputEl) {
  const card = inputEl.closest('[data-clinic-card]');
  const cid = card.getAttribute('data-clinic-id');
  const field = inputEl.getAttribute('data-field');
  const clinic = clinics.find((c) => c.id === cid);
  if (clinic) {
    clinic[field] = inputEl.value;
    lastEditedClinicId = cid;
  }
  calc();
}

function addClinic() {
  saveUndoSnapshot();
  const newC = newClinicObj('מרפאה ' + (clinics.length + 1));
  newC.expanded = true;
  // Collapse others
  clinics.forEach((c) => (c.expanded = false));
  clinics.push(newC);
  lastEditedClinicId = newC.id;
  renderClinics();
  // New clinic gets its own Hours-tab section automatically
  renderHoursClinics();
  calc();
}

// ---- SHARED STRIP LOCK ----
function maybeLockShared() {
  const sharedHasValue =
    document.getElementById('shaPotential').value !== '' ||
    document.getElementById('avgShnati').value !== '';
  const editBtn = document.getElementById('sharedEditBtn');
  if (sharedHasValue && !sharedLocked) {
    // not auto-locking visually until any clinic has data — keep simple
  }
  if (editBtn) editBtn.style.display = sharedLocked ? '' : 'none';
  const strip = document.getElementById('sharedStrip');
  if (strip) strip.classList.toggle('locked', sharedLocked);
}
function toggleSharedLock() {
  sharedLocked = !sharedLocked;
  maybeLockShared();
  saveToStorage();
}

// ---- CORE CALC (per-clinic + combined) ----
function calcClinic(c, sharedPotential, fullCeiling, avgShnati, tarif, makdam) {
  const shaTeken = parseFloat(c.shaTeken) || 0;
  const shaNosfot = parseFloat(c.shaNosfot) || 0;
  const shaLaTipulit = parseFloat(c.shaLaTipulit) || 0;
  const headrutMazaka = parseFloat(c.headrutMazaka) || 0;
  const headrutLoMazaka = parseFloat(c.headrutLoMazaka) || 0;
  const tifukot = parseFloat(c.tifukot) || 0;

  const shaAvoda = Math.max(
    0,
    shaTeken - headrutMazaka - headrutLoMazaka - shaLaTipulit + shaNosfot,
  );

  const tipulimMushkalim = tifukot * makdam;
  const mecane = shaAvoda;
  const rawAvg = mecane > 0 ? tipulimMushkalim / mecane : 0;
  // Clalit rounds the payment average to 2 decimals before multiplying —
  // verified against Moran's Dec25–Mar26 premia PDFs (matches to ±0.08₪;
  // full precision is off by ₪2–14).
  const avgTipulim = Math.round(Math.min(Math.max(rawAvg - 1, 0), 1) * 100) / 100;
  const totalHoursLeTashlum = Math.max(0, shaTeken - headrutMazaka - headrutLoMazaka + shaNosfot);

  // Per-clinic mishra% = (work + overtime + qualifying absence) / shared potential
  const mishraHours = Math.max(0, shaTeken - headrutLoMazaka + shaNosfot);
  const mishraPct = sharedPotential > 0 ? mishraHours / sharedPotential : 0;
  // Clalit rounds the % to a whole number for the ceiling — every block in
  // the 6 verified premia PDFs is an exact integer-% × 5400.
  const takaraClinic = (Math.round(mishraPct * 100) / 100) * fullCeiling;

  // Coded-pct threshold (per clinic)
  const actualHoursPresent = shaAvoda + shaLaTipulit;
  const codedPct = actualHoursPresent > 0 ? shaAvoda / actualHoursPresent : 0;
  const belowThreshold = actualHoursPresent > 0 ? codedPct < 0.5 : false;
  const belowAvgGate = avgTipulim <= 0;
  const noPayment = belowThreshold || belowAvgGate;

  const premiatAvodaBefore = noPayment ? 0 : totalHoursLeTashlum * avgTipulim * tarif;
  const premiatAvoda = Math.min(premiatAvodaBefore, takaraClinic);
  const premiatHeadrutBefore = noPayment ? 0 : headrutMazaka * avgShnati * tarif;
  const remainingCap = Math.max(0, takaraClinic - premiatAvoda);
  const premiatHeadrut = Math.min(premiatHeadrutBefore, remainingCap);

  const totalClinic = premiatAvoda + premiatHeadrut;
  const atCap =
    premiatAvoda > 0 &&
    Math.abs(premiatAvodaBefore - takaraClinic) < 0.5 &&
    premiatAvoda >= takaraClinic - 0.5;

  // Pill: cap > warn > ok > neutral
  let pill = 'neutral';
  let pillLabel = '—';
  const hasAnyInput =
    shaTeken > 0 ||
    shaNosfot > 0 ||
    tifukot > 0 ||
    headrutMazaka > 0 ||
    headrutLoMazaka > 0 ||
    shaLaTipulit > 0;
  if (!hasAnyInput) {
    pill = 'neutral';
    pillLabel = '—';
  } else if (tifukot === 0) {
    // Hours are in but treatments haven't been entered yet — this is an
    // incomplete input, not a problem. Don't alarm-amber a clinic the user
    // is still filling; invite the next step instead.
    pill = 'neutral';
    pillLabel = 'ממתין לתפוקות';
  } else if (belowThreshold) {
    pill = 'warn';
    pillLabel = '⚠️ סף לא הושג';
  } else if (atCap) {
    pill = 'cap';
    pillLabel = '🔒 על תקרה';
  } else if (belowAvgGate) {
    pill = 'warn';
    pillLabel = '⚠️ ממוצע נמוך';
  } else {
    pill = 'ok';
    pillLabel = '✓ עבר';
  }

  return {
    shaAvoda,
    tipulimMushkalim,
    mecane,
    avgTipulim,
    totalHoursLeTashlum,
    mishraPct,
    takaraClinic,
    premiatAvoda,
    premiatAvodaBefore,
    premiatHeadrut,
    premiatHeadrutBefore,
    totalClinic,
    pill,
    pillLabel,
    belowThreshold,
    belowAvgGate,
    atCap,
    hasAnyInput,
  };
}

function calc() {
  const tarif = v('tarif');
  const fullCeiling = v('takara');
  const makdam = v('makdam');
  const sharedPotential = v('shaPotential');
  const avgShnati = v('avgShnati');

  // Per-clinic
  const results = clinics.map((c) =>
    calcClinic(c, sharedPotential, fullCeiling, avgShnati, tarif, makdam),
  );

  // Combined
  const totalPremium = results.reduce((s, r) => s + r.totalClinic, 0);
  const totalCeiling = results.reduce((s, r) => s + r.takaraClinic, 0);
  const totalMishraPct = results.reduce((s, r) => s + r.mishraPct, 0);
  const totalTipulim = results.reduce((s, r) => s + r.tipulimMushkalim, 0);
  const totalMecane = results.reduce((s, r) => s + r.mecane, 0);
  const totalHoursLeTashlum = results.reduce((s, r) => s + r.totalHoursLeTashlum, 0);
  const totalAvoda = results.reduce((s, r) => s + r.premiatAvoda, 0);
  const totalAvodaBefore = results.reduce((s, r) => s + r.premiatAvodaBefore, 0);
  const totalHeadrut = results.reduce((s, r) => s + r.premiatHeadrut, 0);
  const totalHeadrutBefore = results.reduce((s, r) => s + r.premiatHeadrutBefore, 0);

  const combinedAvg = totalMecane > 0 ? totalTipulim / totalMecane : 0;
  const combinedAvgClamped = Math.min(Math.max(combinedAvg - 1, 0), 1);

  // Anything-entered detection
  const anyClinicHasInput = results.some((r) => r.hasAnyInput);
  const emptyState = sharedPotential === 0 || !anyClinicHasInput;

  // ---- Per-clinic UI updates ----
  results.forEach((r, idx) => {
    const c = clinics[idx];
    const card = document.querySelector(`[data-clinic-card][data-clinic-id="${c.id}"]`);
    if (!card) return;
    const setReadout = (key, txt) => {
      const el = card.querySelector(`[data-readout="${key}"]`);
      if (el) el.textContent = txt;
    };
    // (משרה + תקרה body rows removed 2026-06-11 — the header mini-stats
    // already show them; setMini below is their one home now)
    setReadout('shaAvoda', r.shaAvoda.toFixed(2));
    setReadout('premiatAvoda', fmtILS(r.premiatAvoda));
    setReadout('premiatHeadrut', fmtILS(r.premiatHeadrut));

    const sum = card.querySelector('[data-clinic-sum]');
    if (sum) sum.textContent = fmtILS(r.totalClinic);

    const pill = card.querySelector('[data-clinic-pill]');
    if (pill) {
      pill.className = 'pill ' + r.pill;
      pill.textContent = r.pillLabel;
    }

    // Always-visible mini-stats inside header (משרה / תקרה / סך פרמיה).
    // Allison feedback 2026-05-24: she wants the three load-bearing numbers
    // for each clinic visible without expanding.
    const setMini = (key, txt, tone) => {
      const el = card.querySelector(`[data-mini="${key}"]`);
      if (!el) return;
      el.textContent = txt;
      el.classList.remove('warn', 'danger');
      // preserve accent on totalClinic (set in template)
      if (tone) el.classList.add(tone);
    };
    if (r.hasAnyInput) {
      setMini('mishraPct', (r.mishraPct * 100).toFixed(1) + '%');
      // תקרה stays whole-shekel (always a round number, secondary stat).
      // סך פרמיה must match the clinic sum + big number to the agora — showing
      // a rounded ₪1,283 next to ₪1,282.72 on the same card eroded trust in a
      // calculator whose only job is to match the tlush (Allison, 2026-06-10).
      setMini('takaraClinic', fmtILS0(r.takaraClinic));
      setMini('totalClinic', fmtILS(r.totalClinic));
    } else {
      // Empty clinic: show em-dashes, calm — don't draw eye to nothing.
      setMini('mishraPct', '—');
      setMini('takaraClinic', '—');
      setMini('totalClinic', '—');
    }
  });

  // ---- Combined readouts ----
  document.getElementById('r_total').textContent = fmtILS(totalPremium);
  // Plain words first, tlush codes demoted to a quiet parenthetical — a
  // confused OT reads "פרמיית עבודה / העדרות", not "סמל 1783/1785". The codes
  // stay so she can still cross-check against the two tlush lines.
  document.getElementById('r_total_sub').innerHTML =
    'עבודה ' +
    fmtILS(totalAvoda) +
    ' + העדרות ' +
    fmtILS(totalHeadrut) +
    ' <span style="opacity:0.6;">(סמל 1783 + 1785)</span>';

  document.getElementById('r_avoda').textContent = fmtILS(totalAvoda);
  document.getElementById('r_headrut').textContent = fmtILS(totalHeadrut);

  const avodaCapped = Math.abs(totalAvodaBefore - totalAvoda) > 0.005;
  document.getElementById('row_avoda_before').style.display = avodaCapped ? '' : 'none';
  if (avodaCapped) document.getElementById('r_avoda_before').textContent = fmtILS(totalAvodaBefore);
  const headrutCapped = Math.abs(totalHeadrutBefore - totalHeadrut) > 0.005;
  document.getElementById('row_headrut_before').style.display = headrutCapped ? '' : 'none';
  if (headrutCapped)
    document.getElementById('r_headrut_before').textContent = fmtILS(totalHeadrutBefore);

  set('r_tipulim', totalTipulim.toFixed(0), 'טיפולים');
  set('r_mecane', totalMecane.toFixed(2), 'שעות');
  // "✓" alone — the old "(מקסימום ✓)" suffix broke across lines in RTL with
  // the ✓ orphaned; the tip on this row now explains that 1 is the max.
  set('r_avg', combinedAvgClamped.toFixed(3), combinedAvgClamped >= 1 ? '✓' : '');
  set('r_totalHours', totalHoursLeTashlum.toFixed(2), 'שעות');
  // One token ("87.5%"), not value + unit — a spaced "%" jumps to the wrong
  // side of the number in RTL.
  set('r_mishra', (totalMishraPct * 100).toFixed(1) + '%');
  document.getElementById('r_takara').textContent = fmtILS(totalCeiling);

  // ---- Per-clinic breakdown in drill-down ----
  const perEl = document.getElementById('perClinicBreakdown');
  if (perEl) {
    if (clinics.length > 1) {
      perEl.innerHTML = results
        .map(
          (r, i) =>
            `<div class="result-row" style="border:none; background:none;">
              <span class="rlabel">${escapeHtml(clinics[i].name || 'מרפאה ' + (i + 1))}</span>
              <span class="rvalue">${fmtILS(r.totalClinic)}</span>
            </div>`,
        )
        .join('');
    } else {
      perEl.innerHTML = '';
    }
  }

  // ---- Sticky ----
  document.getElementById('r_total_sticky').textContent = fmtILS(totalPremium);
  const stickyPctVal = totalCeiling > 0 ? Math.min((totalPremium / totalCeiling) * 100, 100) : 0;
  // Status palette: warning/danger reserved for actual signals; default to
  // the single forest-green accent. When there's no cap yet OR no premium
  // recorded yet, render neutral text — a quiet ₪0.00 doesn't deserve
  // alarm-red on a fresh page.
  // Use 0.5 cutoff (under one shekel = effectively zero given fmtILS rounds)
  const hasData = totalCeiling > 0 && totalPremium >= 0.5;
  const stickyColor = !hasData
    ? '#1a1915'
    : stickyPctVal >= 75
      ? '#2d6a4f'
      : stickyPctVal >= 40
        ? '#b5621a'
        : '#c0392b';
  document.getElementById('stickyProgressBar').style.width = stickyPctVal + '%';
  document.getElementById('stickyProgressBar').style.background = stickyColor;
  document.getElementById('r_total_sticky').style.color = stickyColor;
  // Labeled so it can't be misread as אחוז משרה (Allison, 2026-06-10)
  document.getElementById('stickyPct').textContent = stickyPctVal.toFixed(0) + '% מהתקרה';
  document.getElementById('stickyTakara').textContent =
    'תקרה: ' + (totalCeiling > 0 ? fmtILS0(totalCeiling) : '—');
  // On a fresh page (no input yet) show "—", not "0.000" — a hard zero reads
  // as a real computed average and makes the empty calc look broken/alarming
  // (5b, 2026-06-10). Real zeros once data exists are still shown.
  document.getElementById('r_avg_sticky').textContent = emptyState
    ? '—'
    : combinedAvgClamped.toFixed(3);
  // משרה on the frozen ribbon (her ask, 2026-06-11). Same empty-state gate as
  // ממוצע. One decimal matches the clinic mini-stats.
  document.getElementById('r_mishra_sticky').textContent = emptyState
    ? '—'
    : (totalMishraPct * 100).toFixed(1) + '%';
  // "(משותף לכל המרפאות)" is only information once a second clinic exists
  const scopeNote = document.getElementById('sharedScopeNote');
  if (scopeNote) scopeNote.style.display = clinics.length > 1 ? '' : 'none';

  // chips per-clinic in sticky (only when multi)
  updateChips(results);

  // month-over-month diff
  updateMonthDiff(totalPremium);

  // The התקדמות-לתקרה progress block that rendered here was removed
  // 2026-06-11 (her call): it duplicated the frozen ribbon exactly — same
  // bar, same %, same numbers, both always on screen. atOrOverCap stays;
  // the alert logic below uses it.
  const atOrOverCap = totalCeiling > 0 && totalPremium >= totalCeiling - 0.5;

  // ---- Together-vs-separate comparison (2-machon workers) ----
  // Clalit's premia reports flip between computing each machon separately and
  // pooling everything under one machon. The methods only differ when one
  // machon is below the 1.0 average gate — show both so the user can lay the
  // official report next to the calculator and see which method was used.
  const compareArea = document.getElementById('compareArea');
  if (compareArea) {
    const activeCount = results.filter((r) => r.hasAnyInput).length;
    if (activeCount >= 2 && !emptyState) {
      const pooled = {
        shaTeken: 0,
        shaNosfot: 0,
        shaLaTipulit: 0,
        headrutMazaka: 0,
        headrutLoMazaka: 0,
        tifukot: 0,
      };
      clinics.forEach((c) => {
        pooled.shaTeken += parseFloat(c.shaTeken) || 0;
        pooled.shaNosfot += parseFloat(c.shaNosfot) || 0;
        pooled.shaLaTipulit += parseFloat(c.shaLaTipulit) || 0;
        pooled.headrutMazaka += parseFloat(c.headrutMazaka) || 0;
        pooled.headrutLoMazaka += parseFloat(c.headrutLoMazaka) || 0;
        pooled.tifukot += parseFloat(c.tifukot) || 0;
      });
      const together = calcClinic(pooled, sharedPotential, fullCeiling, avgShnati, tarif, makdam);
      const separateTotal = totalPremium;
      const togetherTotal = together.totalClinic;
      const diff = separateTotal - togetherTotal;
      const same = Math.abs(diff) < 0.5;
      const rowStyle =
        'display:flex; justify-content:space-between; align-items:center; padding:6px 0;';
      const markBest = (isBest) =>
        isBest && !same ? 'font-weight:800; color:#2d6a4f;' : 'color:var(--text);';
      compareArea.innerHTML = `
    <div style="background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px;">
      <div style="font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">
        שני מכונים — שתי שיטות חישוב
      </div>
      <div style="${rowStyle}">
        <span style="font-size:13px;">כל מכון בנפרד</span>
        <span style="font-size:15px; ${markBest(diff > 0)}">${fmtILS(separateTotal)}</span>
      </div>
      <div style="${rowStyle} border-top:1px solid var(--border);">
        <span style="font-size:13px;">הכל מאוחד תחת מכון אחד</span>
        <span style="font-size:15px; ${markBest(diff < 0)}">${fmtILS(togetherTotal)}</span>
      </div>
      <div style="margin-top:6px; font-size:11px; color:var(--muted);">
        ${
          same
            ? 'החודש אין הבדל בין השיטות — שני המכונים עוברים את הסף.'
            : `הפרש: <strong>${fmtILS(Math.abs(diff))}</strong>. כללית לא עקבית בשיטה — השוו לדוח הפרמיות בתלוש ובדקו שכל הטיפולים נספרו.`
        }
      </div>
    </div>`;
    } else {
      compareArea.innerHTML = '';
    }
  }

  // ---- Alerts + suggestions ----
  const alertArea = document.getElementById('alertArea');
  const suggestArea = document.getElementById('suggestArea');

  if (emptyState) {
    alertArea.innerHTML = `<div class="alert neutral">
      <div class="atitle">מלאי שדות כדי לראות תוצאה</div>
      <div class="abody">הזיני שעות פוטנציאליות + שעות תקן + תפוקות לפחות במרפאה אחת.</div>
    </div>`;
    suggestArea.innerHTML = '';
  } else {
    // pick the worst-status clinic for alert headline
    const blocked = results.find((r) => r.hasAnyInput && r.belowThreshold);
    const lowAvg = results.find((r) => r.hasAnyInput && r.belowAvgGate && !r.belowThreshold);
    if (blocked) {
      alertArea.innerHTML = `<div class="alert danger">
        <div class="atitle">⚠️ סף תפוקתי לא הושג</div>
        <div class="abody">לפחות מרפאה אחת מתחת לסף 50% של שעות נוכחות מקודדות ב-Clicks.</div>
      </div>`;
      suggestArea.innerHTML = '';
    } else if (lowAvg) {
      alertArea.innerHTML = `<div class="alert danger">
        <div class="atitle">⚠️ שעות עבודה לא מספיק תפוקתיות</div>
        <div class="abody">לפחות מחצית משעות העבודה צריכות להיות תפוקתיות כדי לקבל פרמיה כלשהי.</div>
      </div>`;
      suggestArea.innerHTML = '';
    } else if (atOrOverCap) {
      alertArea.innerHTML = `<div class="alert success">
        <div class="atitle">🎉 הגעת לתקרה!</div>
        <div class="abody">פרמיה מקסימלית לחודש זה הושגה.</div>
      </div>`;
      suggestArea.innerHTML = '';
    } else {
      // suggestions — pick the clinic with most room to improve (largest gap to its ceiling)
      let bestClinicIdx = -1;
      let bestGap = 0;
      results.forEach((r, i) => {
        if (!r.hasAnyInput) return;
        const gap = r.takaraClinic - r.totalClinic;
        if (gap > bestGap) {
          bestGap = gap;
          bestClinicIdx = i;
        }
      });
      let suggestions = '';
      if (bestClinicIdx >= 0) {
        const r = results[bestClinicIdx];
        const c = clinics[bestClinicIdx];
        const clinicName = c.name || 'מרפאה ' + (bestClinicIdx + 1);
        const tifukot = parseFloat(c.tifukot) || 0;
        if (r.avgTipulim < 1) {
          const neededAvg =
            r.totalHoursLeTashlum > 0 && tarif > 0
              ? (r.takaraClinic - r.premiatHeadrutBefore) / (r.totalHoursLeTashlum * tarif)
              : 0;
          const cappedNeededAvg = Math.min(neededAvg, 1);
          const neededRawAvg = cappedNeededAvg + 1;
          const neededTipulim = Math.ceil(neededRawAvg * r.mecane);
          const extraTifukot = Math.max(
            0,
            Math.ceil((neededTipulim - r.tipulimMushkalim) / makdam),
          );
          if (extraTifukot > 0) {
            suggestions += `<div class="alert warning" style="margin-bottom:8px;">
              <div class="atitle">📋 אפשרות א׳: עוד תפוקות ב${escapeHtml(clinicName)}</div>
              <div class="abody">הוסיפי <strong>${extraTifukot} תפוקות</strong> נוספות ב-Clicks כדי לסגור פער של ${fmtILS(r.takaraClinic - r.totalClinic)}<br>
              <span style="font-size:11px; opacity:0.8;">כרגע: ${tifukot} תפוקות | נדרש: ${tifukot + extraTifukot}</span></div>
            </div>`;
          }
        }
        const shaLaTipulit = parseFloat(c.shaLaTipulit) || 0;
        const availableShalet = Math.max(0, r.shaAvoda);
        if (availableShalet > 0.1 && r.avgTipulim < 1) {
          const targetPremium = Math.max(0, r.takaraClinic - r.premiatHeadrutBefore);
          let shaletNeeded = null;
          for (let x = 0.5; x <= availableShalet + 0.5; x += 0.5) {
            const newMecane = Math.max(r.mecane - x, 0.01);
            const newAvg = Math.min(Math.max(r.tipulimMushkalim / newMecane - 1, 0), 1);
            const newPremium = r.totalHoursLeTashlum * newAvg * tarif;
            if (newPremium >= targetPremium) {
              shaletNeeded = x;
              break;
            }
          }
          if (shaletNeeded !== null) {
            suggestions += `<div class="alert warning">
              <div class="atitle">🕐 אפשרות ב׳: העבר שעות לשלט ב${escapeHtml(clinicName)}
                <button class="tip-btn" data-tip="shalet" style="font-size:9px; width:15px; height:15px; margin-right:6px;">?</button>
              </div>
              <div class="abody">העבירי <strong>${shaletNeeded.toFixed(1)} שעות</strong> משעות עבודה לשלט<br>
              <span style="font-size:11px; opacity:0.8;">שלט: ${shaLaTipulit} → ${(shaLaTipulit + shaletNeeded).toFixed(1)} | מקסימום: ${r.shaAvoda.toFixed(1)}</span></div>
            </div>`;
          }
        }
      }
      if (!suggestions) {
        suggestions = `<div class="alert warning">
          <div class="atitle">💡 ממוצע מקסימלי — צריך עוד שעות</div>
          <div class="abody">הממוצע כבר 1.0 ואין שלט נוסף זמין. כדי להגיע לתקרה — צריך עוד שעות עבודה בחודש זה.</div>
        </div>`;
      }
      alertArea.innerHTML = '';
      suggestArea.innerHTML =
        `<div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">💡 הצעות להגדלת הפרמיה</div>` +
        suggestions;
    }
  }

  // ממוצע שנתי fail-loud (her ask, 2026-06-11: "I sometimes forget to put
  // it in"). When the field is empty the calc silently pays ₪0 פרמיית
  // העדרות — a quiet lie. Flag it exactly when it costs money: there ARE
  // היעדרות-מזכה hours this month and the total isn't already capped
  // (at cap the field changes nothing — don't nag). Prepended so it shows
  // ALONGSIDE whatever other alert applies, never instead of it.
  const anyMazaka = clinics.some((c) => (parseFloat(c.headrutMazaka) || 0) > 0);
  const avgShnatiMissing = !emptyState && anyMazaka && !(avgShnati > 0) && !atOrOverCap;
  if (avgShnatiMissing) {
    alertArea.innerHTML =
      `<div class="alert warning" style="margin-bottom:8px;">
      <div class="atitle">⚠️ חסר ממוצע שנתי</div>
      <div class="abody">יש לך היעדרות מזכה החודש, ובלי ממוצע שנתי (מהתלוש) פרמיית ההעדרות מחושבת כ-0. הזיני אותו למעלה בפרטי עובדת.</div>
    </div>` + alertArea.innerHTML;
  }
  document.getElementById('avgShnati').classList.toggle('field-missing', avgShnatiMissing);

  // Auto-open the פירוט drill-down when result exists, only first time
  maybeAutoOpenDetail(totalPremium > 0 && anyClinicHasInput);

  // Hours-first flow: empty-state placeholder + from-hours badges
  updateHoursFirstUI();

  // Stale-month guard (both tabs' banners)
  checkStaleMonth();

  saveToStorage();
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[m],
  );
}

let detailAutoOpened = false;
function maybeAutoOpenDetail(shouldOpen) {
  if (!shouldOpen || detailAutoOpened) return;
  const el = document.getElementById('detailPremia');
  const arrow = document.getElementById('arrow_detailPremia');
  if (el && getComputedStyle(el).display === 'none') {
    el.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
  detailAutoOpened = true;
}

function updateChips(results) {
  const chipsEl = document.getElementById('clinicChips');
  if (!chipsEl) return;
  if (!results || clinics.length <= 1) {
    chipsEl.innerHTML = '';
    return;
  }
  chipsEl.innerHTML = results
    .map(
      (r, i) =>
        `<span class="chip">${escapeHtml(clinics[i].name || 'מרפאה ' + (i + 1))}: ${fmtILS0(r.totalClinic)}</span>`,
    )
    .join('');
}

function updateMonthDiff(currentTotal) {
  const el = document.getElementById('monthDiff');
  if (!el) return;
  try {
    const lastRaw = localStorage.getItem('premiot_last_month_total');
    if (lastRaw && currentTotal > 0) {
      const last = parseFloat(lastRaw);
      if (isFinite(last) && Math.abs(last - currentTotal) > 0.5) {
        const diff = currentTotal - last;
        const sign = diff >= 0 ? '+' : '−';
        const cls = diff >= 0 ? 'up' : 'down';
        el.className = 'month-diff ' + cls;
        el.textContent = `מול חודש קודם: ${sign}${fmtILS(Math.abs(diff))}`;
      } else {
        el.textContent = '';
      }
    } else {
      el.textContent = '';
    }
    if (currentTotal > 0) {
      localStorage.setItem('premiot_last_month_total', String(currentTotal));
    }
  } catch (e) {
    /* ignore */
  }
}

function setVetek(isVetek, skipCalc) {
  document.getElementById('takara').value = isVetek ? 5838.25 : 5400;
  const reg = document.getElementById('btn-regular');
  const vet = document.getElementById('btn-vetek');
  if (reg && vet) {
    reg.classList.toggle('active', !isVetek);
    vet.classList.toggle('active', !!isVetek);
  }
  if (!skipCalc) calc();
}

// ---- TOAST ----
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2200);
}

// ---- STALE-MONTH GUARD ----
// The app restores the last-used month on load, so in June a returning user
// silently lands on May with May's numbers (Allison, 2026-06-10: "if doing
// May... is it clear it's May"). When the saved month is behind the calendar,
// say so on both tabs instead of letting old data pose as current.
function checkStaleMonth() {
  const names = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const now = new Date();
  const cur = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const saved = hoursState.month;
  const stale = !!saved && saved !== cur;
  let label = '';
  if (stale) {
    const [y, m] = saved.split('-').map(Number);
    label = `⚠️ הנתונים כאן מ־${names[m - 1] || ''} ${y} — לחודש חדש: 🔄 איפוס, ואז מלאי שעות מחדש`;
  }
  ['staleMonthHintHours', 'staleMonthHintCalc'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = stale ? '' : 'none';
    el.textContent = label;
  });
}

// ---- RESET — two-stage confirm ----
// Allison feedback 2026-05-24: she wants איפוס prominent on calc page but
// can't have one mis-click nuke the whole form. First click arms; second
// click within 3s actually resets. Restore button after 3s if no follow-up.
let resetArmed = false;
let resetArmTimer = null;
function resetFields() {
  const btn = document.querySelector('[data-reset-btn]');
  if (!resetArmed) {
    resetArmed = true;
    if (btn) {
      btn.classList.add('armed');
      btn.dataset.origText = btn.dataset.origText || btn.textContent;
      btn.textContent = 'לחץ שוב לאיפוס';
    }
    if (resetArmTimer) clearTimeout(resetArmTimer);
    resetArmTimer = setTimeout(() => {
      resetArmed = false;
      if (btn) {
        btn.classList.remove('armed');
        if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
      }
    }, 3000);
    return;
  }
  // Confirmed — perform reset
  resetArmed = false;
  if (resetArmTimer) clearTimeout(resetArmTimer);
  if (btn) {
    btn.classList.remove('armed');
    if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
  }

  saveUndoSnapshot();
  document.getElementById('shaPotential').value = '';
  document.getElementById('avgShnati').value = '';
  // Default to NOT vetek — don't carry the old bug forward
  setVetek(false, true);
  clinics = [newClinicObj('מרפאה 1')];
  lastEditedClinicId = clinics[0].id;
  detailAutoOpened = false;

  // Clear hours state (per-clinic day-grids)
  hoursState = { month: null, byClinic: {} };

  // Wipe ALL persisted state
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(HOURS_KEY_V2);
    localStorage.removeItem(HOURS_KEY_LEGACY);
    localStorage.removeItem('premiot_last_month_total');
  } catch (e) {
    /* ignore */
  }

  renderClinics();
  renderHoursClinics();
  calc();
  showToast('אופס — חזרנו למצב ברירת מחדל');
}

// ---- EXPORTS (PDF + Excel) ----
function getSummaryData() {
  const tarif = v('tarif');
  const fullCeiling = v('takara');
  const makdam = v('makdam');
  const sharedPotential = v('shaPotential');
  const avgShnati = v('avgShnati');
  const isVetek = fullCeiling === 5838.25;
  const selectedMonth = document.getElementById('selectedMonth')?.value || '';
  const results = clinics.map((c) =>
    calcClinic(c, sharedPotential, fullCeiling, avgShnati, tarif, makdam),
  );
  return {
    month: selectedMonth,
    isVetek,
    sharedPotential,
    avgShnati,
    clinics: clinics.map((c, i) => ({ ...c, ...results[i] })),
    totalPremium: results.reduce((s, r) => s + r.totalClinic, 0),
    totalAvoda: results.reduce((s, r) => s + r.premiatAvoda, 0),
    totalHeadrut: results.reduce((s, r) => s + r.premiatHeadrut, 0),
    totalCeiling: results.reduce((s, r) => s + r.takaraClinic, 0),
  };
}

function downloadPDF() {
  const d = getSummaryData();
  const clinicSections = d.clinics
    .map(
      (c) => `
    <h3 style="margin-top:14px;">${escapeHtml(c.name)}</h3>
    <table>
      <tr><td>שעות תקן</td><td>${c.shaTeken || 0}</td></tr>
      <tr><td>שעות עודפות</td><td>${c.shaNosfot || 0}</td></tr>
      <tr><td>שעות שלט</td><td>${c.shaLaTipulit || 0}</td></tr>
      <tr><td>היעדרות מזכה</td><td>${c.headrutMazaka || 0}</td></tr>
      <tr><td>היעדרות לא מזכה</td><td>${c.headrutLoMazaka || 0}</td></tr>
      <tr><td>תפוקות</td><td>${c.tifukot || 0}</td></tr>
      <tr class="accent"><td>שעות עבודה (מחושב)</td><td>${c.shaAvoda.toFixed(2)}</td></tr>
      <tr><td>אחוז משרה במרפאה</td><td>${(c.mishraPct * 100).toFixed(1)}%</td></tr>
      <tr><td>תקרה במרפאה</td><td>${fmtILS(c.takaraClinic)}</td></tr>
      <tr><td>פרמיית עבודה</td><td>${fmtILS(c.premiatAvoda)}</td></tr>
      <tr><td>פרמיית העדרות</td><td>${fmtILS(c.premiatHeadrut)}</td></tr>
      <tr class="accent"><td>סך פרמיה במרפאה</td><td>${fmtILS(c.totalClinic)}</td></tr>
    </table>`,
    )
    .join('');
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>פרמיה ${d.month}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  body { font-family: Arial, sans-serif; direction: rtl; padding: 0; color: #1e293b; max-width: 600px; margin: 0 auto; }
  h1 { font-size: 20px; margin-bottom: 2px; }
  h3 { font-size: 14px; margin-bottom: 4px; color: #2563eb; }
  .sub { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { background: #2563eb; color: white; padding: 6px 10px; font-size: 12px; text-align: right; }
  td { padding: 5px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; }
  tr:nth-child(even) td { background: #f8fafc; }
  .accent td { background: #dbeafe !important; font-weight: 700; }
  .total td { background: #2563eb !important; color: white; font-size: 15px; font-weight: 800; padding: 10px; }
  .warning { font-size: 10px; color: #64748b; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
<h1>מחשבון פרמיות — ${d.month}</h1>
<div class="sub">כללית | ריפוי בעיסוק | התפתחות הילד | ירושלים | סוג עובדת: ${d.isVetek ? 'ותיקה' : 'רגילה'}</div>
<table>
  <tr><th colspan="2">משותף</th></tr>
  <tr><td>שעות פוטנציאליות</td><td>${d.sharedPotential}</td></tr>
  <tr><td>ממוצע שנתי (12 חודשים)</td><td>${d.avgShnati}</td></tr>
</table>
${clinicSections}
<table>
  <tr><th colspan="2">סיכום כולל</th></tr>
  <tr><td>תקרה כוללת</td><td>${fmtILS(d.totalCeiling)}</td></tr>
  <tr><td>פרמיית עבודה — סמל 1783</td><td>${fmtILS(d.totalAvoda)}</td></tr>
  <tr><td>פרמיית העדרות — סמל 1785</td><td>${fmtILS(d.totalHeadrut)}</td></tr>
  <tr class="total"><td>סך פרמיה</td><td>${fmtILS(d.totalPremium)}</td></tr>
</table>
<div class="warning">מחשבון לא רשמי — תמיד צלבני מול התלוש.</div>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) {
    alert('יש לאפשר חלונות קופצים בדפדפן כדי לשמור PDF');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 600);
}

function downloadExcel() {
  const d = getSummaryData();
  const rows = [
    ['מחשבון פרמיות — ' + d.month, ''],
    ['סוג עובדת', d.isVetek ? 'ותיקה' : 'רגילה'],
    ['שעות פוטנציאליות', d.sharedPotential],
    ['ממוצע שנתי', d.avgShnati],
    ['', ''],
  ];
  d.clinics.forEach((c) => {
    rows.push([c.name, '']);
    rows.push(['שעות תקן', c.shaTeken || 0]);
    rows.push(['שעות עודפות', c.shaNosfot || 0]);
    rows.push(['שעות שלט', c.shaLaTipulit || 0]);
    rows.push(['היעדרות מזכה', c.headrutMazaka || 0]);
    rows.push(['היעדרות לא מזכה', c.headrutLoMazaka || 0]);
    rows.push(['תפוקות', c.tifukot || 0]);
    rows.push(['שעות עבודה (מחושב)', c.shaAvoda.toFixed(2)]);
    rows.push(['אחוז משרה במרפאה', (c.mishraPct * 100).toFixed(1) + '%']);
    rows.push(['תקרה במרפאה', c.takaraClinic.toFixed(2)]);
    rows.push(['פרמיית עבודה', c.premiatAvoda.toFixed(2)]);
    rows.push(['פרמיית העדרות', c.premiatHeadrut.toFixed(2)]);
    rows.push(['סך פרמיה במרפאה', c.totalClinic.toFixed(2)]);
    rows.push(['', '']);
  });
  rows.push(['סיכום כולל', '']);
  rows.push(['תקרה כוללת', d.totalCeiling.toFixed(2)]);
  rows.push(['פרמיית עבודה (סמל 1783)', d.totalAvoda.toFixed(2)]);
  rows.push(['פרמיית העדרות (סמל 1785)', d.totalHeadrut.toFixed(2)]);
  rows.push(['סך פרמיה', d.totalPremium.toFixed(2)]);
  rows.push(['', '']);
  rows.push(['הערה', 'מחשבון לא רשמי — תמיד צלבני מול התלוש']);

  const csv =
    '﻿' +
    rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'פרמיה_' + (d.month || 'חודש').replace(' ', '_') + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- COLLAPSIBLES ----
function toggleSection(id) {
  // .disclosure-panel is hidden by CLASS, so inline '' still means hidden —
  // toggle against the computed style and set an explicit value. (The old
  // ''/'none' toggle could never open a panel: both states rendered hidden.)
  const el = document.getElementById(id);
  const arrow = document.getElementById('arrow_' + id);
  if (!el) return;
  const isOpen = getComputedStyle(el).display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ---- NO-TFUKA PLANNER (Hagit mode) ----
// SYNCED with the main calculator (Allison 2026-06-10: "I want the page...
// to be synced with the regular page"): every switch onto the tab re-pulls
// all fields — including tfukot — from the clinics' summed data. Fields stay
// editable for what-if, but leaving and returning re-syncs.
function ntPullFromCalc() {
  const map = {
    nt_teken: 'shaTeken',
    nt_nosafot: 'shaNosfot',
    nt_shalat: 'shaLaTipulit',
    nt_mazaka: 'headrutMazaka',
    nt_loMazaka: 'headrutLoMazaka',
    nt_tifukot: 'tifukot',
  };
  let pulledAny = false;
  Object.entries(map).forEach(([ntId, field]) => {
    const sum = clinics.reduce((s, c) => s + (parseFloat(c[field]) || 0), 0);
    const el = document.getElementById(ntId);
    if (el) el.value = sum > 0 ? +sum.toFixed(2) : '';
    if (sum > 0) pulledAny = true;
  });
  const note = document.getElementById('ntSyncNote');
  if (note)
    note.textContent = pulledAny ? 'מסונכרן עם המחשבון ✓' : 'השעות נמשכות אוטומטית מהמחשבון';
  calcNoTfuka();
}

// The v1-style day-by-day month reference Allison asked to bring back
// (2026-06-10: "all the days of the week with the holidays... I like the
// reference"). Lists every calendar day of the selected month with its
// holiday status + potential hours + her combined hours across clinics.
function renderNtMonthReference() {
  const out = document.getElementById('ntDayReference');
  if (!out) return;
  const monthVal = hoursState.month || document.getElementById('hoursMonth').value;
  if (!monthVal) {
    out.innerHTML = '';
    return;
  }
  const [year, month] = monthVal.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  // Merge work hours per weekday across all clinics (same gate as compute:
  // checked + hrs > 0)
  const merged = {};
  clinics.forEach((c) => {
    const cdays = getClinicHoursDays(c.id);
    for (let i = 0; i <= 5; i++) {
      const rec = cdays[i];
      if (rec && rec.checked && (parseFloat(rec.hrs) || 0) > 0) {
        merged[i] = (merged[i] || 0) + parseFloat(rec.hrs);
      }
    }
  });
  const rows = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow === 6) continue; // Shabbat — never counted
    const dateStr = monthVal + '-' + String(d).padStart(2, '0');
    const holiday = HOLIDAYS[dateStr];
    let mult = 1;
    let note = 'יום רגיל — 8 שעות';
    if (holiday) {
      if (holiday.type === 'chag' || holiday.type === 'yomAtzmaut') {
        mult = 0;
        note = holiday.name + ' — 0 שעות';
      } else if (holiday.type === 'erev') {
        mult = 0.5;
        note = holiday.name + ' — 4 שעות (50%)';
      } else if (holiday.type === 'cholhamoed') {
        mult = 0.625;
        note = holiday.name + ' — 5 שעות (62.5%)';
      } else if (holiday.type === 'mekutzar') {
        note = holiday.name + ' — יום מקוצר = מלא';
      }
    }
    if (dow === 5) note += ' (שישי — לתקן בלבד)';
    const works = dow in merged;
    let line = `${dayNames[dow]} ${d}/${month} — ${note}`;
    if (works) {
      const teken = merged[dow] * mult;
      line += ` | שלך: ${teken % 1 === 0 ? teken : teken.toFixed(2)} ✓`;
    }
    rows.push(
      `<div style="${works ? 'color:#2d6a4f; font-weight:600;' : 'color:var(--muted);'}">${line}</div>`,
    );
  }
  out.innerHTML = rows.join('');
}

// Reverse calculator: instead of "treatments in → premia out", the user enters
// the hours that DON'T produce (שלט + absences) and learns how many hours are
// actually judged, how many tfukot the month demands, and — given expected
// tfukot — whether the plan earns anything.
function calcNoTfuka() {
  const teken = v('nt_teken');
  const nosafot = v('nt_nosafot');
  const shalat = v('nt_shalat');
  const mazaka = v('nt_mazaka');
  const loMazaka = v('nt_loMazaka');
  const expected = v('nt_tifukot');
  const makdam = v('makdam');
  const tarif = v('tarif');
  const out = document.getElementById('noTfukaResults');
  if (!out) return;

  if (teken <= 0) {
    out.innerHTML = `<div class="alert neutral">
      <div class="atitle">מלאי שעות תקן כדי לראות תוצאה</div>
      <div class="abody">המחשבון יראה כמה שעות לא צריכות תפוקה וכמה תפוקות צריך החודש.</div>
    </div>`;
    return;
  }

  // Present hours = everything Clalit pays for minus absences; shalat stays
  // inside them but is exempt from the productivity denominator.
  const present = Math.max(0, teken + nosafot - mazaka - loMazaka);
  const mecane = Math.max(0, present - shalat);
  const maxShalat = present / 2; // 50% coded-hours threshold
  const overShalatCap = shalat > maxShalat + 0.001;
  const minTifukot = mecane / makdam; // weighted must EXCEED mecane to earn
  const maxTifukot = (mecane * 2) / makdam; // avg 2.0 → full bonus rate

  // Supporting reference rows. The big-number answer above is the moment; these
  // are a calm breakdown, so NOT every row gets loud-KPI styling (it made all
  // six shout equally and flattened the hierarchy). Only the one accent row
  // (the load-bearing "hours that need no tfuka") carries weight.
  const row = (label, value, accent) => `
    <div class="result-row${accent ? ' accent' : ''}" style="border:none; background:none;">
      <span class="rlabel">${label}</span>
      <span class="rvalue${accent ? ' kpi' : ''}">${value}</span>
    </div>`;

  let html = '';

  // THE question (Allison, 2026-06-10: "how many hours could do nothing —
  // not shalat, not vacation, not sick, not tfuka, LITERALLY nothing — and
  // still hit premium"). These hours stay inside the מכנה and dilute the
  // average; because the premia is CAPPED at the ceiling, the average only
  // needs to be high enough to reach the cap, not the full 2.0. Her March:
  // 140 weighted, cap 3132, pay-hours 98.15 → needed avg 1.79 → מכנה can be
  // ~78; she treated ~70 → ~8 hours of pure nothing ("77−69").
  if (expected > 0) {
    const weighted = expected * makdam;
    const fullCeiling = v('takara');
    const potential = v('shaPotential');
    let maxMecane;
    let capNote;
    if (potential > 0 && present > 0 && tarif > 0) {
      // Ceiling exactly as Clalit computes it: integer-rounded % × full cap
      const mishraHours = Math.max(0, teken - loMazaka + nosafot);
      const mishraPct = Math.round((mishraHours / potential) * 100) / 100;
      const cap = mishraPct * fullCeiling;
      const capRate = Math.min(1, cap / (present * tarif));
      maxMecane = weighted / (capRate + 1);
      capNote = `ועדיין מגיעים לתקרה (${fmtILS0(cap)})`;
    } else {
      // No potential synced yet — fall back to the full-rate bar (avg 2.0)
      maxMecane = weighted / 2;
      capNote = 'ועדיין קצב פרמיה מלא (מלאי שעות פוטנציאליות לחישוב מול התקרה)';
    }
    // Her formula (2026-06-10): nothing-hours = שעות עבודה − תפוקות.
    // ~1 raw tfuka ≈ 1 treating hour, so what's left of the מכנה is hours
    // where literally nothing happened — no shalat, no reporting, nothing.
    // The verdict line says whether that's still inside the cap allowance.
    const nothingNow = Math.max(0, mecane - expected);
    const within = mecane <= maxMecane + 0.05;
    const slack = maxMecane - mecane;
    html += `<div class="total-box" style="margin-bottom:12px;">
      <div class="tlabel">שעות ללא תפוקות <button class="tip-btn" data-tip="ntNothing">?</button></div>
      <div class="tamount">${nothingNow.toFixed(1)} שעות</div>
      <div class="tsub">${
        within
          ? `${capNote} ✓${slack > 0.1 ? ` — יש מקום לעוד ${slack.toFixed(1)} שעות כאלה` : ''}`
          : `יותר מדי — הפרמיה תרד מתחת לתקרה. עודף של ${(mecane - maxMecane).toFixed(1)} שעות: עוד תפוקות או העברה לשלט`
      }</div>
    </div>`;
  }

  html += `<div style="background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px;">`;
  html += row('שעות נוכחות בפועל', present.toFixed(1) + ' שעות');
  html += row(
    'לא צריכות תפוקה (היעדרות + שלט)',
    (mazaka + loMazaka + shalat).toFixed(1) + ' שעות',
    true,
  );
  html += row('נמדדות לתפוקה (המכנה)', mecane.toFixed(1) + ' שעות');
  html += row('מקסימום שלט מותר החודש (סף 50%)', maxShalat.toFixed(1) + ' שעות');
  html += row('תפוקות מינימום לפרמיה כלשהי', 'יותר מ-' + minTifukot.toFixed(1));
  html += row('תפוקות לקצב פרמיה מלא', maxTifukot.toFixed(1));
  html += `</div>`;

  if (overShalatCap) {
    html += `<div class="alert danger" style="margin-top:10px;">
      <div class="atitle">⚠️ יותר מדי שלט</div>
      <div class="abody">השלט עבר את סף ה-50% (${maxShalat.toFixed(1)} שעות) — במצב כזה אין פרמיה בכלל, לא משנה כמה תפוקות.</div>
    </div>`;
  }

  if (expected > 0 && !overShalatCap) {
    const weighted = expected * makdam;
    if (weighted > mecane) {
      // Same 2-decimal rounding Clalit applies in calcClinic
      const avg = Math.round(Math.min(weighted / mecane - 1, 1) * 100) / 100;
      const premia = present * avg * tarif;
      html += `<div class="alert success" style="margin-top:10px;">
        <div class="atitle">✓ עם השלט שהזנת (${shalat.toFixed(1)}) יש פרמיה</div>
        <div class="abody">פרמיית עבודה משוערת: <strong>${fmtILS(premia)}</strong> (לפני תקרה אישית)</div>
      </div>`;
    } else {
      // Earn nothing unless judged hours drop below weighted treatments —
      // i.e. more hours must become shalat (bounded by the 50% cap).
      const shalatNeeded = present - weighted - shalat;
      const feasible = shalat + shalatNeeded <= maxShalat;
      html += `<div class="alert warning" style="margin-top:10px;">
        <div class="atitle">עם ${expected} תפוקות והשלט שהזנת — עדיין אין פרמיה</div>
        <div class="abody">${
          feasible
            ? `כדי להתחיל להרוויח: עוד <strong>${Math.max(0.5, Math.ceil(shalatNeeded * 2) / 2).toFixed(1)} שעות שלט</strong> (או יותר תפוקות).`
            : `גם מקסימום שלט לא יספיק החודש — צריך יותר מ-${minTifukot.toFixed(0)} תפוקות.`
        }</div>
      </div>`;
    }
  }

  out.innerHTML = html;
}

// ---- TABS ----
function switchTab(tab) {
  document.getElementById('panel-calc').style.display = tab === 'calc' ? '' : 'none';
  document.getElementById('panel-hours').style.display = tab === 'hours' ? '' : 'none';
  document.getElementById('panel-notfuka').style.display = tab === 'notfuka' ? '' : 'none';
  document.getElementById('tab-calc').classList.toggle('active', tab === 'calc');
  document.getElementById('tab-hours').classList.toggle('active', tab === 'hours');
  document.getElementById('tab-notfuka').classList.toggle('active', tab === 'notfuka');
  if (tab === 'notfuka') {
    ntPullFromCalc();
    renderNtMonthReference();
  }
  if (tab === 'hours') {
    // Re-render hours sections in case clinics were added/removed/renamed
    // since the last time we visited this tab.
    const container = document.getElementById('clinicHoursContainer');
    const liveCount = container ? container.querySelectorAll('[data-hours-card]').length : 0;
    if (liveCount !== clinics.length) {
      renderHoursClinics();
    } else {
      calcHours();
    }
  }
}

// ---- HEBREW HOLIDAY CALENDAR 2026-2027 ----
const HOLIDAYS = {
  '2026-03-03': { type: 'mekutzar', name: 'פורים' },
  '2026-04-01': { type: 'erev', name: 'ערב פסח' },
  '2026-04-02': { type: 'chag', name: 'פסח א׳' },
  '2026-04-03': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-04': { type: 'cholhamoed', name: 'חול המועד פסח (שבת)' },
  '2026-04-05': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-06': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-07': { type: 'cholhamoed', name: 'חול המועד פסח (ערב שביעי של פסח)' },
  '2026-04-08': { type: 'chag', name: 'שביעי של פסח' },
  '2026-04-21': { type: 'erev', name: 'יום הזיכרון' },
  '2026-04-22': { type: 'yomAtzmaut', name: 'יום העצמאות' },
  '2026-05-21': { type: 'erev', name: 'ערב שבועות' },
  '2026-05-22': { type: 'chag', name: 'שבועות' },
  '2026-09-11': { type: 'erev', name: 'ערב ראש השנה' },
  '2026-09-12': { type: 'chag', name: 'ראש השנה א׳' },
  '2026-09-13': { type: 'chag', name: 'ראש השנה ב׳' },
  '2026-09-20': { type: 'erev', name: 'ערב יום כיפור' },
  '2026-09-21': { type: 'chag', name: 'יום כיפור' },
  '2026-09-25': { type: 'erev', name: 'ערב סוכות' },
  '2026-09-26': { type: 'chag', name: 'סוכות א׳' },
  '2026-09-27': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-28': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-29': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-30': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-10-01': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-10-02': { type: 'cholhamoed', name: 'הושענא רבה (חול המועד סוכות)' },
  '2026-10-03': { type: 'chag', name: 'שמיני עצרת / שמחת תורה' },
  '2026-12-05': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-06': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-07': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-08': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-09': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-10': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-11': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-12': { type: 'mekutzar', name: 'חנוכה' },
  '2027-03-23': { type: 'mekutzar', name: 'פורים' },
  '2027-04-21': { type: 'erev', name: 'ערב פסח' },
  '2027-04-22': { type: 'chag', name: 'פסח א׳' },
  '2027-04-23': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-24': { type: 'cholhamoed', name: 'חול המועד פסח (שבת)' },
  '2027-04-25': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-26': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-27': { type: 'cholhamoed', name: 'חול המועד פסח (ערב שביעי של פסח)' },
  '2027-04-28': { type: 'chag', name: 'שביעי של פסח' },
  '2027-05-11': { type: 'erev', name: 'יום הזיכרון' },
  '2027-05-12': { type: 'yomAtzmaut', name: 'יום העצמאות' },
  '2027-06-10': { type: 'erev', name: 'ערב שבועות' },
  '2027-06-11': { type: 'chag', name: 'שבועות' },
  '2027-10-01': { type: 'erev', name: 'ערב ראש השנה' },
  '2027-10-02': { type: 'chag', name: 'ראש השנה א׳' },
  '2027-10-03': { type: 'chag', name: 'ראש השנה ב׳' },
  '2027-10-10': { type: 'erev', name: 'ערב יום כיפור' },
  '2027-10-11': { type: 'chag', name: 'יום כיפור' },
  '2027-10-15': { type: 'erev', name: 'ערב סוכות' },
  '2027-10-16': { type: 'chag', name: 'סוכות א׳' },
  '2027-10-17': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-18': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-19': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-20': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-21': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-22': { type: 'cholhamoed', name: 'הושענא רבה (חול המועד סוכות)' },
  '2027-10-23': { type: 'chag', name: 'שמיני עצרת / שמחת תורה' },
  '2027-12-25': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-26': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-27': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-28': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-29': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-30': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-31': { type: 'mekutzar', name: 'חנוכה' },
};

const DAY_NAMES_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

// Build hours month selector (Jan 2026 - Dec 2027)
(function () {
  const monthNames = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const sel = document.getElementById('hoursMonth');
  const now = new Date();
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 0; m < 12; m++) {
      const opt = document.createElement('option');
      opt.value = y + '-' + String(m + 1).padStart(2, '0');
      opt.textContent = monthNames[m] + ' ' + y;
      if (y === now.getFullYear() && m === now.getMonth()) opt.selected = true;
      sel.appendChild(opt);
    }
  }
})();

// ---- HOURS TAB — PER-CLINIC DAY-GRID SECTIONS ----
// Each clinic gets its own labeled day-grid card. The shared month picker
// at the top applies to all. Per-clinic days/hours are stored separately
// from the calc-tab clinic record so users can experiment without affecting
// what's already been applied to the calculator.
//
// Storage shape (key = premiot_hours_v2):
//   { month: "YYYY-MM", byClinic: { [clinicId]: { days: { 0: {checked,hrs}, ... } } } }
const HOURS_KEY_V2 = 'premiot_hours_v2';
const HOURS_KEY_LEGACY = 'premiot_hours';
let hoursState = { month: null, byClinic: {} };
const DAY_DEFS = [
  { idx: 0, name: 'א׳ (ראשון)' },
  { idx: 1, name: 'ב׳ (שני)' },
  { idx: 2, name: 'ג׳ (שלישי)' },
  { idx: 3, name: 'ד׳ (רביעי)' },
  { idx: 4, name: 'ה׳ (חמישי)' },
  { idx: 5, name: 'ו׳ (שישי) — לתקן בלבד' },
];

function getClinicHoursDays(clinicId) {
  if (!hoursState.byClinic[clinicId]) {
    hoursState.byClinic[clinicId] = { days: {} };
  }
  return hoursState.byClinic[clinicId].days;
}

function saveHoursState() {
  try {
    hoursState.month = document.getElementById('hoursMonth').value || hoursState.month;
    localStorage.setItem(HOURS_KEY_V2, JSON.stringify(hoursState));
  } catch (e) {
    /* ignore */
  }
}

function loadHoursState() {
  try {
    const raw = localStorage.getItem(HOURS_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        hoursState.month = parsed.month || null;
        hoursState.byClinic = parsed.byClinic || {};
      }
      return;
    }
    // Migrate legacy single-grid format → clinic-1's slot
    const legacy = localStorage.getItem(HOURS_KEY_LEGACY);
    if (legacy) {
      const old = JSON.parse(legacy);
      hoursState.month = old.month || null;
      // We may not have clinics loaded yet — defer assignment to renderHoursClinics
      hoursState._legacyDays = old.days || null;
    }
  } catch (e) {
    /* ignore */
  }
}

// Build per-clinic day-grid card. Called every time the clinic list changes
// OR when switching to the Hours tab, so add/remove on calc tab syncs over.
function renderHoursClinics() {
  const container = document.getElementById('clinicHoursContainer');
  const template = document.getElementById('clinic-hours-template');
  if (!container || !template) return;
  container.innerHTML = '';

  // If migrating from legacy single-grid, hand it to clinic-1
  if (hoursState._legacyDays && clinics.length > 0) {
    const firstId = clinics[0].id;
    if (
      !hoursState.byClinic[firstId] ||
      Object.keys(hoursState.byClinic[firstId].days).length === 0
    ) {
      hoursState.byClinic[firstId] = { days: hoursState._legacyDays };
    }
    delete hoursState._legacyDays;
    try {
      localStorage.removeItem(HOURS_KEY_LEGACY);
    } catch (e) {
      /* ignore */
    }
    saveHoursState();
  }

  // Garbage-collect orphan entries (clinic was deleted on calc tab)
  const liveIds = new Set(clinics.map((c) => c.id));
  Object.keys(hoursState.byClinic).forEach((cid) => {
    if (!liveIds.has(cid)) delete hoursState.byClinic[cid];
  });

  clinics.forEach((c, cidx) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('[data-hours-card]');
    card.setAttribute('data-hours-clinic-id', c.id);
    const nameEl = card.querySelector('[data-hours-name]');
    nameEl.textContent = c.name || 'מרפאה ' + (cidx + 1);
    const pillEl = card.querySelector('[data-hours-pill]');
    pillEl.textContent = 'שעות לפי המרפאה הזו';

    const dayGrid = card.querySelector('[data-day-grid]');
    const days = getClinicHoursDays(c.id);
    DAY_DEFS.forEach((d) => {
      const saved = days[d.idx] || {};
      const row = document.createElement('div');
      row.className = 'input-row';
      const chkId = `chk_${c.id}_d${d.idx}`;
      const hrsId = `hrs_${c.id}_d${d.idx}`;
      row.innerHTML = `
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="${chkId}" data-clinic-id="${c.id}" data-day-idx="${d.idx}" data-kind="chk" style="width:18px; height:18px; accent-color:#2d6a4f;" ${saved.checked ? 'checked' : ''}>
          <span style="font-size:13px; color:var(--text);">${d.name}</span>
        </label>
        <span class="unit">שעות</span>
        <input type="number" inputmode="decimal" id="${hrsId}" data-clinic-id="${c.id}" data-day-idx="${d.idx}" data-kind="hrs" value="${saved.hrs || ''}" placeholder="0" step="0.5" lang="en" autocomplete="off">
      `;
      dayGrid.appendChild(row);
    });

    container.appendChild(node);
  });

  // Wire change handlers (delegate at container level)
  container.oninput = onHoursInput;
  container.onchange = onHoursInput;

  calcHours();
}

function onHoursInput(e) {
  const t = e.target;
  if (!t || !t.dataset || !t.dataset.clinicId) return;
  const cid = t.dataset.clinicId;
  const didx = parseInt(t.dataset.dayIdx, 10);
  const kind = t.dataset.kind;
  const days = getClinicHoursDays(cid);
  if (!days[didx]) days[didx] = { checked: false, hrs: '' };
  if (kind === 'chk') days[didx].checked = !!t.checked;
  if (kind === 'hrs') {
    days[didx].hrs = t.value;
    // Typing hours means "I work this day" — auto-tick the box so a non-techy
    // OT who fills the number but forgets the checkbox still sees her teken
    // update. Clearing the number back to 0/empty un-ticks it. The compute
    // still gates on (checked && hrs>0), so this only syncs the UI state.
    const hrsNum = parseFloat(t.value) || 0;
    days[didx].checked = hrsNum > 0;
    const chk = document.getElementById(`chk_${cid}_d${didx}`);
    if (chk) chk.checked = days[didx].checked;
  }
  saveHoursState();
  calcHours();
}

// Compute potential + teken for a given (clinic, month). Returns
// { potential, teken, groups }. Potential is identical across clinics for
// the same month (calendar baseline) but we display it per-section so the
// user sees the math both ways.
function computeHoursForClinic(clinicId, monthVal) {
  const [year, month] = monthVal.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cdays = getClinicHoursDays(clinicId);
  const workDays = {};
  for (let i = 0; i <= 5; i++) {
    const rec = cdays[i];
    if (!rec) continue;
    const hrs = parseFloat(rec.hrs) || 0;
    if (rec.checked && hrs > 0) workDays[i] = hrs;
  }

  let potential = 0;
  let teken = 0;
  const groups = {
    regular: { count: 0, hours: 0 },
    erev: { count: 0, hours: 0 },
    cholhamoed: { count: 0, hours: 0 },
    chag: 0,
    mekutzar: { count: 0, hours: 0 },
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const holiday = HOLIDAYS[dateStr];
    if (dow === 6) continue;

    let potentialDay = 8;
    let tekenMultiplier = 1;
    let dayType = 'regular';

    if (holiday) {
      if (holiday.type === 'chag' || holiday.type === 'yomAtzmaut') {
        potentialDay = 0;
        tekenMultiplier = 0;
        dayType = 'chag';
      } else if (holiday.type === 'erev') {
        potentialDay = 4;
        tekenMultiplier = 0.5;
        dayType = 'erev';
      } else if (holiday.type === 'cholhamoed') {
        potentialDay = 5;
        tekenMultiplier = 0.625;
        dayType = 'cholhamoed';
      } else if (holiday.type === 'mekutzar') {
        potentialDay = 8;
        tekenMultiplier = 1;
        dayType = 'mekutzar';
      }
    }

    if (dow !== 5) potential += potentialDay;

    if (dow in workDays) {
      const regularHours = workDays[dow];
      const tekenHours = regularHours * tekenMultiplier;
      teken += tekenHours;
      if (dow !== 5) {
        if (dayType === 'regular') {
          groups.regular.count += 1;
          groups.regular.hours += tekenHours;
        } else if (dayType === 'erev') {
          groups.erev.count += 1;
          groups.erev.hours += tekenHours;
        } else if (dayType === 'cholhamoed') {
          groups.cholhamoed.count += 1;
          groups.cholhamoed.hours += tekenHours;
        } else if (dayType === 'chag') {
          groups.chag += 1;
        } else if (dayType === 'mekutzar') {
          groups.mekutzar.count += 1;
          groups.mekutzar.hours += tekenHours;
        }
      }
    }
  }

  return { potential, teken, groups };
}

function renderHoursBreakdown(groups) {
  const lines = [];
  if (groups.regular.count > 0) {
    lines.push(
      `<div>ימי חול: ${groups.regular.count} × ${(groups.regular.hours / groups.regular.count).toFixed(0)} = ${groups.regular.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.erev.count > 0) {
    lines.push(
      `<div>ערב חג: ${groups.erev.count} × ${(groups.erev.hours / groups.erev.count).toFixed(1)} = ${groups.erev.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.cholhamoed.count > 0) {
    lines.push(
      `<div>חול המועד: ${groups.cholhamoed.count} × ${(groups.cholhamoed.hours / groups.cholhamoed.count).toFixed(2)} = ${groups.cholhamoed.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.chag > 0) {
    lines.push(`<div>חג: ${groups.chag} (לא נכלל)</div>`);
  }
  if (groups.mekutzar.count > 0) {
    lines.push(
      `<div>יום מקוצר: ${groups.mekutzar.count} × ${(groups.mekutzar.hours / groups.mekutzar.count).toFixed(0)} = ${groups.mekutzar.hours.toFixed(1)}ש</div>`,
    );
  }
  return lines.join('');
}

// Recompute and paint all clinic sections. Called on input + month change.
function calcHours() {
  const monthVal = document.getElementById('hoursMonth').value;
  if (!monthVal) return;
  hoursState.month = monthVal;
  saveHoursState();

  document.querySelectorAll('[data-hours-card]').forEach((card) => {
    const cid = card.getAttribute('data-hours-clinic-id');
    const { potential, teken, groups } = computeHoursForClinic(cid, monthVal);
    const potEl = card.querySelector('[data-readout-potential]');
    const tekEl = card.querySelector('[data-readout-teken]');
    const brkEl = card.querySelector('[data-readout-breakdown]');
    if (potEl) potEl.textContent = potential + ' שעות';
    if (tekEl) tekEl.textContent = teken.toFixed(2) + ' שעות';
    if (brkEl) brkEl.innerHTML = renderHoursBreakdown(groups);
  });
}

function flashInput(el) {
  if (!el) return;
  el.classList.remove('flash');
  // trigger reflow
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 250);
}

// Push every clinic's per-section teken into its matching calc-tab clinic,
// plus the shared potential (same calendar baseline for the month) into the
// shared strip. ONE button → all sections applied at once.
function applyAllHoursToCalc() {
  const monthVal = document.getElementById('hoursMonth').value;
  if (!monthVal || clinics.length === 0) return;

  let appliedAny = false;
  let sharedPotential = 0;
  clinics.forEach((clinic) => {
    const { potential, teken } = computeHoursForClinic(clinic.id, monthVal);
    if (potential > sharedPotential) sharedPotential = potential;
    // Only apply teken when this clinic has any day data — empty section
    // shouldn't overwrite a manually-entered teken on calc tab.
    const cdays = getClinicHoursDays(clinic.id);
    const hasAny = Object.values(cdays).some((r) => r && r.checked && (parseFloat(r.hrs) || 0) > 0);
    if (hasAny) {
      clinic.shaTeken = teken.toFixed(2);
      appliedAny = true;
    }
  });

  // Shared potential
  if (sharedPotential > 0) {
    const sharedEl = document.getElementById('shaPotential');
    sharedEl.value = sharedPotential;
    flashInput(sharedEl);
  }

  // Sync month label onto calc tab
  const [y, m] = monthVal.split('-').map(Number);
  const monthNames = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const label = monthNames[m - 1] + ' ' + y;
  const sel = document.getElementById('selectedMonth');
  let found = false;
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === label) {
      sel.selectedIndex = i;
      found = true;
      break;
    }
  }
  if (!found) {
    const opt = document.createElement('option');
    opt.value = label;
    opt.textContent = label;
    sel.appendChild(opt);
    sel.value = label;
  }
  document.getElementById('selectedMonthDisplay').textContent = label;

  if (appliedAny) {
    // Expand first clinic with data
    const firstWith = clinics.find((c) => parseFloat(c.shaTeken) > 0);
    if (firstWith) {
      clinics.forEach((c) => (c.expanded = c.id === firstWith.id));
      lastEditedClinicId = firstWith.id;
    }
    switchTab('calc');
    renderClinics();
    setTimeout(() => {
      clinics.forEach((c) => {
        const card = document.querySelector(`[data-clinic-card][data-clinic-id="${c.id}"]`);
        if (card) flashInput(card.querySelector('[data-field="shaTeken"]'));
      });
    }, 50);
    calc();
    showToast(`הועברו שעות ל-${clinics.filter((c) => parseFloat(c.shaTeken) > 0).length} מרפאות`);
  } else {
    showToast('מלאי שעות לפחות במרפאה אחת');
  }
}

// Back-compat: older code paths still call applyHoursToCalc() — route to the
// new multi-clinic apply.
function applyHoursToCalc() {
  applyAllHoursToCalc();
}

function syncMonthAndGoToHours() {
  switchTab('hours');
}

// ---- HOURS-FIRST FLOW ----
// Edit-link on the shared "שעות פוטנציאליות" row — sends user to hours tab.
// (Hours tab state is preserved separately in premiot_hours.)
function goEditHoursForShared() {
  switchTab('hours');
  showToast('עדכני את הימים והשעות בכל מרפאה, ואז "העבר הכל" ←');
}

// Per-clinic teken edit-link — jump to hours tab and scroll the matching
// section into view (each clinic now has its own labeled day-grid section).
function goEditHoursForClinic(linkEl) {
  const card = linkEl.closest('[data-clinic-card]');
  const cid = card ? card.getAttribute('data-clinic-id') : null;
  if (cid) lastEditedClinicId = cid;
  switchTab('hours');
  if (cid) {
    setTimeout(() => {
      const target = document.querySelector(`[data-hours-card][data-hours-clinic-id="${cid}"]`);
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  }
  showToast('עדכני את הימים והשעות במרפאה הזו, ואז "העבר הכל" ←');
}

// Show/hide empty-state and from-hours badges based on whether shared
// potential + per-clinic teken are populated. Called from calc() each tick.
function updateHoursFirstUI() {
  const sharedPot = parseFloat(document.getElementById('shaPotential').value) || 0;
  const emptyEl = document.getElementById('hoursEmptyState');
  const sharedBadge = document.getElementById('shaPotentialBadge');
  const clinicsContainer = document.getElementById('clinicsContainer');
  const addBtn = document.querySelector('.add-clinic-btn');

  const sharedEditLink = document.querySelector('.shared-strip .edit-from-hours');
  if (sharedPot <= 0) {
    if (emptyEl) emptyEl.style.display = '';
    if (clinicsContainer) clinicsContainer.style.display = 'none';
    if (addBtn) addBtn.style.display = 'none';
    if (sharedBadge) sharedBadge.style.display = 'none';
    if (sharedEditLink) sharedEditLink.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (clinicsContainer) clinicsContainer.style.display = '';
    if (addBtn) addBtn.style.display = '';
    if (sharedBadge) sharedBadge.style.display = '';
    if (sharedEditLink) sharedEditLink.style.display = '';
  }

  // Per-clinic teken badge + edit link — show only when teken has a value
  document.querySelectorAll('[data-clinic-card]').forEach((card) => {
    const tekenInput = card.querySelector('[data-field="shaTeken"]');
    const badge = card.querySelector('[data-teken-badge]');
    const editLink = card.querySelector('[data-edit-teken]');
    if (!tekenInput) return;
    const v = parseFloat(tekenInput.value) || 0;
    if (badge) badge.style.display = v > 0 ? '' : 'none';
    if (editLink) editLink.style.display = v > 0 ? '' : 'none';
  });
}

// ---- BOOTSTRAP ----
// Detect "fresh load" BEFORE loadFromStorage migrates anything.
const _freshLoad =
  !localStorage.getItem(STORAGE_KEY) &&
  !localStorage.getItem(LEGACY_KEY) &&
  !localStorage.getItem(HOURS_KEY_V2) &&
  !localStorage.getItem(HOURS_KEY_LEGACY);
loadFromStorage();
loadHoursState();
if (clinics.length === 0) {
  clinics = [newClinicObj('מרפאה 1')];
}
renderClinics();
// Restore month selector to last-used value before the first Hours render
if (hoursState.month) {
  const hm = document.getElementById('hoursMonth');
  if (hm) {
    for (let i = 0; i < hm.options.length; i++) {
      if (hm.options[i].value === hoursState.month) {
        hm.selectedIndex = i;
        break;
      }
    }
  }
}
renderHoursClinics();
maybeLockShared();
calc();

// Fresh user with no data → land on Hours tab so they get the natural
// "fill hours first" flow. Returning users land on calc — and switchTab must
// run for them too: the HTML hardcodes the active class on tab-hours while
// panel-calc is the visible panel, so skipping the call left returning users
// with the WRONG tab highlighted (caught 2026-06-11).
switchTab(_freshLoad ? 'hours' : 'calc');
