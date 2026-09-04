/* ==========================================================================
   Trust Index — Main Application Logic & Navigation Store
   ========================================================================== */

// --- 1. 10 CRITERIA DEFINITIONS ---
const CRITERIA_MAP = [
  { id: 'honesty', name: 'Честность', icon: 'check-circle' },
  { id: 'decency', name: 'Порядочность', icon: 'heart' },
  { id: 'responsibility', name: 'Ответственность', icon: 'shield' },
  { id: 'promises', name: 'Выполнение обещаний', icon: 'award' },
  { id: 'financial', name: 'Фин. надежность', icon: 'dollar-sign' },
  { id: 'communication', name: 'Адекватность общения', icon: 'message-square' },
  { id: 'punctuality', name: 'Пунктуальность', icon: 'clock' },
  { id: 'no_brag', name: 'Не «понторез» (скромность)', icon: 'smile' },
  { id: 'negotiability', name: 'Договороспособность', icon: 'user-check' },
  { id: 'repeat_intent', name: 'Повторная сделка («Стал бы работать снова?»)', icon: 'repeat' }
];

// --- 2. CONTACTS DATASET ---
const CONTACTS_DATA = [
  {
    id: 'alex',
    name: 'Александр',
    phone: '+7 (999) 456-78-90',
    hasRating: true,
    totalReviews: 42,
    ratings: {
      honesty: 9.2, decency: 9.0, responsibility: 8.8, promises: 8.9, financial: 9.5,
      communication: 8.6, punctuality: 8.4, no_brag: 7.9, negotiability: 8.7, repeat_intent: 9.1
    }
  },
  {
    id: 'dmitry',
    name: 'Дмитрий',
    phone: '+7 (916) 777-88-99',
    hasRating: true,
    totalReviews: 18,
    ratings: {
      honesty: 7.8, decency: 7.5, responsibility: 7.9, promises: 7.4, financial: 8.0,
      communication: 7.6, punctuality: 7.2, no_brag: 6.8, negotiability: 8.2, repeat_intent: 7.5
    }
  },
  {
    id: 'suspicious',
    name: 'Сергей',
    phone: '+7 (903) 666-13-13',
    hasRating: true,
    totalReviews: 12,
    ratings: {
      honesty: 3.2, decency: 3.5, responsibility: 2.9, promises: 3.1, financial: 3.8,
      communication: 4.0, punctuality: 3.0, no_brag: 2.1, negotiability: 4.2, repeat_intent: 3.0
    }
  },
  {
    id: 'elena',
    name: 'Елена',
    phone: '+7 (926) 333-44-55',
    hasRating: false,
    totalReviews: 0,
    ratings: {
      honesty: 5.0, decency: 5.0, responsibility: 5.0, promises: 5.0, financial: 5.0,
      communication: 5.0, punctuality: 5.0, no_brag: 5.0, negotiability: 5.0, repeat_intent: 5.0
    }
  },
  {
    id: 'igor',
    name: 'Игорь',
    phone: '+7 (905) 123-99-88',
    hasRating: false,
    totalReviews: 1, // Below minimum 3 ratings threshold
    ratings: {
      honesty: 6.0, decency: 6.0, responsibility: 6.0, promises: 6.0, financial: 6.0,
      communication: 6.0, punctuality: 6.0, no_brag: 6.0, negotiability: 6.0, repeat_intent: 6.0
    }
  }
];

// USER'S OWN PROFILE DATA
const MY_PROFILE_DATA = {
  id: 'my_profile',
  name: 'Вы',
  phone: '+7 (900) 111-22-33',
  hasRating: true,
  totalReviews: 27,
  ratings: {
    honesty: 9.4, decency: 9.1, responsibility: 9.0, promises: 9.3, financial: 9.2,
    communication: 9.5, punctuality: 8.9, no_brag: 8.8, negotiability: 9.0, repeat_intent: 9.6
  }
};

// APP STATE
let currentTab = 'contacts'; // 'contacts' | 'my-profile' | 'detail'
let contactFilter = 'all'; // 'all' | 'rated'
let searchQuery = '';
let selectedContactId = null;
let isContactsSynced = false;

// Calculate Overall Trust Score (e.g. 9.23)
function calculateTrustScore(profile) {
  const keys = Object.keys(profile.ratings);
  const avg = keys.reduce((sum, key) => sum + profile.ratings[key], 0) / keys.length;
  return avg.toFixed(2);
}

// Get Score Theme Color Class: Gold (9+), Green (7-8.99), Blue (5-6.99), Red (<5)
function getScoreThemeClass(scoreVal) {
  const num = parseFloat(scoreVal);
  if (isNaN(num) || num < 5.0) return 'score-red';
  if (num < 7.0) return 'score-blue';
  if (num < 9.0) return 'score-green';
  return 'score-gold';
}

