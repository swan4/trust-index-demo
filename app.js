/* ==========================================================================
   Trust Index — Main Application Logic & Navigation Store
   ========================================================================== */

// --- 1. 10 CRITERIA DEFINITIONS ---
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
  { id: 'repeat_intent', name: 'Повторная сделка («Стал бы работать снова?»)', abbr: 'REC', icon: 'repeat' }
];

// --- 2. CONTACTS DATASET (WITH & WITHOUT RATING) ---
const CONTACTS_DATA = [
  {
    id: 'alex',
    name: 'Александр (Инвестор)',
    phone: '+7 (999) 456-78-90',
    hasRating: true,
    totalReviews: 42,
    tier: 'PLATINUM TRUSTED',
    tierClass: 'verified-badge',
    isVerifiedOwner: true,
    ratings: {
      honesty: 9.2, decency: 9.0, responsibility: 8.8, promises: 8.9, financial: 9.5,
      communication: 8.6, punctuality: 8.4, no_brag: 7.9, negotiability: 8.7, repeat_intent: 9.1
    }
  },
  {
    id: 'dmitry',
    name: 'Дмитрий (Риелтор)',
    phone: '+7 (916) 777-88-99',
    hasRating: true,
    totalReviews: 18,
    tier: 'RELIABLE PRO',
    tierClass: 'tier-badge',
    isVerifiedOwner: false,
    ratings: {
      honesty: 7.8, decency: 7.5, responsibility: 7.9, promises: 7.4, financial: 8.0,
      communication: 7.6, punctuality: 7.2, no_brag: 6.8, negotiability: 8.2, repeat_intent: 7.5
    }
  },
  {
    id: 'suspicious',
    name: 'Сергей (Перекуп)',
    phone: '+7 (903) 666-13-13',
    hasRating: true,
    totalReviews: 12,
    tier: 'HIGH RISK / ПОДОЗРИТЕЛЬНЫЙ',
    tierClass: 'risk-badge',
    isVerifiedOwner: false,
    ratings: {
      honesty: 3.2, decency: 3.5, responsibility: 2.9, promises: 3.1, financial: 3.8,
      communication: 4.0, punctuality: 3.0, no_brag: 2.1, negotiability: 4.2, repeat_intent: 3.0
    }
  },
  {
    id: 'elena',
    name: 'Елена (Дизайнер)',
    phone: '+7 (926) 333-44-55',
    hasRating: false,
    totalReviews: 0,
    tier: 'НОВЫЙ КОНТАКТ',
    tierClass: 'tier-badge',
    isVerifiedOwner: false,
    ratings: {
      honesty: 5.0, decency: 5.0, responsibility: 5.0, promises: 5.0, financial: 5.0,
      communication: 5.0, punctuality: 5.0, no_brag: 5.0, negotiability: 5.0, repeat_intent: 5.0
    }
  },
  {
    id: 'igor',
    name: 'Игорь (Курьер)',
    phone: '+7 (905) 123-99-88',
    hasRating: false,
    totalReviews: 1, // Below minimum 3 ratings threshold!
    tier: 'НЕДОСТАТОЧНО ОЦЕНОК',
    tierClass: 'tier-badge',
    isVerifiedOwner: false,
    ratings: {
      honesty: 6.0, decency: 6.0, responsibility: 6.0, promises: 6.0, financial: 6.0,
      communication: 6.0, punctuality: 6.0, no_brag: 6.0, negotiability: 6.0, repeat_intent: 6.0
    }
  }
];

// USER'S OWN PROFILE DATA
const MY_PROFILE_DATA = {
  id: 'my_profile',
  name: 'Вы (Владелец)',
  phone: '+7 (900) 111-22-33',
  hasRating: true,
  totalReviews: 27,
  tier: 'GOLD VERIFIED',
  tierClass: 'verified-badge',
  isVerifiedOwner: true,
  ratings: {
    honesty: 9.4, decency: 9.1, responsibility: 9.0, promises: 9.3, financial: 9.2,
    communication: 9.5, punctuality: 8.9, no_brag: 8.8, negotiability: 9.0, repeat_intent: 9.6
  }
};

// --- 3. APP STATE ---
let currentTab = 'contacts'; // 'contacts' | 'my-profile' | 'detail'
let contactFilter = 'rated'; // 'rated' | 'unrated'
let searchQuery = '';
let selectedContactId = null;

// Calculate Overall FIFA Score (0-100)
function calculateTrustScore(profile) {
  const keys = Object.keys(profile.ratings);
  const avg = keys.reduce((sum, key) => sum + profile.ratings[key], 0) / keys.length;
  return Math.round(avg * 10);
}

// Global App Init
document.addEventListener('DOMContentLoaded', () => {
  renderSlidersInModal();
  renderAppView();
});

