function v(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}
function set(id, val, unit) {
  const el = document.getElementById(id);
  if (el) el.textContent = val + (unit ? ' ' + unit : '');
}

// ---- TOOLTIP DATA ----
// All tooltip content lives here in JS — safe from HTML corruption during file transfer
const TIPS = {
  tarif: 'תעריף הסכם קבוע: 40.49 ₪ לשעה לטיפול. לא ניתן לשינוי.',
  takara:
    'התקרה המוצגת היא למשרה מלאה (100%):\n• עובדת רגילה: ₪5,400\n• ותיקה: ₪5,838.25\n\nהתקרה בפועל שלך מחושבת לפי אחוז המשרה החודשי:\nתקרה בפועל = (שעות תקן ÷ שעות פוטנציאליות) × תקרה מלאה\n\nלדוגמה: שעות תקן 80 מתוך 160 פוטנציאליות = 50% משרה → תקרה של ₪2,700',
  makdam: 'בהתפתחות הילד ריפוי בעיסוק: כל תפוקה שווה ×2 טיפולים משוקללים. לא ניתן לשינוי.',
  shaPotential:
    'מקסימום שעות לחודש למשרה מלאה (100%):\n• יום רגיל (א-ה): 8 שעות\n• ערב חג: 4 שעות\n• חול המועד: 5 שעות\n• יום חג: 0 שעות\n• יום מקוצר (פורים/חנוכה/יום המשפחה): 8 שעות ✓\n\n⚠️ יום מקוצר — למרות הקיצור בפועל, נספר כיום עבודה מלא (8 שעות) לצורך חישוב שעות פוטנציאליות.\n\nמשמש לחישוב תקרת התשלום החודשית.',
  shaTeken:
    'חשבי לפי הימים שאת עובדת בשבוע וכמה פעמים כל יום מופיע בלוח השנה החודשי.\n\nלדוגמה: את עובדת א׳ (7 שעות), ד׳ (7 שעות), ה׳ (8 שעות)\nבחודש עם 5 ימי א׳, 5 ימי ד׳, 4 ימי ה׳:\n(7×5) + (7×5) + (8×4) = 102 שעות\n\n⚠️ שימי לב לימים מיוחדים לפי איזה יום שבוע הם נופלים:\n• ערב חג — 50% משעות היום הרגיל\n• חג — 0 שעות\n• חול המועד — 62.5% משעות היום הרגיל\n• יום בחירה — לא נכנס לתקן, מוכנס להיעדרות מזכה\n\n🔄 יום מקוצר (חנוכה/פורים וכד׳) — יתעדכן בהמשך',
  headrutMazaka:
    'היעדרויות המזכות בפרמיית העדרות:\n• חופש שנתי\n• יום בחירה\n• יום זיכרון – עובד שכול\n• השתלמות מתחת ל־3 ימים\n\nמופחתות משעות התקן בחישוב שעות העבודה, ומזכות בפרמיה נפרדת.\n\n⚠️ אם ההיעדרות חלה על יום מקוצר (ערב חג / חול המועד) — הכנס את השעות המקוצרות בפועל, לא את שעות היום המלא.',
  headrutLoMazaka:
    'היעדרויות שאינן מזכות בפרמיית העדרות:\n• מחלת עובד\n• מחלת ילד\n• הצהרה\n• מחלת בן משפחה מכל סוג\n• עקב הריון, טיפולי פריה\n• תאונת עבודה\n• נישואים – של העובד או בן/בת\n• יום לידה בן/בת\n• ברית מילה\n• ימי אבל\n• השתלמות מעל 3 ימים\n• שביתה\n• ביקור אצל רופא תעסוקתי\n\nמופחתות משעות התקן בחישוב שעות העבודה.\n\n⚠️ אם ההיעדרות חלה על יום מקוצר (ערב חג / חול המועד) — הכנס את השעות המקוצרות בפועל, לא את שעות היום המלא.',
  shaAvoda:
    'שעות עבודה = שעות תקן − היעדרות מזכה − מחלה − שלט + שעות עודפות\n\nשעות אלו הן המכנה לחישוב ממוצע הטיפולים.\nשלט ושעות עודפות מוזנות בסעיף תפוקות.',
  shaLaTipulit:
    'שעות לא טיפוליות, המאושרות על ידי מנהלת המכון/ נילי/ מרב.\n\n⚠️ שלט מופחת משעות העבודה ולא נכנס למכנה — פחות שלט = ממוצע גבוה יותר = פרמיה גבוהה יותר.',
  shaNosfot:
    'שעות עודפות מעבר לשעות התקן שלך, שמופיעות בדף הפרמיות.\nלרוב מדובר בדקות בודדות — לא משהו שמתכננים, פשוט מעתיקים מהדף.\n\nנכנסות למכנה ולסך שעות לתשלום.',
  tifukot:
    'קודי תפוקה ב-Clicks:\n• 50011 - טיפול\n• 50008 - אבחון\n• 50016 - ישיבה\n• 50038 - דוח\n• 50042 - ישיבה עם גננת\n\nכל קוד = תפוקה אחת.',
  avgShnati:
    'ממוצע הטיפולים לתשלום של 12 החודשים הקודמים.\nמשמש לחישוב פרמיית ההעדרות.\nהכנס ידנית מהתלוש החודשי.',
  shalet:
    'כשמעבירים שעות עבודה לשלט:\n• המכנה קטן ← ממוצע עולה\n• סך שעות לתשלום לא משתנה\n• התקרה לא משתנה\n\nלכן הפרמיה עולה בלי לשנות את התקרה!\n\nמגבלה: שלט ≤ שעות עבודה (כלל 50%)',
};

