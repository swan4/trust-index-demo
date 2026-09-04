/* ==========================================================================
   Trust Index — Main Application Logic & Interactive State Store
   ========================================================================== */

// --- 1. CRITERIA DEFINITIONS (10 Parameters) ---
const CRITERIA_MAP = [
  { id: 'honesty', name: 'Честность', abbr: 'HON', icon: 'check-circle' },
  { id: 'decency', name: 'Порядочность', abbr: 'DEC', icon: 'heart' },
  { id: 'responsibility', name: 'Ответственность', abbr: 'RES', icon: 'shield' },
  { id: 'promises', name: 'Выполнение обещаний', abbr: 'PRM', icon: 'award' },
  { id: 'financial', name: 'Фин. надежность', abbr: 'FIN', icon: 'dollar-sign' },
  { id: 'communication', name: 'Адекватность общения', abbr: 'COM', icon: 'message-square' },
  { id: 'punctuality', name: 'Пунктуальность', abbr: 'PUN', icon: 'clock' },
  { id: 'no_brag', name: 'Не «понторез» (скромность)', abbr: 'BRG', icon: 'smile' },
  { id: 'negotiability', name: 'Договороспособность', abbr: 'NEG', icon: 'user-check' },
  { id: 'repeat_intent', name: 'Повторная сделка («Стал бы еще работать?»)', abbr: 'REC', icon: 'repeat' }
];

// --- 2. MOCK PROFILES DATASET ---
const PROFILES = {
  alex: {
    id: 'alex',
    phone: '+7 (999) 456-78-90',
    ownerName: 'Александр В.',
    isVerifiedOwner: true,
    totalReviews: 42,
    ratings: {
      honesty: 9.2,
      decency: 9.0,
      responsibility: 8.8,
      promises: 8.9,
      financial: 9.5,
      communication: 8.6,
      punctuality: 8.4,
      no_brag: 7.9,
      negotiability: 8.7,
      repeat_intent: 9.1
    },
    tier: 'PLATINUM TRUSTED',
    tierClass: 'verified-badge',
    fraudFlagsCount: 0,
    hasMyRating: false
  },
  dmitry: {
    id: 'dmitry',
    phone: '+7 (916) 777-88-99',
    ownerName: 'Дмитрий (Риелтор)',
    isVerifiedOwner: false,
    totalReviews: 18,
    ratings: {
      honesty: 7.8,
      decency: 7.5,
      responsibility: 7.9,
      promises: 7.4,
      financial: 8.0,
      communication: 7.6,
      punctuality: 7.2,
      no_brag: 6.8,
      negotiability: 8.2,
      repeat_intent: 7.5
    },
    tier: 'RELIABLE PRO',
    tierClass: 'tier-badge',
    fraudFlagsCount: 0,
    hasMyRating: false
  },
  suspicious: {
    id: 'suspicious',
    phone: '+7 (903) 666-13-13',
    ownerName: 'Неизвестный',
    isVerifiedOwner: false,
    totalReviews: 12,
    ratings: {
      honesty: 3.2,
      decency: 3.5,
      responsibility: 2.9,
      promises: 3.1,
      financial: 3.8,
      communication: 4.0,
      punctuality: 3.0,
      no_brag: 2.1,
      negotiability: 4.2,
      repeat_intent: 3.0
    },
    tier: 'HIGH RISK / ПОДОЗРИТЕЛЬНЫЙ',
    tierClass: 'risk-badge',
    fraudFlagsCount: 4,
    hasMyRating: false
  },
  my_num: {
    id: 'my_num',
    phone: '+7 (900) 111-22-33',
    ownerName: 'Вы (Владелец)',
    isVerifiedOwner: false, // Can be verified via OTP in demo
    totalReviews: 27,
    ratings: {
      honesty: 9.4,
      decency: 9.1,
      responsibility: 9.0,
      promises: 9.3,
      financial: 9.2,
      communication: 9.5,
      punctuality: 8.9,
      no_brag: 8.8,
      negotiability: 9.0,
      repeat_intent: 9.6
    },
    tier: 'GOLD VERIFIED',
    tierClass: 'tier-badge',
    fraudFlagsCount: 0,
    hasMyRating: false
  },
  new_num: {
    id: 'new_num',
    phone: '+7 (999) 000-00-00',
    ownerName: 'Новый номер',
    isVerifiedOwner: false,
    totalReviews: 2, // Less than minimum threshold of 3!
    ratings: {
      honesty: 5.0,
      decency: 5.0,
      responsibility: 5.0,
      promises: 5.0,
      financial: 5.0,
      communication: 5.0,
      punctuality: 5.0,
      no_brag: 5.0,
      negotiability: 5.0,
      repeat_intent: 5.0
    },
    tier: 'PENDING REVIEWS',
    tierClass: 'tier-badge',
    fraudFlagsCount: 0,
    hasMyRating: false
  }
};