// Search Input Handler
function handleSearchInput(val) {
  searchQuery = val.toLowerCase().trim();
  if (currentTab === 'detail') {
    currentTab = 'contacts';
  }
  renderAppView();
}

// Filter Switcher: With Rating vs Without Rating
function setContactFilter(filter) {
  contactFilter = filter;
  renderAppView();
}

// Switch Bottom Nav Tabs
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

// Navigate to Contact Detail Profile View
function openContactDetail(id) {
  selectedContactId = id;
  currentTab = 'detail';
  renderAppView();
}

// Back to Contact List
function backToContacts() {
  currentTab = 'contacts';
  renderAppView();
}

// --- 4. MAIN RENDER CONTROLLER ---
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

// --- 5. RENDER CONTACTS LIST VIEW ---
function renderContactsListView(container) {
  // Filter contacts by search query & filter tab
  let list = CONTACTS_DATA.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery);
    const matchesFilter = contactFilter === 'rated' ? c.hasRating : !c.hasRating;
    return matchesSearch && matchesFilter;
  });

  let html = `
    <!-- Filter Pills Bar: With Rating vs Without Rating -->
    <div class="filter-pills-bar">
      <div class="filter-pill ${contactFilter === 'rated' ? 'active' : ''}" onclick="setContactFilter('rated')">
        ⭐ С рейтингом (${CONTACTS_DATA.filter(c => c.hasRating).length})
      </div>
      <div class="filter-pill ${contactFilter === 'unrated' ? 'active' : ''}" onclick="setContactFilter('unrated')">
        🔒 Без рейтинга (${CONTACTS_DATA.filter(c => !c.hasRating).length})
      </div>
    </div>

    <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px;">
      ${contactFilter === 'rated' ? 'Телефонная книга — Номера с отзывами:' : 'Телефонная книга — Новые номера без рейтинга:'}
    </div>
  `;

  if (list.length === 0) {
    html += `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
        <i data-feather="search" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <div style="font-size: 14px; font-weight: 600;">Контакты не найдены</div>
        <div style="font-size: 12px; margin-top: 4px;">Попробуйте изменить поисковый запрос</div>
      </div>
    `;
  } else {
    html += list.map(c => {
      const score = calculateTrustScore(c);
      const initial = c.name.charAt(0);
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
              <div class="contact-rating-badge">
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

// --- 6. RENDER CONTACT DETAIL VIEW (FIFA CARD + RATE BUTTON + BACK) ---
function renderContactDetailView(container) {
  const contact = CONTACTS_DATA.find(c => c.id === selectedContactId) || CONTACTS_DATA[0];
  const trustScore = calculateTrustScore(contact);
  const isBelowThreshold = contact.totalReviews < 3;

  let html = `
    <!-- Back Header -->
    <div class="back-header" onclick="backToContacts()">
      <i data-feather="arrow-left"></i>
      <span>Вернуться к контактам</span>
    </div>

    <!-- FIFA Player Card Component -->
    <div class="fifa-card-container">
      <div class="fifa-card">
        
        <div class="fifa-card-header">
          <div class="fifa-overall-score">
            <span class="overall-num">${isBelowThreshold ? '?' : trustScore}</span>
            <span class="overall-label">TRUST SCORE</span>
          </div>

          <div class="fifa-card-badge-box">
            <span class="tier-badge ${contact.tierClass}">
              ${contact.tier}
            </span>
            <span class="reviews-count-badge">
              <i data-feather="users" style="width: 12px; height: 12px;"></i>
              ${contact.totalReviews} independent reviews
            </span>
          </div>
        </div>

        <div class="fifa-identity">
          <div class="fifa-phone-number">${contact.phone}</div>
          <div class="fifa-phone-label">${contact.name}</div>
        </div>

        ${isBelowThreshold ? `
          <div style="text-align: center; padding: 20px 10px; background: rgba(0,0,0,0.4); border-radius: 16px; margin-bottom: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🔒</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--primary-gold);">Рейтинг скрыт до 3 оценок</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Система публично показывает рейтинг только при наличии минимум 3 независимых отзывов.
            </div>
          </div>
        ` : `
          <!-- FIFA Core 6 Stat Attributes Grid -->
          <div class="fifa-stats-grid">
            <div class="stat-item">
              <span class="stat-val ${contact.ratings.honesty >= 8 ? 'high' : contact.ratings.honesty >= 5 ? 'med' : 'low'}">
                ${contact.ratings.honesty.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">HON</div>
                <div class="stat-name">Честность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${contact.ratings.responsibility >= 8 ? 'high' : contact.ratings.responsibility >= 5 ? 'med' : 'low'}">
                ${contact.ratings.responsibility.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">RES</div>
                <div class="stat-name">Ответственность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${contact.ratings.financial >= 8 ? 'high' : contact.ratings.financial >= 5 ? 'med' : 'low'}">
                ${contact.ratings.financial.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">FIN</div>
                <div class="stat-name">Фин. надежность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${contact.ratings.promises >= 8 ? 'high' : contact.ratings.promises >= 5 ? 'med' : 'low'}">
                ${contact.ratings.promises.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">PRM</div>
                <div class="stat-name">Обещания</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${contact.ratings.communication >= 8 ? 'high' : contact.ratings.communication >= 5 ? 'med' : 'low'}">
                ${contact.ratings.communication.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">COM</div>
                <div class="stat-name">Адекватность</div>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-val ${contact.ratings.repeat_intent >= 8 ? 'high' : contact.ratings.repeat_intent >= 5 ? 'med' : 'low'}">
                ${contact.ratings.repeat_intent.toFixed(1)}
              </span>
              <div>
                <div class="stat-abbr">REC</div>
                <div class="stat-name">Снова работать</div>
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
    ` : ''}
  `;

  container.innerHTML = html;
}

// --- 7. RENDER MY PROFILE VIEW (FIFA CARD WITHOUT RATE BUTTON) ---
function renderMyProfileView(container) {
  const profile = MY_PROFILE_DATA;
  const trustScore = calculateTrustScore(profile);

  let html = `
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: var(--accent-emerald); display: flex; align-items: center; gap: 8px;">
      <i data-feather="check-circle" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
      <div><b>Ваш личный профиль верифицирован.</b> Другие пользователи видят эту карточку анонимно.</div>
    </div>

    <!-- FIFA Player Card Component -->
    <div class="fifa-card-container">
      <div class="fifa-card">
        
        <div class="fifa-card-header">
          <div class="fifa-overall-score">
            <span class="overall-num">${trustScore}</span>
            <span class="overall-label">MY TRUST SCORE</span>
          </div>

          <div class="fifa-card-badge-box">
            <span class="tier-badge ${profile.tierClass}">
              ✓ ${profile.tier}
            </span>
            <span class="reviews-count-badge">
              <i data-feather="users" style="width: 12px; height: 12px;"></i>
              ${profile.totalReviews} independent reviews
            </span>
          </div>
        </div>

        <div class="fifa-identity">
          <div class="fifa-phone-number">${profile.phone}</div>
          <div class="fifa-phone-label">${profile.name}</div>
        </div>

        <!-- FIFA Core 6 Stat Attributes Grid -->
        <div class="fifa-stats-grid">
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.honesty.toFixed(1)}</span>
            <div><div class="stat-abbr">HON</div><div class="stat-name">Честность</div></div>
          </div>
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.responsibility.toFixed(1)}</span>
            <div><div class="stat-abbr">RES</div><div class="stat-name">Ответственность</div></div>
          </div>
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.financial.toFixed(1)}</span>
            <div><div class="stat-abbr">FIN</div><div class="stat-name">Фин. надежность</div></div>
          </div>
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.promises.toFixed(1)}</span>
            <div><div class="stat-abbr">PRM</div><div class="stat-name">Обещания</div></div>
          </div>
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.communication.toFixed(1)}</span>
            <div><div class="stat-abbr">COM</div><div class="stat-name">Адекватность</div></div>
          </div>
          <div class="stat-item">
            <span class="stat-val high">${profile.ratings.repeat_intent.toFixed(1)}</span>
            <div><div class="stat-abbr">REC</div><div class="stat-name">Снова работать</div></div>
          </div>
        </div>

        <div class="fifa-card-footer">
          <span>Trust Index Protocol</span>
          <span>Verified Owner Signal</span>
        </div>

      </div>
    </div>

    <!-- NOTICE: NO RATE BUTTON (SINCE IT IS YOUR OWN PROFILE) -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 14px; padding: 14px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 12px; color: var(--text-muted);">
        🔒 <b>Оценка собственного профиля недоступна.</b> Рейтинг формируется исключительно анонимными мнениями других пользователей.
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

  container.innerHTML = html;
}

// --- 8. RATING MODAL & SLIDERS LOGIC ---
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
  const contact = CONTACTS_DATA.find(c => c.id === selectedContactId) || CONTACTS_DATA[0];
  document.getElementById('rating-modal-phone').innerText = `Номер: ${contact.phone} (${contact.name})`;
  
  CRITERIA_MAP.forEach(c => {
    const val = contact.ratings[c.id] || 8.0;
    const slider = document.getElementById(`slider-${c.id}`);
    const display = document.getElementById(`val-display-${c.id}`);
    if (slider) slider.value = val;
    if (display) display.innerText = val.toFixed(1);
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

// --- 9. MODAL UTILS ---
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