// Build tooltip popup element once, reuse it
const tipPopup = document.createElement('div');
Object.assign(tipPopup.style, {
  position: 'fixed',
  zIndex: '9999',
  width: '240px',
  display: 'none',
  background: '#1e293b',
  color: '#e2e8f0',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '12px',
  lineHeight: '1.7',
  whiteSpace: 'pre-line',
  textAlign: 'right',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
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
  // Show offscreen first to measure height
  tipPopup.style.visibility = 'hidden';
  tipPopup.style.display = 'block';
  const popupWidth = 240;
  const popupHeight = tipPopup.offsetHeight;
  const rect = btn.getBoundingClientRect();
  // Horizontal: align right edge of popup with right edge of button, clamp to viewport
  let left = rect.right - popupWidth;
  if (left < 8) left = 8;
  if (left + popupWidth > window.innerWidth - 8) left = window.innerWidth - popupWidth - 8;
  // Vertical: above button, flip below if not enough space
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

// Wire up all tip buttons via hover (event delegation)
document.addEventListener('mouseover', function (e) {
  const btn = e.target.closest('[data-tip]');
  if (btn) showTip(btn);
});
document.addEventListener('mouseout', function (e) {
  const btn = e.target.closest('[data-tip]');
  if (btn) hideTip();
});

// Touch support for mobile
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

// Detect if running in a limited viewer (no proper window.location, sandboxed webview, etc.)
(function () {
  try {
    // HTML viewer apps often have no real navigation or are file:// with restrictions
    // A simple heuristic: if localStorage throws or UA looks like a webview
    const ua = navigator.userAgent || '';
    const isWebView = /; wv\)/.test(ua); // Android WebView flag
    if (isWebView) {
      document.getElementById('wrong-app-banner').style.display = 'block';
    }
  } catch (e) {
    document.getElementById('wrong-app-banner').style.display = 'block';
  }
})();

// ---- UNDO SYSTEM ----
const UNDO_FIELDS = [
  'shaPotential',
  'shaTeken',
  'shaNosfot',
  'shaLaTipulit',
  'headrutMazaka',
  'headrutLoMazaka',
  'tifukot',
  'avgShnati',
];
let undoStack = [];
const MAX_UNDO = 20;

function saveUndoSnapshot() {
  const snapshot = {};
  UNDO_FIELDS.forEach((id) => {
    snapshot[id] = document.getElementById(id).value;
  });
  snapshot.isVetek = document.getElementById('takara').value == 5838.25 ? '1' : '0';
  // Only save if different from last snapshot
  if (undoStack.length > 0) {
    const last = undoStack[undoStack.length - 1];
    const same =
      UNDO_FIELDS.every((id) => last[id] === snapshot[id]) && last.isVetek === snapshot.isVetek;
    if (same) return;
  }
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoBtn();
}

function undoFields() {
  if (undoStack.length === 0) return;
  const snapshot = undoStack.pop();
  UNDO_FIELDS.forEach((id) => {
    document.getElementById(id).value = snapshot[id] || '';
  });
  if (snapshot.isVetek === '1') setVetek(true);
  else setVetek(false);
  updateUndoBtn();
  calc();
}

function updateUndoBtn() {
  const btn = document.getElementById('undoBtn');
  btn.style.opacity = undoStack.length > 0 ? '1' : '0.4';
  btn.style.cursor = undoStack.length > 0 ? 'pointer' : 'default';
}

// ---- MONTH SELECTOR ----
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
  // Show current month +/- 2 months
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

// Wire up undo snapshots on input focus (captures "before" state)
UNDO_FIELDS.forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('focus', saveUndoSnapshot);
});

// ---- LOCAL STORAGE: auto-save & restore ----
const SAVE_FIELDS = [
  'shaPotential',
  'shaTeken',
  'shaNosfot',
  'shaLaTipulit',
  'headrutMazaka',
  'headrutLoMazaka',
  'tifukot',
  'avgShnati',
  'takara',
];

function saveToStorage() {
  try {
    const data = {};
    SAVE_FIELDS.forEach((id) => {
      data[id] = document.getElementById(id).value;
    });
    data.isVetek = document.getElementById('takara').value == 5838.25 ? '1' : '0';
    data.selectedMonth = document.getElementById('selectedMonth').value;
    localStorage.setItem('premiot_data', JSON.stringify(data));
  } catch (e) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('premiot_data');
    if (!raw) return;
    const data = JSON.parse(raw);
    SAVE_FIELDS.forEach((id) => {
      if (data[id] !== undefined && data[id] !== '') {
        document.getElementById(id).value = data[id];
      }
    });
    // Restore vetek button state
    if (data.isVetek === '1') setVetek(true);
    // Restore selected month
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
  } catch (e) {}
}