// --- 3. STATE & APP INIT ---
let currentProfileId = 'alex';
let isAdminMode = false;
let activeTab = 'search';

// Calculate Overall FIFA Trust Score (0 - 100)
function calculateTrustScore(profile) {
  const keys = Object.keys(profile.ratings);
  const avg = keys.reduce((sum, key) => sum + profile.ratings[key], 0) / keys.length;
  // Convert 0-10 scale to 0-100 FIFA Overall rating
  return Math.round(avg * 10);
}

// Global App Init
document.addEventListener('DOMContentLoaded', () => {
  renderSlidersInModal();
  renderCurrentView();
});

// Switch Presets via Chips
function selectPreset(profileId) {
  currentProfileId = profileId;
  const profile = PROFILES[profileId];
  if (profile) {
    document.getElementById('phone-search-input').value = profile.phone;
  }
  
  // Highlight active chip
  document.querySelectorAll('.preset-chip').forEach(chip => chip.classList.remove('active'));
  const activeChip = Array.from(document.querySelectorAll('.preset-chip')).find(chip => 
    chip.getAttribute('onclick')?.includes(`'${profileId}'`)
  );
  if (activeChip) activeChip.classList.add('active');

  renderCurrentView();
}

// Search Input Handler
function handlePhoneInput(val) {
  // Simple phone matching
  const match = Object.values(PROFILES).find(p => p.phone.includes(val) || val.replace(/\D/g, '') === p.phone.replace(/\D/g, ''));
  if (match) {
    currentProfileId = match.id;
    renderCurrentView();
  }
}

