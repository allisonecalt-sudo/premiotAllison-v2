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
      updateApplyClinicDropdown();
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
      clinics = clinics.filter((cc) => cc.id !== c.id);
      if (lastEditedClinicId === c.id) lastEditedClinicId = null;
      renderClinics();
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

  updateApplyClinicDropdown();
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
  calc();
}

function updateApplyClinicDropdown() {
  const wrap = document.getElementById('applyClinicWrap');
  const sel = document.getElementById('applyClinic');
  if (!wrap || !sel) return;
  if (clinics.length > 1) {
    wrap.style.display = '';
    sel.innerHTML = '';
    clinics.forEach((c, i) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name || 'מרפאה ' + (i + 1);
      sel.appendChild(opt);
    });
  } else {
    wrap.style.display = 'none';
  }
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
  const avgTipulim = Math.min(Math.max(rawAvg - 1, 0), 1);
  const totalHoursLeTashlum = Math.max(0, shaTeken - headrutMazaka - headrutLoMazaka + shaNosfot);

  // Per-clinic mishra% = (work + overtime + qualifying absence) / shared potential
  const mishraHours = Math.max(0, shaTeken - headrutLoMazaka + shaNosfot);
  const mishraPct = sharedPotential > 0 ? mishraHours / sharedPotential : 0;
  const takaraClinic = mishraPct * fullCeiling;

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
    setReadout('shaAvoda', r.shaAvoda.toFixed(2));
    setReadout('mishraPct', (r.mishraPct * 100).toFixed(1) + '%');
    setReadout('takaraClinic', fmtILS(r.takaraClinic));
    setReadout('premiatAvoda', fmtILS(r.premiatAvoda));
    setReadout('premiatHeadrut', fmtILS(r.premiatHeadrut));

    const sum = card.querySelector('[data-clinic-sum]');
    if (sum) sum.textContent = fmtILS(r.totalClinic);

    const pill = card.querySelector('[data-clinic-pill]');
    if (pill) {
      pill.className = 'pill ' + r.pill;
      pill.textContent = r.pillLabel;
    }
  });

  // ---- Combined readouts ----
  document.getElementById('r_total').textContent = fmtILS(totalPremium);
  document.getElementById('r_total_sub').textContent =
    'סמל 1783: ' + fmtILS(totalAvoda) + ' | סמל 1785: ' + fmtILS(totalHeadrut);

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
  set('r_avg', combinedAvgClamped.toFixed(3), combinedAvgClamped >= 1 ? '(מקסימום ✓)' : '');
  set('r_totalHours', totalHoursLeTashlum.toFixed(2), 'שעות');
  set('r_mishra', (totalMishraPct * 100).toFixed(1), '%');
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
  document.getElementById('stickyPct').textContent = stickyPctVal.toFixed(0) + '%';
  document.getElementById('stickyTakara').textContent =
    'תקרה: ' + (totalCeiling > 0 ? fmtILS0(totalCeiling) : '—');
  document.getElementById('r_avg_sticky').textContent = combinedAvgClamped.toFixed(3);

  // chips per-clinic in sticky (only when multi)
  updateChips(results);

  // month-over-month diff
  updateMonthDiff(totalPremium);

  // Progress bar block
  const gapToTakara = totalCeiling - totalPremium;
  const progressPct = totalCeiling > 0 ? Math.min((totalPremium / totalCeiling) * 100, 100) : 0;
  const atOrOverCap = totalCeiling > 0 && totalPremium >= totalCeiling - 0.5;
  const progressColor = !hasData
    ? '#a09e96'
    : progressPct >= 75
      ? '#2d6a4f'
      : progressPct >= 40
        ? '#b5621a'
        : '#c0392b';
  // (hasData defined above in sticky-result block — premium > 0 AND cap > 0)

  document.getElementById('takaraProgress').innerHTML =
    totalCeiling > 0
      ? `
    <div style="background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-size:12px; color:var(--muted);">התקדמות לתקרה</span>
        <span style="font-size:12px; font-weight:700; color:${progressColor};">${progressPct.toFixed(1)}%</span>
      </div>
      <div style="background:var(--surface-3); border-radius:99px; height:10px; overflow:hidden;">
        <div style="width:${progressPct}%; height:100%; background:${progressColor}; border-radius:99px; transition:width 0.4s;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:7px;">
        <span style="font-size:11px; color:var(--muted);">פרמיה: ${fmtILS(totalPremium)}</span>
        <span style="font-size:11px; color:var(--muted);">תקרה: ${fmtILS(totalCeiling)}</span>
      </div>
      ${atOrOverCap ? '' : `<div style="margin-top:6px; font-size:12px; color:#d97706; text-align:center;">חסר: ${fmtILS(gapToTakara)}</div>`}
    </div>`
      : '';

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

  // Auto-open the פירוט drill-down when result exists, only first time
  maybeAutoOpenDetail(totalPremium > 0 && anyClinicHasInput);

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
  if (el && el.style.display === 'none') {
    el.style.display = '';
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

function resetFields() {
  saveUndoSnapshot();
  document.getElementById('shaPotential').value = '';
  document.getElementById('avgShnati').value = '';
  clinics = [newClinicObj('מרפאה 1')];
  lastEditedClinicId = clinics[0].id;
  detailAutoOpened = false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('premiot_last_month_total');
  } catch (e) {
    /* ignore */
  }
  renderClinics();
  calc();
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
  const el = document.getElementById(id);
  const arrow = document.getElementById('arrow_' + id);
  if (!el) return;
  if (el.style.display === 'none' || el.style.display === '') {
    el.style.display = el.style.display === 'none' ? '' : 'none';
    // explicit handling
    if (el.style.display === '') {
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
      if (arrow) arrow.style.transform = '';
    }
  } else {
    el.style.display = 'none';
    if (arrow) arrow.style.transform = '';
  }
}