document.addEventListener('DOMContentLoaded', () => {
  renderSlidersInModal();
  renderAppView();
});

function handleSearchInput(val) {
  searchQuery = val.toLowerCase().trim();
  if (currentTab === 'detail') {
    currentTab = 'contacts';
  }
  renderAppView();
}

function setContactFilter(filter) {
  contactFilter = filter;
  renderAppView();
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  if (tab === 'contacts') {
    document.getElementById('nav-contacts').classList.add('active');
  } else if (tab === 'my-profile') {
    document.getElementById('nav-my-profile').classList.add('active');
  }
  
  renderAppView();
}

function openContactDetail(id) {
  selectedContactId = id;
  currentTab = 'detail';
  renderAppView();
}

function backToContacts() {
  currentTab = 'contacts';
  renderAppView();
}

function renderAppView() {
  const main = document.getElementById('app-main-content');
  if (!main) return;

  if (currentTab === 'contacts') {
    renderContactsListView(main);
  } else if (currentTab === 'detail') {
    renderContactDetailView(main);
  } else if (currentTab === 'my-profile') {
    renderMyProfileView(main);
  }

  feather.replace();
}

// RENDER CONTACTS LIST VIEW
function renderContactsListView(container) {
  let list = CONTACTS_DATA.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery);
    const matchesFilter = contactFilter === 'rated' ? c.hasRating : true;
    return matchesSearch && matchesFilter;
  });

  let html = '';

  if (!isContactsSynced) {
    html += `
      <div style="background: rgba(245, 196, 83, 0.12); border: 1px solid var(--border-gold); border-radius: 14px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--primary-gold);">⚠️ Данные контактов не актуальны</div>
          <div style="font-size: 10px; color: var(--text-muted);">Нажмите кнопку для обновления телефонной книги</div>
        </div>
        <button class="contacts-btn" style="position: static;" onclick="openSyncPermissionModal()">
          Синхронизировать
        </button>
      </div>
    `;
  }

  html += `
    <div class="filter-pills-bar">
      <div class="filter-pill ${contactFilter === 'all' ? 'active' : ''}" onclick="setContactFilter('all')">
        👥 Все (${CONTACTS_DATA.length})
      </div>
      <div class="filter-pill ${contactFilter === 'rated' ? 'active' : ''}" onclick="setContactFilter('rated')">
        ⭐ Только с рейтингом (${CONTACTS_DATA.filter(c => c.hasRating).length})
      </div>
    </div>

    <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px;">
      ${contactFilter === 'rated' ? 'Контакты только с имеющимися отзывами:' : 'Все контакты из вашей телефонной книги:'}
    </div>
  `;

  if (list.length === 0) {
    html += `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
        <i data-feather="search" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <div style="font-size: 14px; font-weight: 600;">Контакты не найдены</div>
      </div>
    `;
  } else {
    html += list.map(c => {
      const score = calculateTrustScore(c);
      const initial = c.name.charAt(0);
      const themeClass = getScoreThemeClass(score);
      return `
        <div class="contact-item-card" onclick="openContactDetail('${c.id}')">
          <div class="contact-left">
            <div class="contact-avatar">${initial}</div>
            <div class="contact-info">
              <div class="contact-name">${c.name}</div>
              <div class="contact-phone">${c.phone}</div>
            </div>
          </div>

          <div>
            ${c.hasRating ? `
              <div class="contact-rating-badge ${themeClass}">
                ★ ${score}
              </div>
            ` : `
              <div class="contact-rating-badge no-rating">
                🔒 0 отзывов
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = html;
}

// RENDER CONTACT DETAIL VIEW (CLEAN REPUTATION CARD WITH DYNAMIC SCORE COLORS)
function renderContactDetailView(container) {
  const contact = CONTACTS_DATA.find(c => c.id === selectedContactId) || CONTACTS_DATA[0];
  const trustScore = calculateTrustScore(contact);
  const isBelowThreshold = contact.totalReviews < 3;
  const themeClass = isBelowThreshold ? '' : getScoreThemeClass(trustScore);

  const highlights = [
    { name: 'Честность', val: contact.ratings.honesty },
    { name: 'Ответственность', val: contact.ratings.responsibility },
    { name: 'Фин. надежность', val: contact.ratings.financial },
    { name: 'Выполнение обещаний', val: contact.ratings.promises },
    { name: 'Адекватность', val: contact.ratings.communication },
    { name: 'Снова работать', val: contact.ratings.repeat_intent }
  ];

  let html = `
    <div class="back-header" onclick="backToContacts()">
      <i data-feather="arrow-left"></i>
      <span>Вернуться к контактам</span>
    </div>

    <!-- Clean Trust Index Reputation Card with Dynamic Color Theme -->
    <div class="trust-card-container">
      <div class="trust-card ${themeClass}">
        
        <div class="trust-card-header">
          <div class="trust-score-box">
            <span class="trust-score-num">${isBelowThreshold ? '?' : trustScore}</span>
          </div>

          <div class="trust-card-badge-box">
            <span class="reviews-count-badge">
              <i data-feather="users" style="width: 12px; height: 12px;"></i>
              ${contact.totalReviews} оценок
            </span>
          </div>
        </div>

        <div class="trust-identity">
          <div class="trust-phone-number">${contact.phone}</div>
          <div class="trust-phone-label">${contact.name}</div>
        </div>

        ${isBelowThreshold ? `
          <div style="text-align: center; padding: 20px 10px; background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 16px;">
            <div style="font-size: 26px; margin-bottom: 6px;">🔒</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--primary-gold);">Рейтинг скрыт до 3 оценок</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Публичный сигнал Trust Score формируется только при наличии 3 и более независимых оценок.
            </div>
          </div>
        ` : `
          <!-- Core Highlight Stats -->
          <div class="trust-stats-grid">
            ${highlights.map(h => `
              <div class="trust-stat-cell">
                <div class="trust-stat-header">
                  <span class="trust-stat-title">${h.name}</span>
                  <span class="trust-stat-val ${getScoreThemeClass(h.val)}">${h.val.toFixed(2)}</span>
                </div>
                <div class="trust-mini-bar">
                  <div class="trust-mini-fill ${getScoreThemeClass(h.val)}" style="width: ${h.val * 10}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <div class="trust-card-footer">
          <span>Trust Index Protocol</span>
          <span>Anonymous Reputation</span>
        </div>

      </div>
    </div>

    <!-- Action Button: Add Rating -->
    <div style="margin-bottom: 24px;">
      <button class="btn-primary" style="width: 100%; height: 50px;" onclick="openRatingModal()">
        <i data-feather="star"></i>
        <span>Добавить свой отзыв / Оценить номер</span>
      </button>
    </div>

    <!-- Detailed 10 Criteria List -->
    ${!isBelowThreshold ? `
      <div class="section-title">
        <span>Детализация рейтингов</span>
        <span class="section-subtitle">10 независимых критериев</span>
      </div>

      <div class="criteria-list">
        ${CRITERIA_MAP.map(c => {
          const val = contact.ratings[c.id] || 5.0;
          const themeClass = getScoreThemeClass(val);
          return `
            <div class="criteria-card">
              <div class="criteria-header">
                <div class="criteria-name">
                  <i data-feather="${c.icon}" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i>
                  ${c.name}
                </div>
                <div class="criteria-val ${themeClass}">${val.toFixed(2)}</div>
              </div>
              <div class="bar-track">
                <div class="bar-fill ${themeClass}" style="width: ${val * 10}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
  `;

  container.innerHTML = html;
}

// RENDER MY PROFILE VIEW (CLEAN REPUTATION CARD WITHOUT RATE BUTTON)
function renderMyProfileView(container) {
  const profile = MY_PROFILE_DATA;
  const trustScore = calculateTrustScore(profile);
  const themeClass = getScoreThemeClass(trustScore);

  const highlights = [
    { name: 'Честность', val: profile.ratings.honesty },
    { name: 'Ответственность', val: profile.ratings.responsibility },
    { name: 'Фин. надежность', val: profile.ratings.financial },
    { name: 'Выполнение обещаний', val: profile.ratings.promises },
    { name: 'Адекватность', val: profile.ratings.communication },
    { name: 'Снова работать', val: profile.ratings.repeat_intent }
  ];

  let html = `
    <!-- Clean Trust Index Reputation Card -->
    <div class="trust-card-container">
      <div class="trust-card ${themeClass}">
        
        <div class="trust-card-header">
          <div class="trust-score-box">
            <span class="trust-score-num">${trustScore}</span>
          </div>

          <div class="trust-card-badge-box">
            <span class="reviews-count-badge">
              <i data-feather="users" style="width: 12px; height: 12px;"></i>
              ${profile.totalReviews} оценок
            </span>
          </div>
        </div>

        <div class="trust-identity">
          <div class="trust-phone-number">${profile.phone}</div>
          <div class="trust-phone-label">${profile.name}</div>
        </div>

        <!-- Core Highlight Stats -->
        <div class="trust-stats-grid">
          ${highlights.map(h => `
            <div class="trust-stat-cell">
              <div class="trust-stat-header">
                <span class="trust-stat-title">${h.name}</span>
                <span class="trust-stat-val ${getScoreThemeClass(h.val)}">${h.val.toFixed(2)}</span>
              </div>
              <div class="trust-mini-bar">
                <div class="trust-mini-fill ${getScoreThemeClass(h.val)}" style="width: ${h.val * 10}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="trust-card-footer">
          <span>Trust Index Protocol</span>
          <span>Anonymous Reputation</span>
        </div>

      </div>
    </div>

    <!-- NOTICE: NO RATE BUTTON -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 14px; padding: 14px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 12px; color: var(--text-muted);">
        🔒 <b>Оценка собственного профиля недоступна.</b> Ваш рейтинг формируется исключительно анонимными мнениями других пользователей.
      </div>
    </div>

    <!-- Detailed 10 Criteria List -->
    <div class="section-title">
      <span>Моя детализация рейтингов</span>
      <span class="section-subtitle">10 параметров</span>
    </div>

    <div class="criteria-list">
      ${CRITERIA_MAP.map(c => {
        const val = profile.ratings[c.id] || 5.0;
        const themeClass = getScoreThemeClass(val);
        return `
          <div class="criteria-card">
            <div class="criteria-header">
              <div class="criteria-name">
                <i data-feather="${c.icon}" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i>
                ${c.name}
              </div>
              <div class="criteria-val ${themeClass}">${val.toFixed(2)}</div>
            </div>
            <div class="bar-track">
              <div class="bar-fill ${themeClass}" style="width: ${val * 10}%;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
}

// RATING MODAL & SLIDERS LOGIC (INTEGER SCALE 0-10)
function renderSlidersInModal() {
  const container = document.getElementById('sliders-container');
  if (!container) return;

  container.innerHTML = CRITERIA_MAP.map(c => `
    <div class="rating-slider-item">
      <div class="slider-label-row">
        <span>${c.name}</span>
        <span class="slider-val" id="val-display-${c.id}">8</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="10" 
        step="1" 
        value="8" 
        id="slider-${c.id}"
        oninput="document.getElementById('val-display-${c.id}').innerText = this.value"
      >
    </div>
  `).join('');
}

function openRatingModal() {
  const contact = CONTACTS_DATA.find(c => c.id === selectedContactId) || CONTACTS_DATA[0];
  document.getElementById('rating-modal-phone').innerText = `Номер: ${contact.phone} (${contact.name})`;
  
  CRITERIA_MAP.forEach(c => {
    const val = Math.round(contact.ratings[c.id] || 8);
    const slider = document.getElementById(`slider-${c.id}`);
    const display = document.getElementById(`val-display-${c.id}`);
    if (slider) slider.value = val;
    if (display) display.innerText = val;
  });

  openModal('modal-rating');
}

function submitRating(e) {
  e.preventDefault();
  const contact = CONTACTS_DATA.find(c => c.id === selectedContactId) || CONTACTS_DATA[0];

  CRITERIA_MAP.forEach(c => {
    const slider = document.getElementById(`slider-${c.id}`);
    if (slider) {
      contact.ratings[c.id] = parseFloat(slider.value);
    }
  });

  if (!contact.hasRating) {
    contact.hasRating = true;
    contact.totalReviews += 1;
  }

  closeModal('modal-rating');
  renderAppView();
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function openLegalModal() {
  openModal('modal-legal');
}

// NOTIFICATION BELL TOGGLE & DISMISS
function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('open');
  }
}

function dismissNotifications() {
  const badge = document.getElementById('notif-badge');
  const dropdown = document.getElementById('notif-dropdown');
  if (badge) badge.style.display = 'none';
  if (dropdown) dropdown.classList.remove('open');
}

// INITIAL ONBOARDING RATING NOTIFICATION HANDLER
function viewMyRatingOnboarding() {
  closeModal('modal-welcome-notif');
  openModal('modal-sync-permission');
}

// CONTACT SYNC PERMISSION HANDLERS
function openSyncPermissionModal() {
  openModal('modal-sync-permission');
}

function allowContactSync() {
  const btn = document.getElementById('btn-allow-sync');
  if (btn) {
    btn.innerHTML = '<span>⏳ Синхронизация записной книги...</span>';
    btn.disabled = true;
  }

  setTimeout(() => {
    isContactsSynced = true;
    closeModal('modal-sync-permission');
    if (btn) {
      btn.innerHTML = '<span>Разрешить и синхронизировать</span>';
      btn.disabled = false;
    }
    switchTab('contacts');
  }, 1000);
}

function skipContactSync() {
  closeModal('modal-sync-permission');
  switchTab('my-profile');
}

// GO TO HOME / MAIN SCREEN HANDLER
function goToHome() {
  searchQuery = '';
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) searchInput.value = '';
  switchTab('contacts');
}