// --- 4. VIEW RENDERERS ---
function renderCurrentView() {
  const container = document.getElementById('app-main-content');
  if (isAdminMode) {
    renderAdminView(container);
    return;
  }

  const profile = PROFILES[currentProfileId];
  if (!profile) return;

  const trustScore = calculateTrustScore(profile);
  const isBelowThreshold = profile.totalReviews < 3;

  let html = '';

  // 1. FIFA PLAYER CARD HERO COMPONENT
  html += `
    <div class="fifa-card-container">
      <div class="fifa-card" id="hero-fifa-card">
        
        <div class="fifa-card-header">
          <div class="fifa-overall-score">
            <span class="overall-num">${isBelowThreshold ? '?' : trustScore}</span>
            <span class="overall-label">TRUST SCORE</span>
          </div>

          <div class="fifa-card-badge-box">
            <span class="tier-badge ${profile.tierClass}">
              ${profile.isVerifiedOwner ? '✓ ' : ''}${profile.tier}
            </span>
            <span class="reviews-count-badge">
              <i data-feather="users" style="width: 12px; height: 12px;"></i>
              ${profile.totalReviews} independent reviews
            </span>
          </div>
        </div>

        <div class="fifa-identity">
          <div class="fifa-phone-number">${profile.phone}</div>
          <div class="fifa-phone-label">
            ${profile.isVerifiedOwner ? `🔒 Подтвержденный номер (${profile.ownerName})` : 'Анонимный публичный профиль номера'}
          </div>
        </div>

        ${isBelowThreshold ? `
          <!-- Locked State when below 3 ratings -->
          <div style="text-align: center; padding: 20px 10px; background: rgba(0,0,0,0.4); border-radius: 16px; margin-bottom: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🔒</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--primary-gold);">Рейтинг скрыт до 3 оценок</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Система отображает рейтинг только при наличии минимум 3 независимых оценок.
            </div>
          </div>
        ` : `
          <!-- FIFA Core 6 Stat Attributes Grid -->
          <div class="fifa-stats-grid">
            <div class="stat-item">
              <span class="stat-val ${profile.ratings.honesty >= 8 ? 'high' : profile.ratings.honesty >= 5 ? 'med' : 'low'}">
                ${profile.ratings.honesty.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">HON</div>
                <div class="stat-name">Честность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${profile.ratings.responsibility >= 8 ? 'high' : profile.ratings.responsibility >= 5 ? 'med' : 'low'}">
                ${profile.ratings.responsibility.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">RES</div>
                <div class="stat-name">Ответственность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${profile.ratings.financial >= 8 ? 'high' : profile.ratings.financial >= 5 ? 'med' : 'low'}">
                ${profile.ratings.financial.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">FIN</div>
                <div class="stat-name">Фин. надежность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${profile.ratings.promises >= 8 ? 'high' : profile.ratings.promises >= 5 ? 'med' : 'low'}">
                ${profile.ratings.promises.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">PRM</div>
                <div class="stat-name">Обещания</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${profile.ratings.communication >= 8 ? 'high' : profile.ratings.communication >= 5 ? 'med' : 'low'}">
                ${profile.ratings.communication.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">COM</div>
                <div class="stat-name">Адекватность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${profile.ratings.repeat_intent >= 8 ? 'high' : profile.ratings.repeat_intent >= 5 ? 'med' : 'low'}">
                ${profile.ratings.repeat_intent.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">REC</div>
                <div class="stat-name">Снова сработаться</div>
              </div>
            </div>
          </div>
        `}

        <div class="fifa-card-footer">
          <span>Trust Index Protocol</span>
          <span>Verified Phone Signal</span>
        </div>

      </div>
    </div>
  `;

  // 2. BELOW THRESHOLD WARNING BOX (IF NEEDED)
  if (isBelowThreshold) {
    html += `
      <div class="threshold-box">
        <div class="threshold-title">
          <i data-feather="alert-circle" style="width: 16px; height: 16px;"></i>
          Недостаточно независимых оценок
        </div>
        <div class="threshold-desc">
          Собрано ${profile.totalReviews} из 3 необходимых оценок. Поставьте свою оценку, чтобы помочь сформировать публичный Trust Score.
        </div>
        <div class="threshold-progress-bar">
          <div class="threshold-progress-fill" style="width: ${(profile.totalReviews / 3) * 100}%;"></div>
        </div>
      </div>
    `;
  }

  // 3. ACTION BUTTONS GRID
  html += `
    <div class="action-buttons-grid">
      <button class="btn-primary" onclick="openRatingModal()">
        <i data-feather="star"></i>
        <span>${profile.hasMyRating ? 'Изменить оценку' : 'Оценить номер'}</span>
      </button>

      <button class="btn-secondary" onclick="triggerSmsNotificationSim()" title="Тест SMS">
        <i data-feather="send"></i>
        <span>SMS</span>
      </button>

      <button class="btn-secondary" onclick="shareProfile()" title="Поделиться">
        <i data-feather="share-2"></i>
        <span>Share</span>
      </button>
    </div>
  `;

  // 4. DETAILED BREAKDOWN (ALL 10 CRITERIA)
  if (!isBelowThreshold) {
    html += `
      <div class="section-title">
        <span>Детализация рейтингов</span>
        <span class="section-subtitle">10 независимых критериев</span>
      </div>

      <div class="criteria-list">
        ${CRITERIA_MAP.map(c => {
          const val = profile.ratings[c.id] || 5.0;
          return `
            <div class="criteria-card">
              <div class="criteria-header">
                <div class="criteria-name">
                  <i data-feather="${c.icon}" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i>
                  ${c.name}
                </div>
                <div class="criteria-val">${val.toFixed(1)} / 10</div>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${val * 10}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 5. OWNER VERIFICATION & DISPUTE SECTION
  html += `
    <div class="info-card">
      <div class="info-card-header">
        <i data-feather="shield" style="color: var(--primary-gold); width: 20px; height: 20px;"></i>
        <div class="info-card-title">Это ваш номер телефона?</div>
      </div>
      <div class="info-card-desc">
        ${profile.isVerifiedOwner 
          ? ' Вы подтвердили владение этим номером по SMS! Вам доступна расширенная аналитика без раскрытия авторов.'
          : 'Подтвердите владение через SMS-код, чтобы отслеживать динамику рейтинга и подавать жалобы на накрутку.'
        }
      </div>
      ${profile.isVerifiedOwner ? `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 10px; font-size: 11px; color: var(--accent-emerald);">
          ✓ Аккаунт владельца верифицирован. Личности оценивающих 100% зашифрованы системой.
        </div>
      ` : `
        <button class="btn-secondary" style="width: 100%;" onclick="openOtpModal()">
          <i data-feather="smartphone"></i>
          <span>Подтвердить владение номером (SMS OTP)</span>
        </button>
      `}
    </div>
  `;

  container.innerHTML = html;
  feather.replace();
}

// --- 5. ADMIN VIEW RENDERER (ANTI-FRAUD MONITORING) ---
function renderAdminView(container) {
  let html = `
    <div class="admin-badge-banner">
      <div>
        <div style="font-weight: 800; font-size: 14px; color: #fff;">Административная Панель</div>
        <div style="font-size: 11px; color: var(--text-muted);">Мониторинг аномалий и антифрод-системы</div>
      </div>
      <span class="admin-tag">ADMIN ACCESS</span>
    </div>

    <!-- Usage Stats -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
      <div style="background: var(--bg-surface); padding: 10px; border-radius: 12px; text-align: center;">
        <div style="font-size: 18px; font-weight: 800; color: var(--primary-gold);">1,420</div>
        <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase;">Номеров в базе</div>
      </div>
      <div style="background: var(--bg-surface); padding: 10px; border-radius: 12px; text-align: center;">
        <div style="font-size: 18px; font-weight: 800; color: var(--accent-emerald);">8,940</div>
        <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase;">Оценок всего</div>
      </div>
      <div style="background: var(--bg-surface); padding: 10px; border-radius: 12px; text-align: center;">
        <div style="font-size: 18px; font-weight: 800; color: var(--accent-rose);">14</div>
        <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase;">Заблокировано фрода</div>
      </div>
    </div>

    <!-- Fraud Alerts & Anomaly Detector -->
    <div class="section-title">
      <span>Журнал аномалий & Anti-Fraud Logs</span>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="fraud-log-card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span class="fraud-flag">⚠️ Coordinated Attack Flagged</span>
          <span style="color: var(--text-dim);">10 мин назад</span>
        </div>
        <div>Номер: <b>+7 (903) 666-13-13</b> — Зафиксирован всплеск 6 низких оценок с одного IP/Device Pattern.</div>
        <button style="margin-top: 6px; background: rgba(244,63,94,0.2); border: 1px solid var(--accent-rose); color: var(--accent-rose); border-radius: 6px; padding: 4px 8px; font-size: 10px; cursor: pointer;" onclick="alert('Оценки временно исключены из расчета Trust Score!')">
          Исключить подозрительные оценки
        </button>
      </div>

      <div class="fraud-log-card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: var(--accent-cyan); font-weight: 700;">ℹ️ Rate Limiting Triggered</span>
          <span style="color: var(--text-dim);">1 час назад</span>
        </div>
        <div>Пользователь ID #8492 исчерпал суточный лимит отправки SMS-кодов (5 попыток).</div>
      </div>
    </div>

    <!-- Criteria Management -->
    <div class="section-title">Управление критериями оценки</div>
    <div style="background: var(--bg-card-dark); border: 1px solid var(--border-glass); border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
      <div style="margin-bottom: 8px; font-weight: 600; color: var(--text-main);">Активные 10 критериев Trust Index (Шкала 0-10)</div>
      <ul style="padding-left: 16px; color: var(--text-muted); line-height: 1.6;">
        <li>Честность, Порядочность, Ответственность</li>
        <li>Выполнение обещаний, Фин. надежность, Адекватность</li>
        <li>Пунктуальность, Не «понторез», Договороспособность</li>
        <li>Повторная сделка («Стал бы работать снова?»)</li>
      </ul>
    </div>

    <button class="btn-secondary" style="width: 100%;" onclick="toggleAdminMode()">
      ✕ Выйти из режима администратора
    </button>
  `;
  container.innerHTML = html;
  feather.replace();
}

// --- 6. RATING MODAL & SLIDERS LOGIC ---
function renderSlidersInModal() {
  const container = document.getElementById('sliders-container');
  if (!container) return;

  container.innerHTML = CRITERIA_MAP.map(c => `
    <div class="rating-slider-item">
      <div class="slider-label-row">
        <span>${c.name}</span>
        <span class="slider-val" id="val-display-${c.id}">8.0</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="10" 
        step="0.5" 
        value="8.0" 
        id="slider-${c.id}"
        oninput="document.getElementById('val-display-${c.id}').innerText = parseFloat(this.value).toFixed(1)"
      >
    </div>
  `).join('');
}

function openRatingModal() {
  const profile = PROFILES[currentProfileId];
  document.getElementById('rating-modal-phone').innerText = `Номер: ${profile.phone}`;
  
  // Pre-fill existing slider values
  CRITERIA_MAP.forEach(c => {
    const val = profile.ratings[c.id] || 8.0;
    const slider = document.getElementById(`slider-${c.id}`);
    const display = document.getElementById(`val-display-${c.id}`);
    if (slider) slider.value = val;
    if (display) display.innerText = val.toFixed(1);
  });

  openModal('modal-rating');
}

function submitRating(e) {
  e.preventDefault();
  const profile = PROFILES[currentProfileId];

  // Update profile ratings dynamically
  CRITERIA_MAP.forEach(c => {
    const slider = document.getElementById(`slider-${c.id}`);
    if (slider) {
      profile.ratings[c.id] = parseFloat(slider.value);
    }
  });

  if (!profile.hasMyRating) {
    profile.totalReviews += 1;
    profile.hasMyRating = true;
  }

  closeModal('modal-rating');
  renderCurrentView();

  // Trigger SMS notification push simulation
  showSmsToast(`Новая анонимная оценка сохранена! Trust Score обновлен для ${profile.phone}.`);
}

// --- 7. SMS PUSH TOAST SIMULATOR ---
function triggerSmsNotificationSim() {
  const profile = PROFILES[currentProfileId];
  showSmsToast(`SMS: «Ваш номер (${profile.phone}) получил новую анонимную оценку в Trust Index. Чтобы посмотреть рейтинг, откройте приложение.»`);
}

function showSmsToast(message) {
  const toast = document.getElementById('sms-toast');
  const toastText = document.getElementById('sms-toast-text');
  if (toast && toastText) {
    toastText.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}

// --- 8. OWNER OTP VERIFICATION ---
function openOtpModal() {
  const profile = PROFILES[currentProfileId];
  document.getElementById('otp-target-phone').innerText = profile.phone;
  openModal('modal-otp');
}

function confirmOtp() {
  const profile = PROFILES[currentProfileId];
  profile.isVerifiedOwner = true;
  profile.tierClass = 'verified-badge';
  profile.tier = 'VERIFIED OWNER';
  
  closeModal('modal-otp');
  renderCurrentView();
  showSmsToast(`Номер ${profile.phone} успешно верифицирован! Вы получили доступ владельца.`);
}

// --- 9. CONTACTS BOOK SIMULATION ---
function openContactsModal() {
  const container = document.getElementById('contacts-list');
  const contacts = [
    { name: 'Александр Инвестор', phone: '+7 (999) 456-78-90', id: 'alex' },
    { name: 'Дмитрий Риелтор', phone: '+7 (916) 777-88-99', id: 'dmitry' },
    { name: 'Сергей Перекуп', phone: '+7 (903) 666-13-13', id: 'suspicious' },
    { name: 'Елена Продюсер', phone: '+7 (926) 333-44-55', id: 'alex' }
  ];

  container.innerHTML = contacts.map(c => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 10px 14px; border-radius: 12px; cursor: pointer;" onclick="selectPreset('${c.id}'); closeModal('modal-contacts');">
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #fff;">${c.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${c.phone}</div>
      </div>
      <span style="font-size: 11px; color: var(--accent-cyan); font-weight: 600;">Выбрать →</span>
    </div>
  `).join('');

  openModal('modal-contacts');
}

// --- 10. MODAL & DEVICE UTILS ---
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function toggleAdminMode() {
  isAdminMode = !isAdminMode;
  renderCurrentView();
}

function openLegalModal() {
  openModal('modal-legal');
}

function openDisputeModal() {
  openModal('modal-dispute');
}

function submitDispute() {
  closeModal('modal-dispute');
  showSmsToast('Ваша жалоба отправлена в службу модерации. Антифрод-алгоритм проверит связанные оценки.');
}

function shareProfile() {
  const profile = PROFILES[currentProfileId];
  if (navigator.share) {
    navigator.share({
      title: `Trust Index profile for ${profile.phone}`,
      text: `Посмотри анонимный Trust Score для номера ${profile.phone} в Trust Index!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    alert(`Ссылка на профиль ${profile.phone} скопирована!`);
  }
}

function toggleDeviceMode(mode) {
  const wrapper = document.getElementById('app-wrapper');
  const btnFrame = document.getElementById('btn-device-frame');
  const btnFull = document.getElementById('btn-full-screen');

  if (mode === 'frame') {
    wrapper.classList.add('device-frame');
    wrapper.classList.remove('full-screen');
    btnFrame.classList.add('active');
    btnFull.classList.remove('active');
  } else {
    wrapper.classList.remove('device-frame');
    wrapper.classList.add('full-screen');
    btnFull.classList.add('active');
    btnFrame.classList.remove('active');
  }
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const btn = document.getElementById(`nav-${tab}`);
  if (btn) btn.classList.add('active');
  if (tab === 'search' || tab === 'my-card') {
    isAdminMode = false;
    renderCurrentView();
  }
}