// ---- TABS ----
function switchTab(tab) {
  document.getElementById('panel-calc').style.display = tab === 'calc' ? '' : 'none';
  document.getElementById('panel-hours').style.display = tab === 'hours' ? '' : 'none';
  document.getElementById('tab-calc').classList.toggle('active', tab === 'calc');
  document.getElementById('tab-hours').classList.toggle('active', tab === 'hours');
  if (tab === 'hours') calcHours();
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

// Day input checkboxes
(function () {
  const container = document.getElementById('dayInputs');
  const days = [
    { idx: 0, name: 'א׳ (ראשון)', id: 'day0' },
    { idx: 1, name: 'ב׳ (שני)', id: 'day1' },
    { idx: 2, name: 'ג׳ (שלישי)', id: 'day2' },
    { idx: 3, name: 'ד׳ (רביעי)', id: 'day3' },
    { idx: 4, name: 'ה׳ (חמישי)', id: 'day4' },
    { idx: 5, name: 'ו׳ (שישי) — לתקן בלבד', id: 'day5' },
  ];
  days.forEach((d) => {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <label style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="chk_${d.id}" onchange="calcHours()" style="width:18px; height:18px; accent-color:#2d6a4f;">
        <span style="font-size:13px; color:var(--text);">${d.name}</span>
      </label>
      <span class="unit">שעות</span>
      <input type="number" inputmode="decimal" id="hrs_${d.id}" value="" placeholder="0" step="0.5" lang="en" autocomplete="off" oninput="calcHours()">
    `;
    container.appendChild(row);
  });
})();

function calcHours() {
  const monthVal = document.getElementById('hoursMonth').value;
  const [year, month] = monthVal.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const workDays = {};
  for (let i = 0; i <= 5; i++) {
    const checked = document.getElementById('chk_day' + i).checked;
    const hrs = parseFloat(document.getElementById('hrs_day' + i).value) || 0;
    if (checked && hrs > 0) workDays[i] = hrs;
  }

  let potential = 0;
  let teken = 0;

  // grouped counts
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

    if (dow !== 5) {
      potential += potentialDay;
    }

    if (dow in workDays) {
      const regularHours = workDays[dow];
      const tekenHours = regularHours * tekenMultiplier;
      teken += tekenHours;

      // group accounting only for Sun-Thu (Friday handled separately if needed)
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

  document.getElementById('hr_potential').textContent = potential + ' שעות';
  document.getElementById('hr_teken').textContent = teken.toFixed(2) + ' שעות';

  // Grouped breakdown
  const breakdownLines = [];
  if (groups.regular.count > 0) {
    breakdownLines.push(
      `<div>ימי חול: ${groups.regular.count} × ${(groups.regular.hours / groups.regular.count).toFixed(0)} = ${groups.regular.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.erev.count > 0) {
    breakdownLines.push(
      `<div>ערב חג: ${groups.erev.count} × ${(groups.erev.hours / groups.erev.count).toFixed(1)} = ${groups.erev.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.cholhamoed.count > 0) {
    breakdownLines.push(
      `<div>חול המועד: ${groups.cholhamoed.count} × ${(groups.cholhamoed.hours / groups.cholhamoed.count).toFixed(2)} = ${groups.cholhamoed.hours.toFixed(1)}ש</div>`,
    );
  }
  if (groups.chag > 0) {
    breakdownLines.push(`<div>חג: ${groups.chag} (לא נכלל)</div>`);
  }
  if (groups.mekutzar.count > 0) {
    breakdownLines.push(
      `<div>יום מקוצר: ${groups.mekutzar.count} × ${(groups.mekutzar.hours / groups.mekutzar.count).toFixed(0)} = ${groups.mekutzar.hours.toFixed(1)}ש</div>`,
    );
  }
  document.getElementById('dayBreakdown').innerHTML = breakdownLines.join('');

  try {
    const hdata = { month: monthVal, days: {} };
    for (let i = 0; i <= 5; i++) {
      hdata.days[i] = {
        checked: document.getElementById('chk_day' + i).checked,
        hrs: document.getElementById('hrs_day' + i).value,
      };
    }
    localStorage.setItem('premiot_hours', JSON.stringify(hdata));
  } catch (e) {
    /* ignore */
  }
}

function flashInput(el) {
  if (!el) return;
  el.classList.remove('flash');
  // trigger reflow
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 250);
}

function applyHoursToCalc() {
  const pot = document.getElementById('hr_potential').textContent.replace(/[^\d.]/g, '');
  const tek = document.getElementById('hr_teken').textContent.replace(/[^\d.]/g, '');

  // shared potential
  const sharedEl = document.getElementById('shaPotential');
  sharedEl.value = pot;
  flashInput(sharedEl);

  // Pick clinic: dropdown if multi, else clinic 0
  let targetClinicId = null;
  if (clinics.length > 1) {
    const sel = document.getElementById('applyClinic');
    targetClinicId = sel ? sel.value : clinics[0].id;
  } else {
    targetClinicId = clinics[0].id;
  }
  const clinic = clinics.find((c) => c.id === targetClinicId) || clinics[0];
  clinic.shaTeken = tek;
  lastEditedClinicId = clinic.id;
  // expand it
  clinics.forEach((c) => (c.expanded = c.id === clinic.id));

  // Sync month
  const monthVal = document.getElementById('hoursMonth').value;
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

  switchTab('calc');
  renderClinics();
  // flash the targeted teken input after render
  setTimeout(() => {
    const card = document.querySelector(`[data-clinic-card][data-clinic-id="${clinic.id}"]`);
    if (card) {
      const inp = card.querySelector('[data-field="shaTeken"]');
      flashInput(inp);
    }
  }, 50);
  calc();
}

function syncMonthAndGoToHours() {
  switchTab('hours');
}

// Restore hours tab state
(function () {
  try {
    const raw = localStorage.getItem('premiot_hours');
    if (!raw) return;
    const hdata = JSON.parse(raw);
    if (hdata.month) document.getElementById('hoursMonth').value = hdata.month;
    if (hdata.days) {
      for (let i = 0; i <= 5; i++) {
        if (hdata.days[i]) {
          document.getElementById('chk_day' + i).checked = !!hdata.days[i].checked;
          document.getElementById('hrs_day' + i).value = hdata.days[i].hrs || '';
        }
      }
    }
  } catch (e) {
    /* ignore */
  }
})();

// ---- BOOTSTRAP ----
loadFromStorage();
if (clinics.length === 0) {
  clinics = [newClinicObj('מרפאה 1')];
}
renderClinics();
maybeLockShared();
calc();