function calc() {
  const tarif = v('tarif');
  const takara = v('takara');
  const makdam = v('makdam');
  const shaPotential = v('shaPotential');
  const shaLaTipulit = v('shaLaTipulit');
  const shaTeken = v('shaTeken');
  const headrutMazaka = v('headrutMazaka');
  const headrutLoMazaka_val = v('headrutLoMazaka');
  const shaNosfot = v('shaNosfot');
  const shaAvoda = Math.max(
    0,
    shaTeken - headrutMazaka - headrutLoMazaka_val - shaLaTipulit + shaNosfot,
  );
  // Update hidden field and display
  document.getElementById('shaAvoda').value = shaAvoda;
  document.getElementById('shaAvoda_display').textContent = shaAvoda.toFixed(2);
  const tifukot = v('tifukot');
  const avgShnati = v('avgShnati');

  // Core calcs
  const tipulimMushkalim = tifukot * makdam;
  const mecane = shaAvoda;
  const rawAvg = mecane > 0 ? tipulimMushkalim / mecane : 0;
  const avgTipulim = Math.min(Math.max(rawAvg - 1, 0), 1);
  const totalHoursLeTashlum = Math.max(
    0,
    shaTeken - headrutMazaka - headrutLoMazaka_val + shaNosfot,
  );

  // Threshold check: coded hours / total clocked hours >= 50%
  // Threshold: coded hours / actual hours present (excluding absences entirely)
  const actualHoursPresent = shaAvoda + shaLaTipulit; // עבודה + שלט (both = hours you were there)
  const codedPct = actualHoursPresent > 0 ? shaAvoda / actualHoursPresent : 0;
  const belowThreshold = codedPct < 0.5;

  // אחוז משרה בפועל
  const mishraHours = Math.max(0, shaTeken - headrutLoMazaka_val + shaNosfot);
  const mishraPct = shaPotential > 0 ? mishraHours / shaPotential : 0;
  const takaraHodesh = mishraPct * takara;

  // Gate: nothing pays if monthly avg <= 0 (rawAvg must exceed 1) OR below 50% threshold
  const belowAvgGate = avgTipulim <= 0;
  const noPayment = belowThreshold || belowAvgGate;

  // פרמיית עבודה
  const premiatAvodaBefore = noPayment ? 0 : totalHoursLeTashlum * avgTipulim * tarif;
  const premiatAvoda = Math.min(premiatAvodaBefore, takaraHodesh);

  // פרמיית העדרות
  const premiatHeadrutBefore = noPayment ? 0 : headrutMazaka * avgShnati * tarif;
  const remainingCap = Math.max(0, takaraHodesh - premiatAvoda);
  const premiatHeadrut = Math.min(premiatHeadrutBefore, remainingCap);

  const total = premiatAvoda + premiatHeadrut;

  // To reach avg = 1 after subtracting 1, need raw avg = 2, so tipulim = mecane * 2
  const tifukotNeeded = mecane > 0 ? Math.ceil((mecane * 2) / makdam) : 0;
  const shortfall = Math.max(0, tifukotNeeded - tifukot);

  // Update UI
  set('r_tipulim', tipulimMushkalim.toFixed(0), 'טיפולים');
  set('r_mecane', mecane.toFixed(2), 'שעות');
  set('r_avg', avgTipulim.toFixed(3), avgTipulim >= 1 ? '(מקסימום ✓)' : '');
  set('r_totalHours', totalHoursLeTashlum.toFixed(2), 'שעות');
  set('r_mishra', (mishraPct * 100).toFixed(1), '%');
  set('r_takara', '₪' + takaraHodesh.toFixed(2));
  set('r_avoda', '₪' + premiatAvoda.toFixed(2));
  set('r_headrut', '₪' + premiatHeadrut.toFixed(2));
  // Show "before cap" only when cap reduced the amount
  const avodaCapped = premiatAvodaBefore.toFixed(2) !== premiatAvoda.toFixed(2);
  document.getElementById('row_avoda_before').style.display = avodaCapped ? '' : 'none';
  if (avodaCapped) set('r_avoda_before', '₪' + premiatAvodaBefore.toFixed(2));
  const headrutCapped = premiatHeadrutBefore.toFixed(2) !== premiatHeadrut.toFixed(2);
  document.getElementById('row_headrut_before').style.display = headrutCapped ? '' : 'none';
  if (headrutCapped) set('r_headrut_before', '₪' + premiatHeadrutBefore.toFixed(2));
  document.getElementById('r_total').textContent = '₪' + total.toFixed(2);
  document.getElementById('r_total_sub').textContent =
    'סמל 1783: ₪' + premiatAvoda.toFixed(2) + ' | סמל 1785: ₪' + premiatHeadrut.toFixed(2);

  // Update sticky result
  document.getElementById('r_total_sticky').textContent = '₪' + total.toFixed(2);
  const stickyPctVal = takaraHodesh > 0 ? Math.min((total / takaraHodesh) * 100, 100) : 0;
  const stickyColor =
    stickyPctVal >= 100
      ? '#22c55e'
      : stickyPctVal >= 75
        ? '#3b82f6'
        : stickyPctVal >= 40
          ? '#fbbf24'
          : '#ef4444';
  document.getElementById('stickyProgressBar').style.width = stickyPctVal + '%';
  document.getElementById('stickyProgressBar').style.background = stickyColor;
  document.getElementById('r_total_sticky').style.color = stickyColor;
  document.getElementById('stickyPct').textContent = stickyPctVal.toFixed(0) + '%';
  document.getElementById('stickyTakara').textContent = 'תקרה: ₪' + takaraHodesh.toFixed(0);
  // Update sticky ממוצע
  const avgStickyEl = document.getElementById('r_avg_sticky');
  avgStickyEl.textContent = avgTipulim.toFixed(3);

  // ---- PROGRESS TOWARD תקרה ----
  const gapToTakara = takaraHodesh - total;
  const progressPct = takaraHodesh > 0 ? Math.min((total / takaraHodesh) * 100, 100) : 0;
  const atOrOverCap = total >= takaraHodesh - 0.5;

  const progressColor =
    progressPct >= 100
      ? '#22c55e'
      : progressPct >= 75
        ? '#3b82f6'
        : progressPct >= 40
          ? '#fbbf24'
          : '#ef4444';

  document.getElementById('takaraProgress').innerHTML = `
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-size:12px; color:#94a3b8;">התקדמות לתקרה</span>
        <span style="font-size:12px; font-weight:700; color:${progressColor};">${progressPct.toFixed(1)}%</span>
      </div>
      <div style="background:rgba(255,255,255,0.07); border-radius:99px; height:10px; overflow:hidden;">
        <div style="width:${progressPct}%; height:100%; background:${progressColor}; border-radius:99px; transition:width 0.4s;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:7px;">
        <span style="font-size:11px; color:#64748b;">פרמיה: ₪${total.toFixed(2)}</span>
        <span style="font-size:11px; color:#64748b;">תקרה: ₪${takaraHodesh.toFixed(2)}</span>
      </div>
      ${atOrOverCap ? '' : `<div style="margin-top:6px; font-size:12px; color:#fbbf24; text-align:center;">חסר: ₪${gapToTakara.toFixed(2)}</div>`}
    </div>`;

  // ---- THRESHOLD + SUGGESTIONS ----
  const alertArea = document.getElementById('alertArea');
  const suggestArea = document.getElementById('suggestArea');

  if (belowThreshold) {
    alertArea.innerHTML = `<div class="alert danger">
      <div class="atitle">⚠️ סף תפוקתי לא הושג</div>
      <div class="abody">שעות תפוקתיות: ${(codedPct * 100).toFixed(1)}% משעות הנוכחות בפועל<br>נדרש לפחות 50% משעות הנוכחות (לא כולל היעדרויות) עם קוד ב-Clicks לקבלת פרמיה.</div>
    </div>`;
    suggestArea.innerHTML = '';
  } else if (belowAvgGate) {
    alertArea.innerHTML = `<div class="alert danger">
      <div class="atitle">⚠️ שעות עבודה לא מספיק תפוקתיות</div>
      <div class="abody">לפחות מחצית משעות העבודה שלך צריכות להיות תפוקתיות כדי לקבל פרמיה כלשהי — כולל פרמיית העדרות.</div>
    </div>`;
    suggestArea.innerHTML = '';
  } else if (atOrOverCap) {
    alertArea.innerHTML = `<div class="alert success">
      <div class="atitle">🎉 הגעת לתקרה!</div>
      <div class="abody">פרמיה מקסימלית לחודש זה הושגה.</div>
    </div>`;
    suggestArea.innerHTML = '';
  } else {
    // Build suggestions
    let suggestions = '';

    // Option A: more תפוקות (only if avg < 1)
    if (avgTipulim < 1) {
      // How many more תפוקות needed to close the gap?
      // gap = takaraHodesh - total = takaraHodesh - (totalHoursLeTashlum * avgTipulim * tarif) - premiatHeadrut
      // We need: totalHoursLeTashlum * newAvg * tarif + premiatHeadrut >= takaraHodesh
      // newAvg = (takaraHodesh - premiatHeadrut) / (totalHoursLeTashlum * tarif)
      const neededAvg =
        totalHoursLeTashlum > 0 && tarif > 0
          ? (takaraHodesh - premiatHeadrutBefore) / (totalHoursLeTashlum * tarif)
          : 0;
      const cappedNeededAvg = Math.min(neededAvg, 1);
      // rawAvg needed = neededAvg + 1
      const neededRawAvg = cappedNeededAvg + 1;
      const neededTipulim = Math.ceil(neededRawAvg * mecane);
      const extraTifukot = Math.max(0, Math.ceil((neededTipulim - tipulimMushkalim) / makdam));

      if (extraTifukot > 0) {
        suggestions += `<div class="alert warning" style="margin-bottom:8px;">
          <div class="atitle">📋 אפשרות א׳: עוד תפוקות</div>
          <div class="abody">הוסיפי <strong>${extraTifukot} תפוקות</strong> נוספות ב-Clicks כדי לסגור פער של ₪${gapToTakara.toFixed(2)}<br>
          <span style="font-size:11px; opacity:0.8;">כרגע: ${tifukot} תפוקות | נדרש: ${tifukot + extraTifukot}</span></div>
        </div>`;
      }
    }

    // --- OPTION B: convert עבודה hours to שלט ---
    // Moving hours from עבודה to שלט:
    // - מכנה shrinks → ממוצע rises (same תפוקות, fewer denominator hours)
    // - סך שעות לתשלום stays SAME (total clocked hours unchanged)
    // - Ceiling stays SAME (total clocked hours unchanged)
    // Constraint: שלט ≤ שעות עבודה (50% rule)
    const availableShalet = Math.max(0, shaAvoda); // shaAvoda already excludes שלט

    if (availableShalet > 0.1 && avgTipulim < 1) {
      // Find how much שלט needed to hit תקרה via numerical search
      const targetPremium = Math.max(0, takaraHodesh - premiatHeadrutBefore);
      let shaletNeeded = null;
      for (let x = 0.5; x <= availableShalet + 0.5; x += 0.5) {
        const newMecane = Math.max(mecane - x, 0.01);
        const newAvg = Math.min(Math.max(tipulimMushkalim / newMecane - 1, 0), 1);
        const newPremium = totalHoursLeTashlum * newAvg * tarif;
        if (newPremium >= targetPremium) {
          shaletNeeded = x;
          break;
        }
      }

      if (shaletNeeded !== null) {
        suggestions += `<div class="alert warning">
          <div class="atitle">🕐 אפשרות ב׳: העבר שעות לשלט
            <button class="tip-btn" data-tip="shalet" style="font-size:9px; width:15px; height:15px; margin-right:6px;">?</button>
          </div>
          <div class="abody">העבירי <strong>${shaletNeeded.toFixed(1)} שעות</strong> משעות עבודה לשלט<br>
          <span style="font-size:11px; opacity:0.8;">שלט: ${shaLaTipulit} → ${(shaLaTipulit + shaletNeeded).toFixed(1)} | מקסימום אפשרי: ${shaAvoda.toFixed(1)}</span></div>
        </div>`;
      } else {
        suggestions += `<div class="alert warning">
          <div class="atitle">🕐 אפשרות ב׳: העבר שעות לשלט
            <button class="tip-btn" data-tip="shalet" style="font-size:9px; width:15px; height:15px; margin-right:6px;">?</button>
          </div>
          <div class="abody">העבירי את כל <strong>${availableShalet.toFixed(1)} שעות</strong> הזמינות לשלט — יקרב לתקרה אך לא יספיק לבד<br>
          <span style="font-size:11px; opacity:0.8;">שלט: ${shaLaTipulit} → ${(shaLaTipulit + availableShalet).toFixed(1)} | מקסימום: ${shaAvoda.toFixed(1)}</span></div>
        </div>`;
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
      `<div style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">💡 הצעות להגדלת הפרמיה</div>` +
      suggestions;
  }

  // Auto-save inputs to localStorage
  saveToStorage();
}

function setVetek(isVetek) {
  document.getElementById('takara').value = isVetek ? 5838.25 : 5400;
  document.getElementById('btn-regular').style.background = isVetek
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(37,99,235,0.8)';
  document.getElementById('btn-regular').style.border = isVetek
    ? '2px solid rgba(255,255,255,0.1)'
    : '2px solid #3b82f6';
  document.getElementById('btn-regular').style.color = isVetek ? '#94a3b8' : '#fff';
  document.getElementById('btn-vetek').style.background = isVetek
    ? 'rgba(37,99,235,0.8)'
    : 'rgba(255,255,255,0.05)';
  document.getElementById('btn-vetek').style.border = isVetek
    ? '2px solid #3b82f6'
    : '2px solid rgba(255,255,255,0.1)';
  document.getElementById('btn-vetek').style.color = isVetek ? '#fff' : '#94a3b8';
  calc();
}

function resetFields() {
  saveUndoSnapshot();
  [
    'shaPotential',
    'shaTeken',
    'shaNosfot',
    'shaLaTipulit',
    'headrutMazaka',
    'headrutLoMazaka',
    'tifukot',
    'avgShnati',
  ].forEach((id) => {
    document.getElementById(id).value = '';
  });
  try {
    localStorage.removeItem('premiot_data');
  } catch (e) {}
  calc();
}

function getSummaryData() {
  const val = (id) => document.getElementById(id)?.value || '0';
  const get = (id) => document.getElementById(id)?.textContent?.trim() || '—';
  const isVetek = parseFloat(val('takara')) === 5838.25;
  const selectedMonth = document.getElementById('selectedMonth')?.value || '';
  return {
    month: selectedMonth,
    isVetek,
    shaPotential: val('shaPotential'),
    shaTeken: val('shaTeken'),
    shaLaTipulit: val('shaLaTipulit') || '0',
    shaNosfot: val('shaNosfot') || '0',
    shaAvoda: get('shaAvoda_display'),
    headrutMazaka: val('headrutMazaka') || '0',
    headrutLoMazaka: val('headrutLoMazaka') || '0',
    tifukot: val('tifukot') || '0',
    avgShnati: val('avgShnati') || '0',
    r_mishra: get('r_mishra'),
    r_takara: get('r_takara'),
    r_avg: get('r_avg'),
    r_tipulim: get('r_tipulim'),
    r_totalHours: get('r_totalHours'),
    r_avoda_before: get('r_avoda_before'),
    r_avoda: get('r_avoda'),
    r_headrut_before: get('r_headrut_before'),
    r_headrut: get('r_headrut'),
    r_total: document.getElementById('r_total')?.textContent?.trim() || '—',
  };
}

function downloadPDF() {
  const d = getSummaryData();
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
  .sub { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { background: #1e3a5f; color: white; padding: 6px 10px; font-size: 12px; text-align: right; }
  td { padding: 5px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; }
  tr:nth-child(even) td { background: #f8fafc; }
  .accent td { background: #dbeafe !important; font-weight: 700; }
  .total td { background: #1e3a5f !important; color: white; font-size: 15px; font-weight: 800; padding: 10px; }
  .warning { font-size: 10px; color: #94a3b8; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
<h1>מחשבון פרמיות — ${d.month}</h1>
<div class="sub">כללית | ריפוי בעיסוק | התפתחות הילד | ירושלים | סוג עובדת: ${d.isVetek ? 'ותיקה' : 'רגילה'}</div>
<table>
  <tr><th colspan="2">שעות עבודה</th></tr>
  <tr><td>שעות פוטנציאליות</td><td>${d.shaPotential}</td></tr>
  <tr><td>שעות תקן</td><td>${d.shaTeken}</td></tr>
  <tr><td>שעות שלט</td><td>${d.shaLaTipulit}</td></tr>
  <tr><td>שעות עודפות</td><td>${d.shaNosfot}</td></tr>
  <tr class="accent"><td>שעות עבודה (מחושב)</td><td>${d.shaAvoda}</td></tr>
</table>
<table>
  <tr><th colspan="2">היעדרויות</th></tr>
  <tr><td>היעדרות מזכה</td><td>${d.headrutMazaka} שעות</td></tr>
  <tr><td>היעדרות לא מזכה (מחלה)</td><td>${d.headrutLoMazaka} שעות</td></tr>
</table>
<table>
  <tr><th colspan="2">תפוקות</th></tr>
  <tr><td>כמות תפוקות</td><td>${d.tifukot}</td></tr>
  <tr><td>ממוצע שנתי (12 חודשים)</td><td>${d.avgShnati}</td></tr>
  <tr><td>טיפולים משוקללים</td><td>${d.r_tipulim}</td></tr>
  <tr class="accent"><td>ממוצע טיפולים לתשלום</td><td>${d.r_avg}</td></tr>
  <tr><td>סך שעות לתשלום</td><td>${d.r_totalHours}</td></tr>
</table>
<table>
  <tr><th colspan="2">משרה ותקרה</th></tr>
  <tr><td>אחוז משרה בפועל</td><td>${d.r_mishra}</td></tr>
  <tr class="accent"><td>תקרת תשלום חודשית</td><td>${d.r_takara}</td></tr>
</table>
<table>
  <tr><th colspan="2">פרמיות</th></tr>
  <tr><td>פרמיית עבודה לפני תקרה</td><td>${d.r_avoda_before}</td></tr>
  <tr class="accent"><td>פרמיית עבודה — סמל 1783</td><td>${d.r_avoda}</td></tr>
  <tr><td>פרמיית העדרות לפני תקרה</td><td>${d.r_headrut_before}</td></tr>
  <tr class="accent"><td>פרמיית העדרות — סמל 1785</td><td>${d.r_headrut}</td></tr>
  <tr class="total"><td>סך פרמיה</td><td>${d.r_total}</td></tr>
</table>
<div class="warning">כלי עזר בלבד — נבנה על ידי אליסון אלט. עשוי להיות מכוייל עד ~30 ש״ח מהתלוש הרשמי.</div>
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
    ['כללית | ריפוי בעיסוק | התפתחות הילד | ירושלים', ''],
    ['סוג עובדת', d.isVetek ? 'ותיקה' : 'רגילה'],
    ['', ''],
    ['שעות עבודה', ''],
    ['שעות פוטנציאליות', d.shaPotential],
    ['שעות תקן', d.shaTeken],
    ['שעות שלט', d.shaLaTipulit],
    ['שעות עודפות', d.shaNosfot],
    ['שעות עבודה (מחושב)', d.shaAvoda],
    ['', ''],
    ['היעדרויות', ''],
    ['היעדרות מזכה (שעות)', d.headrutMazaka],
    ['היעדרות לא מזכה - מחלה (שעות)', d.headrutLoMazaka],
    ['', ''],
    ['תפוקות', ''],
    ['כמות תפוקות', d.tifukot],
    ['ממוצע שנתי (12 חודשים)', d.avgShnati],
    ['טיפולים משוקללים', d.r_tipulim],
    ['ממוצע טיפולים לתשלום', d.r_avg],
    ['סך שעות לתשלום', d.r_totalHours],
    ['', ''],
    ['משרה ותקרה', ''],
    ['אחוז משרה בפועל', d.r_mishra],
    ['תקרת תשלום חודשית', d.r_takara],
    ['', ''],
    ['פרמיות', ''],
    ['פרמיית עבודה לפני תקרה', d.r_avoda_before],
    ['פרמיית עבודה סמל 1783', d.r_avoda],
    ['פרמיית העדרות לפני תקרה', d.r_headrut_before],
    ['פרמיית העדרות סמל 1785', d.r_headrut],
    ['סך פרמיה', d.r_total],
    ['', ''],
    ['הערה', 'כלי עזר בלבד — עשוי להיות מכוייל עד ~₪30 מהתלוש הרשמי'],
  ];
  const csv =
    '\uFEFF' +
    rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'פרמיה_' + d.month.replace(' ', '_') + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- COLLAPSIBLE SECTIONS ----
function toggleSection(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById('arrow_' + id);
  if (el.style.display === 'none') {
    el.style.display = '';
    arrow.style.transform = 'rotate(180deg)';
  } else {
    el.style.display = 'none';
    arrow.style.transform = '';
  }
}

// ---- TAB SWITCHING ----
function switchTab(tab) {
  document.getElementById('panel-calc').style.display = tab === 'calc' ? '' : 'none';
  document.getElementById('panel-hours').style.display = tab === 'hours' ? '' : 'none';
  document.getElementById('tab-calc').style.background =
    tab === 'calc' ? 'rgba(37,99,235,0.7)' : 'transparent';
  document.getElementById('tab-calc').style.color = tab === 'calc' ? '#fff' : '#64748b';
  document.getElementById('tab-hours').style.background =
    tab === 'hours' ? 'rgba(37,99,235,0.7)' : 'transparent';
  document.getElementById('tab-hours').style.color = tab === 'hours' ? '#fff' : '#64748b';
  if (tab === 'hours') calcHours();
}

// ---- ISRAELI HOLIDAY CALENDAR 2026-2027 ----
// Types: 'chag' (no work), 'erev' (4hr/half), 'cholhamoed' (5hr/62.5%), 'yomAtzmaut' (no work), 'mekutzar' (full 8hr for potential)
// In Israel: 1 day yom tov (not 2 like diaspora)
const HOLIDAYS = {
  // === 2026 ===
  // Purim — Mar 3 (Tue) — yom mekutzar (counts as 8hr for potential)
  '2026-03-03': { type: 'mekutzar', name: 'פורים' },
  // Pesach
  '2026-04-01': { type: 'erev', name: 'ערב פסח' },
  '2026-04-02': { type: 'chag', name: 'פסח א׳' },
  '2026-04-03': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-04': { type: 'cholhamoed', name: 'חול המועד פסח (שבת)' },
  '2026-04-05': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-06': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2026-04-07': { type: 'cholhamoed', name: 'חול המועד פסח (ערב שביעי של פסח)' },
  '2026-04-08': { type: 'chag', name: 'שביעי של פסח' },
  // Yom HaShoah — Apr 14 (Tue) — not a day off at Clalit
  // Yom HaZikaron — Apr 21 (Tue) — half day at Clalit
  '2026-04-21': { type: 'erev', name: 'יום הזיכרון' },
  // Yom HaAtzmaut — Apr 22 (Wed)
  '2026-04-22': { type: 'yomAtzmaut', name: 'יום העצמאות' },
  // Shavuot
  '2026-05-21': { type: 'erev', name: 'ערב שבועות' },
  '2026-05-22': { type: 'chag', name: 'שבועות' },
  // Rosh Hashana
  '2026-09-11': { type: 'erev', name: 'ערב ראש השנה' },
  '2026-09-12': { type: 'chag', name: 'ראש השנה א׳' },
  '2026-09-13': { type: 'chag', name: 'ראש השנה ב׳' },
  // Yom Kippur
  '2026-09-20': { type: 'erev', name: 'ערב יום כיפור' },
  '2026-09-21': { type: 'chag', name: 'יום כיפור' },
  // Sukkot
  '2026-09-25': { type: 'erev', name: 'ערב סוכות' },
  '2026-09-26': { type: 'chag', name: 'סוכות א׳' },
  '2026-09-27': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-28': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-29': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-09-30': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-10-01': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2026-10-02': { type: 'cholhamoed', name: 'הושענא רבה (חול המועד סוכות)' },
  '2026-10-03': { type: 'chag', name: 'שמיני עצרת / שמחת תורה' },
  // Chanukah — Dec 5-12 — yom mekutzar (full 8hr for potential)
  '2026-12-05': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-06': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-07': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-08': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-09': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-10': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-11': { type: 'mekutzar', name: 'חנוכה' },
  '2026-12-12': { type: 'mekutzar', name: 'חנוכה' },

  // === 2027 ===
  // Purim — Mar 23 (Tue)
  '2027-03-23': { type: 'mekutzar', name: 'פורים' },
  // Pesach
  '2027-04-21': { type: 'erev', name: 'ערב פסח' },
  '2027-04-22': { type: 'chag', name: 'פסח א׳' },
  '2027-04-23': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-24': { type: 'cholhamoed', name: 'חול המועד פסח (שבת)' },
  '2027-04-25': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-26': { type: 'cholhamoed', name: 'חול המועד פסח' },
  '2027-04-27': { type: 'cholhamoed', name: 'חול המועד פסח (ערב שביעי של פסח)' },
  '2027-04-28': { type: 'chag', name: 'שביעי של פסח' },
  // Yom HaZikaron — May 11 (Tue) — half day at Clalit
  '2027-05-11': { type: 'erev', name: 'יום הזיכרון' },
  // Yom HaAtzmaut — May 12 (Wed)
  '2027-05-12': { type: 'yomAtzmaut', name: 'יום העצמאות' },
  // Shavuot
  '2027-06-10': { type: 'erev', name: 'ערב שבועות' },
  '2027-06-11': { type: 'chag', name: 'שבועות' },
  // Rosh Hashana
  '2027-10-01': { type: 'erev', name: 'ערב ראש השנה' },
  '2027-10-02': { type: 'chag', name: 'ראש השנה א׳' },
  '2027-10-03': { type: 'chag', name: 'ראש השנה ב׳' },
  // Yom Kippur
  '2027-10-10': { type: 'erev', name: 'ערב יום כיפור' },
  '2027-10-11': { type: 'chag', name: 'יום כיפור' },
  // Sukkot
  '2027-10-15': { type: 'erev', name: 'ערב סוכות' },
  '2027-10-16': { type: 'chag', name: 'סוכות א׳' },
  '2027-10-17': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-18': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-19': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-20': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-21': { type: 'cholhamoed', name: 'חול המועד סוכות' },
  '2027-10-22': { type: 'cholhamoed', name: 'הושענא רבה (חול המועד סוכות)' },
  '2027-10-23': { type: 'chag', name: 'שמיני עצרת / שמחת תורה' },
  // Chanukah — Dec 25 - Jan 1
  '2027-12-25': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-26': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-27': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-28': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-29': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-30': { type: 'mekutzar', name: 'חנוכה' },
  '2027-12-31': { type: 'mekutzar', name: 'חנוכה' },
};

const DAY_NAMES_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const FULL_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

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

// Build day input checkboxes (Sun=0 through Thu=4)
(function () {
  const container = document.getElementById('dayInputs');
  const days = [
    { idx: 0, name: 'א׳ (ראשון)', id: 'day0' },
    { idx: 1, name: 'ב׳ (שני)', id: 'day1' },
    { idx: 2, name: 'ג׳ (שלישי)', id: 'day2' },
    { idx: 3, name: 'ד׳ (רביעי)', id: 'day3' },
    { idx: 4, name: 'ה׳ (חמישי)', id: 'day4' },
  ];
  days.forEach((d) => {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <label style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="chk_${d.id}" onchange="calcHours()" style="width:18px; height:18px; accent-color:#3b82f6;">
        <span style="font-size:13px; color:#cbd5e1;">${d.name}</span>
      </label>
      <span class="unit">שעות</span>
      <input type="number" inputmode="decimal" id="hrs_${d.id}" value="" placeholder="0" step="0.5" oninput="calcHours()" style="
        width:70px; padding:5px 7px; border-radius:6px;
        border:1px solid rgba(255,255,255,0.12);
        background:rgba(255,255,255,0.08);
        color:#f1f5f9; font-size:14px; font-weight:600;
        text-align:center; outline:none; font-family:monospace;
      ">
    `;
    container.appendChild(row);
  });
})();

function calcHours() {
  const monthVal = document.getElementById('hoursMonth').value; // "2026-04"
  const [year, month] = monthVal.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Get user's work days and hours
  const workDays = {};
  for (let i = 0; i <= 4; i++) {
    const checked = document.getElementById('chk_day' + i).checked;
    const hrs = parseFloat(document.getElementById('hrs_day' + i).value) || 0;
    if (checked && hrs > 0) workDays[i] = hrs;
  }

  let potential = 0;
  let teken = 0;
  const breakdown = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const holiday = HOLIDAYS[dateStr];

    // Skip Friday (5) and Saturday (6) for potential
    if (dow === 5 || dow === 6) continue;

    // Potential hours (full time = 8hr base)
    let potentialDay = 8;
    let tekenMultiplier = 1;
    let dayLabel = DAY_NAMES_HE[dow] + ' ' + d + '/' + month;
    let dayNote = '';

    if (holiday) {
      if (holiday.type === 'chag' || holiday.type === 'yomAtzmaut') {
        potentialDay = 0;
        tekenMultiplier = 0;
        dayNote = holiday.name + ' — 0 שעות';
      } else if (holiday.type === 'erev') {
        potentialDay = 4;
        tekenMultiplier = 0.5; // 50% of regular hours
        dayNote = holiday.name + ' — 4 שעות (50%)';
      } else if (holiday.type === 'cholhamoed') {
        potentialDay = 5;
        tekenMultiplier = 0.625; // 62.5% of regular hours
        dayNote = holiday.name + ' — 5 שעות (62.5%)';
      } else if (holiday.type === 'mekutzar') {
        potentialDay = 8; // counts as full day
        tekenMultiplier = 1;
        dayNote = holiday.name + ' — 8 שעות (יום מקוצר = מלא)';
      }
    } else {
      dayNote = 'יום רגיל — 8 שעות';
    }

    potential += potentialDay;

    // Teken: only for user's work days
    if (dow in workDays) {
      const regularHours = workDays[dow];
      const tekenHours = regularHours * tekenMultiplier;
      teken += tekenHours;
      if (tekenMultiplier !== 1 && tekenMultiplier !== 0) {
        dayNote += ` | תקן: ${tekenHours.toFixed(2)}`;
      } else if (tekenMultiplier === 1) {
        dayNote += ` | תקן: ${regularHours}`;
      }
      breakdown.push(`<div style="color:#93c5fd;">${dayLabel} — ${dayNote} ✓</div>`);
    } else {
      breakdown.push(`<div>${dayLabel} — ${dayNote}</div>`);
    }
  }

  document.getElementById('hr_potential').textContent = potential + ' שעות';
  document.getElementById('hr_teken').textContent = teken.toFixed(2) + ' שעות';
  document.getElementById('dayBreakdown').innerHTML = breakdown.join('');

  // Save hours tab state
  try {
    const hdata = { month: monthVal, days: {} };
    for (let i = 0; i <= 4; i++) {
      hdata.days[i] = {
        checked: document.getElementById('chk_day' + i).checked,
        hrs: document.getElementById('hrs_day' + i).value,
      };
    }
    localStorage.setItem('premiot_hours', JSON.stringify(hdata));
  } catch (e) {}
}

function applyHoursToCalc() {
  const pot = document.getElementById('hr_potential').textContent.replace(/[^\d.]/g, '');
  const tek = document.getElementById('hr_teken').textContent.replace(/[^\d.]/g, '');
  document.getElementById('shaPotential').value = pot;
  document.getElementById('shaTeken').value = tek;
  // Sync the month selector on calc tab
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
  // Add option if not exists
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
  // Update month display label
  document.getElementById('selectedMonthDisplay').textContent = label;
  switchTab('calc');
  calc();
}

function syncMonthAndGoToHours() {
  switchTab('hours');
}

// Restore hours tab state from localStorage
(function () {
  try {
    const raw = localStorage.getItem('premiot_hours');
    if (!raw) return;
    const hdata = JSON.parse(raw);
    if (hdata.month) document.getElementById('hoursMonth').value = hdata.month;
    if (hdata.days) {
      for (let i = 0; i <= 4; i++) {
        if (hdata.days[i]) {
          document.getElementById('chk_day' + i).checked = !!hdata.days[i].checked;
          document.getElementById('hrs_day' + i).value = hdata.days[i].hrs || '';
        }
      }
    }
  } catch (e) {}
})();

loadFromStorage();
calc();
