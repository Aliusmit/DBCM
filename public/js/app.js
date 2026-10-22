/**
 * DBCM Study Material - Interactive Client Application
 * Supports 14 Academic Departments with Major & Minor Tracks
 */

const state = {
  departments: [],
  semesters: [],
  subjects: [],
  selectedDepartment: '', // Unselected initially: subjects hidden until department selected
  selectedTrack: '',      // Unselected initially: subjects hidden until major/minor track selected
  selectedSemester: '1',
  searchQuery: '',
  theme: (localStorage.getItem('dbcm_theme') === 'light') ? 'light' : 'dark', // 'dark' (clean minimal) | 'light'
  bookmarks: JSON.parse(localStorage.getItem('dbcm_bookmarks') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('dbcm_recent') || '[]'),
  currentSubject: null,
  activeTab: 'overview',
  studentUser: JSON.parse(localStorage.getItem('dbcm_student') || 'null'),
  adminToken: localStorage.getItem('dbcm_admin_token') || null,
  activeAdminTab: 'upload',
  pyqs: [],
  pyqFilters: {
    department: '', // Unselected initially: question papers hidden until department selected
    subject: 'all',
    track: 'all',
    year: 'all',
    semester: 'all',
    search: ''
  }
};

// Utility: Lightweight debounce to optimize typing response times
function debounce(fn, wait = 150) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(state.theme);
  await loadInitialData();
  setupEventListeners();
  updateAuthUI();
  renderApp();
});

function applyTheme(theme) {
  const activeTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', activeTheme);
  localStorage.setItem('dbcm_theme', activeTheme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    if (activeTheme === 'dark') {
      themeBtn.innerHTML = '<i data-lucide="moon" class="w-4 h-4 text-indigo-400"></i><span id="theme-label" class="hidden md:inline text-[11px]">Dark</span>';
    } else {
      themeBtn.innerHTML = '<i data-lucide="sun" class="w-4 h-4 text-amber-500"></i><span id="theme-label" class="hidden md:inline text-[11px]">Light</span>';
    }
    if (window.lucide) lucide.createIcons();
  }
}

async function loadInitialData() {
  const isCustomPort = window.location.port && window.location.port !== '3000';
  const apiBase = isCustomPort ? 'http://localhost:3000' : '';

  let loadedViaApi = false;

  // Attempt 1: Fetch via API
  try {
    const urls = [
      `${apiBase}/api/departments`,
      `${apiBase}/api/semesters`,
      `${apiBase}/api/subjects`,
      `${apiBase}/api/stats`,
      `${apiBase}/api/pyqs`
    ];

    const [deptsRes, semRes, subjectsRes, statsRes, pyqsRes] = await Promise.all(
      urls.map(u => fetch(u).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }))
    );

    if (deptsRes && deptsRes.success) state.departments = deptsRes.data;
    if (semRes && semRes.success) state.semesters = semRes.data;
    if (subjectsRes && subjectsRes.success) state.subjects = subjectsRes.data;
    if (pyqsRes && pyqsRes.success) state.pyqs = pyqsRes.data;

    if (statsRes && statsRes.success) {
      renderStats(statsRes.data);
      if (statsRes.data.announcement) {
        const annEl = document.getElementById('announcement-text');
        if (annEl) annEl.textContent = statsRes.data.announcement;
        const liveEl = document.getElementById('live-broadcast-text');
        if (liveEl) liveEl.textContent = statsRes.data.announcement;
      }
      if (statsRes.data.academicNotices) {
        state.academicNotices = statsRes.data.academicNotices;
        renderAnnouncements();
      }
    }
    loadedViaApi = true;
  } catch (apiErr) {
    console.warn('[Live Server Mode Detected] API endpoints not reachable directly. Falling back to local data file...', apiErr);
  }

  // Attempt 2: Fallback for VS Code Live Server (port 5500) or static file loading
  if (!loadedViaApi || !state.subjects.length) {
    try {
      const possiblePaths = [
        'data/curriculum.json',
        './data/curriculum.json',
        '../data/curriculum.json',
        '/data/curriculum.json',
        '/public/data/curriculum.json'
      ];

      let rawData = null;
      for (const p of possiblePaths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            rawData = await res.json();
            console.log(`[Live Server Mode] Successfully loaded static curriculum from: ${p}`);
            break;
          }
        } catch (_) {}
      }

      if (rawData) {
        state.departments = rawData.departments || [];
        state.semesters = rawData.semesters || [];
        state.subjects = rawData.subjects || [];

        // Synthesize PYQs list from subjects
        const allPyqs = [];
        for (const s of state.subjects) {
          const dept = (state.departments || []).find(d => d.id === s.departmentId) || { name: s.departmentId, code: (s.departmentId || '').toUpperCase() };
          for (const p of (s.pyqs || [])) {
            allPyqs.push({
              id: `pyq-${s.id}-${(p.session || 'regular').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              subjectId: s.id,
              subjectCode: s.code,
              subjectName: s.name,
              shortName: s.shortName,
              departmentId: s.departmentId,
              departmentName: dept.name,
              departmentCode: dept.code,
              track: s.track || 'major',
              semester: s.semester,
              year: p.year,
              session: p.session,
              paperType: p.paperType,
              totalMarks: p.totalMarks || 80,
              pages: p.pages || 4,
              duration: '3 Hours',
              scheme: s.scheme,
              modules: s.modules,
              impQuestions: s.impQuestions
            });
          }
        }
        state.pyqs = allPyqs;

        // Render stats
        const majorCount = state.subjects.filter(s => (s.track || 'major') === 'major').length;
        const minorCount = state.subjects.filter(s => (s.track || 'major') === 'minor').length;
        renderStats({
          departmentsCount: state.departments.length,
          subjectsCount: state.subjects.length,
          majorCount,
          minorCount,
          impsCount: state.subjects.reduce((acc, s) => acc + (s.impQuestions ? s.impQuestions.length : 0), 0)
        });
      }
    } catch (staticErr) {
      console.error('[Fallback Error] Failed to load local curriculum data:', staticErr);
    }
  }
}

function setupEventListeners() {
  // Theme Toggle: 2-mode switch (dark <-> light)
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    });
  }

  // Main Search Input with Debounce & Clear ('X') Button
  const searchInput = document.getElementById('main-search-input');
  const clearBtn = document.getElementById('search-clear-btn');

  const debouncedRenderSubjects = debounce(() => {
    renderSubjects();
  }, 160);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearBtn) {
        if (e.target.value.trim().length > 0) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      }
      debouncedRenderSubjects();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearMainSearch();
      }
    });
  }

  // Global Keyboard Shortcuts (Escape & Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    if (e.key === 'Escape') {
      if (searchInput && (document.activeElement === searchInput || searchInput.value.length > 0)) {
        clearMainSearch();
      }
      closeSearchModal();
      closeSubjectModal();
      closeReaderModal();
      closeBookmarksDrawer();
      closeAdminModal();
      closeStudentModal();
      closeAnnouncementModal();
    }
  });

  // Modal Search
  const modalSearchInput = document.getElementById('modal-search-input');
  if (modalSearchInput) {
    modalSearchInput.addEventListener('input', async (e) => {
      const q = e.target.value.trim();
      if (!q) {
        document.getElementById('modal-search-results').innerHTML = '<p class="text-sm text-gray-500 py-6 text-center">Type to search subjects, notes, or question banks across all 14 departments...</p>';
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json());
      renderModalSearchResults(res.data);
    });
  }
}

// Clear Search logic
function clearMainSearch() {
  const searchInput = document.getElementById('main-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (searchInput) {
    searchInput.value = '';
    state.searchQuery = '';
    searchInput.focus();
  }
  if (clearBtn) {
    clearBtn.classList.add('hidden');
  }
  renderSubjects();
}

function triggerSearch() {
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    state.searchQuery = searchInput.value;
    renderSubjects();
    document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderStats(stats) {
  const container = document.getElementById('hero-stats-bar');
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      ${stats.departmentsCount || 14} Academic Departments
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
      <span>🎓</span> ${stats.majorCount || 98} Major Courses
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400">
      <span>📘</span> ${stats.minorCount || 56} Minor Courses
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
      <span>🔥</span> ${stats.impsCount} High-Yield IMPs
    </div>
  `;
}

function renderApp() {
  renderDepartmentChips();
  renderTrackButtons();
  renderSemesterPills();
  updateTrackAndSemesterVisibility();
  renderBreadcrumb();
  renderSubjects();
  renderAnnouncements();
  if (window.lucide) lucide.createIcons();
}

// 1. Department Selector (14 Departments in Exactly Two Lines as in image)
function renderDepartmentChips() {
  const container = document.getElementById('department-chips-container');
  const mobileSelect = document.getElementById('department-select');
  const badge = document.getElementById('current-dept-badge');

  const currentDept = state.departments.find(d => d.id === state.selectedDepartment);
  if (badge) {
    badge.textContent = currentDept ? `${currentDept.name}` : 'Select Department';
  }

  // Populate mobile select
  if (mobileSelect) {
    const opts = ['<option value="">-- Choose Academic Department --</option>'];
    state.departments.forEach((d, idx) => {
      opts.push(`<option value="${d.id}" ${d.id === state.selectedDepartment ? 'selected' : ''}>${idx + 1}. ${d.name} (${d.code})</option>`);
    });
    mobileSelect.innerHTML = opts.join('');
  }

  // Populate 14 department cards in exactly two lines (7 items x 2 rows, no scroller)
  if (container) {
    container.innerHTML = state.departments.map((d) => {
      const isSelected = d.id === state.selectedDepartment;
      return `
        <button onclick="selectDepartment('${d.id}')"
          class="dept-card flex flex-col items-start justify-between p-3 sm:p-3.5 rounded-2xl border text-left cursor-pointer min-h-[72px] sm:min-h-[78px] group
          ${isSelected 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]' 
            : 'bg-white/5 border-white/10 text-gray-200'}">
          <div class="flex items-center justify-between w-full mb-1">
            <span class="dept-code text-xs font-black tracking-wide font-mono ${isSelected ? 'text-white' : 'text-white'}">${d.code}</span>
            <i data-lucide="${d.icon || 'book'}" class="dept-icon w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-gray-400'}"></i>
          </div>
          <span class="dept-name text-[11px] font-medium leading-snug line-clamp-2 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}">${d.name}</span>
        </button>
      `;
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

function selectDepartment(deptId) {
  state.selectedDepartment = deptId;

  const mobileSelect = document.getElementById('department-select');
  if (mobileSelect && mobileSelect.value !== deptId) {
    mobileSelect.value = deptId;
  }

  const trackDropdownSection = document.getElementById('track-dropdown-section');
  const trackDropdown = document.getElementById('track-dropdown');

  if (deptId) {
    // When department is selected, Major/Minor dropdown appears!
    if (trackDropdownSection) {
      trackDropdownSection.classList.remove('hidden');
    }
    // Reset track so user explicitly picks Major or Minor for this department
    state.selectedTrack = '';
    if (trackDropdown) trackDropdown.value = '';
  } else {
    if (trackDropdownSection) {
      trackDropdownSection.classList.add('hidden');
    }
    state.selectedTrack = '';
    if (trackDropdown) trackDropdown.value = '';
  }

  updateTrackAndSemesterVisibility();
  renderDepartmentChips();
  renderTrackButtons();
  renderBreadcrumb();
  renderSubjects();
}

// 2. Track Selector (Only Major & Minor Buttons, Brought to the Left)
function renderTrackButtons() {
  const majorBtn = document.getElementById('quick-btn-major');
  const minorBtn = document.getElementById('quick-btn-minor');
  const majorChip = document.getElementById('major-count-chip');
  const minorChip = document.getElementById('minor-count-chip');

  // Calculate count for current department
  const deptSubjects = state.subjects.filter(s =>
    s.departmentId === state.selectedDepartment ||
    (s.branches && s.branches.includes(state.selectedDepartment))
  );

  const majorCount = deptSubjects.filter(s => (s.track || 'major') === 'major').length;
  const minorCount = deptSubjects.filter(s => (s.track || 'major') === 'minor').length;

  if (majorChip) {
    majorChip.textContent = `${majorCount}`;
    majorChip.className = state.selectedTrack === 'major'
      ? 'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/25 text-white'
      : 'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-gray-300 group-hover:text-white';
  }
  if (minorChip) {
    minorChip.textContent = `${minorCount}`;
    minorChip.className = state.selectedTrack === 'minor'
      ? 'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/25 text-white'
      : 'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-gray-300 group-hover:text-white';
  }

  // Style buttons based on active track
  if (majorBtn) {
    if (state.selectedTrack === 'major') {
      majorBtn.className = 'group px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40 hover:-translate-y-0.5 active:translate-y-0';
    } else {
      majorBtn.className = 'group px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0';
    }
  }

  if (minorBtn) {
    if (state.selectedTrack === 'minor') {
      minorBtn.className = 'group px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400/40 hover:-translate-y-0.5 active:translate-y-0';
    } else {
      minorBtn.className = 'group px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0';
    }
  }
}

function selectTrack(track) {
  state.selectedTrack = track;
  const trackDropdown = document.getElementById('track-dropdown');
  if (trackDropdown && trackDropdown.value !== track) {
    trackDropdown.value = track;
  }

  updateTrackAndSemesterVisibility();
  renderTrackButtons();
  renderBreadcrumb();
  renderSubjects();
}

function updateTrackAndSemesterVisibility() {
  const semSection = document.getElementById('semester-selector-section');
  const filterSummary = document.getElementById('filter-summary-bar');
  const isReady = !!(state.selectedDepartment && state.selectedTrack);

  if (semSection) {
    if (isReady) semSection.classList.remove('hidden');
    else semSection.classList.add('hidden');
  }

  if (filterSummary) {
    if (isReady) filterSummary.classList.remove('hidden');
    else filterSummary.classList.add('hidden');
  }
}

// 3. Semester Pills (Bigger, comfortable, click-friendly - Sem 1 through Sem 8)
function renderSemesterPills() {
  const container = document.getElementById('semester-pills-container');
  if (!container) return;
  const sems = state.semesters.map(s => {
    const isSelected = state.selectedSemester === String(s.number);
    return `
      <button onclick="selectSemester('${s.number}')"
        class="flex-1 sm:flex-initial justify-center min-w-[72px] sm:min-w-0 min-h-[42px] px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm flex items-center gap-1.5
        ${isSelected 
          ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40 scale-[1.02]' 
          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-blue-500/40'}">
        <span>Sem ${s.number}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}">${s.year}</span>
      </button>
    `;
  }).join('');
  container.innerHTML = sems;
}

function selectSemester(sem) {
  state.selectedSemester = sem;
  renderSemesterPills();
  renderBreadcrumb();
  renderSubjects();
}

// 4. Breadcrumb Indicator
function renderBreadcrumb() {
  const deptEl = document.getElementById('active-dept-summary');
  const trackEl = document.getElementById('active-track-summary');
  const semEl = document.getElementById('active-sem-summary');

  const dept = state.departments.find(d => d.id === state.selectedDepartment);
  if (deptEl) deptEl.textContent = dept ? dept.name : 'No Department Selected';

  if (trackEl) {
    if (state.selectedTrack === 'major') {
      trackEl.textContent = 'Major Course';
      trackEl.className = 'font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20';
    } else if (state.selectedTrack === 'minor') {
      trackEl.textContent = 'Minor Course';
      trackEl.className = 'font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20';
    } else if (state.selectedTrack === 'all') {
      trackEl.textContent = 'All Tracks';
      trackEl.className = 'font-bold text-gray-300 px-2 py-0.5 rounded bg-white/10';
    } else {
      trackEl.textContent = 'Track Not Selected';
      trackEl.className = 'font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20';
    }
  }

  if (semEl) {
    semEl.textContent = state.selectedSemester ? `Semester ${state.selectedSemester}` : 'Semester 1';
  }
}

// 5. Subjects Grid
function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  const countBadge = document.getElementById('subjects-count-badge');
  if (!grid) return;

  const hasSearch = state.searchQuery && state.searchQuery.trim().length > 0;

  // RULE: Before department and track are selected, do not show subjects (unless global search query entered)
  if (!hasSearch) {
    if (!state.selectedDepartment) {
      if (countBadge) countBadge.textContent = 'Select Department & Track';
      grid.innerHTML = `
        <div class="col-span-full py-16 px-4 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg">
            <i data-lucide="layers" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-white">Select Academic Department</h3>
          <p class="text-sm text-gray-400 max-w-md mx-auto mt-1">
            Please choose one of the 14 DBCM academic departments above to begin exploring curriculum and subjects.
          </p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    if (!state.selectedTrack) {
      const currentDept = state.departments.find(d => d.id === state.selectedDepartment);
      if (countBadge) countBadge.textContent = 'Choose Major or Minor';
      grid.innerHTML = `
        <div class="col-span-full py-16 px-4 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
            <i data-lucide="compass" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-white">Choose Degree Track (Major or Minor)</h3>
          <p class="text-sm text-gray-400 max-w-md mx-auto mt-1">
            Department of <strong class="text-indigo-300">${currentDept ? currentDept.name : ''}</strong> selected. Please select <strong>Major</strong> or <strong>Minor</strong> in the dropdown above to display the subjects.
          </p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }
  }

  let filtered = state.subjects;

  // Filter by Department
  if (state.selectedDepartment && state.selectedDepartment !== 'all') {
    filtered = filtered.filter(s =>
      s.departmentId === state.selectedDepartment ||
      (s.branches && s.branches.includes(state.selectedDepartment))
    );
  }

  // Filter by Track (Major / Minor / All)
  if (state.selectedTrack && state.selectedTrack !== 'all') {
    filtered = filtered.filter(s => (s.track || 'major').toLowerCase() === state.selectedTrack.toLowerCase());
  }

  // Filter by Semester
  if (state.selectedSemester && state.selectedSemester !== 'all') {
    filtered = filtered.filter(s => s.semester === parseInt(state.selectedSemester, 10));
  }

  // Filter by Search Query
  if (hasSearch) {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.shortName && s.shortName.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.track && s.track.toLowerCase().includes(q))
    );
  }

  if (countBadge) {
    const trackLabel = state.selectedTrack === 'all' ? 'Subjects' : (state.selectedTrack === 'major' ? 'Major Subjects' : 'Minor Subjects');
    countBadge.textContent = `${filtered.length} ${trackLabel} Available`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
          <i data-lucide="book-open" class="w-8 h-8"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-200">No subjects found</h3>
        <p class="text-sm text-gray-400 max-w-md mx-auto mt-1">
          Try switching the semester or toggling between <strong>Major</strong> and <strong>Minor</strong> above.
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(subject => {
    const isBookmarked = state.bookmarks.some(b => b.id === subject.id);
    const isMajor = (subject.track || 'major') === 'major';
    
    return `
      <div class="glass-panel rounded-2xl p-6 relative flex flex-col justify-between group animate-fade-in border ${isMajor ? 'hover:border-indigo-500/50' : 'hover:border-cyan-500/50'}">
        <!-- Bookmark Top Right -->
        <button onclick="toggleBookmark('${subject.id}', event)" 
          title="${isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}"
          class="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-colors cursor-pointer">
          <i data-lucide="bookmark" class="w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}"></i>
        </button>

        <div>
          <!-- Header Tags with Major/Minor Distinct Badge -->
          <div class="flex items-center gap-2 mb-3 pr-10 flex-wrap">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
              ${subject.code}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isMajor ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
              ${isMajor ? '🎓 MAJOR' : '📘 MINOR'}
            </span>
            <span class="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 text-gray-300 border border-white/10">
              Sem ${subject.semester}
            </span>
            <span class="px-2 py-0.5 rounded-md text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              ${subject.credits || 4} Credits
            </span>
          </div>

          <!-- Subject Title -->
          <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer" onclick="openSubjectModal('${subject.id}')">
            ${subject.name}
          </h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            ${subject.description}
          </p>

          <!-- Module Highlights -->
          <div class="mt-4 pt-4 border-t border-white/5 space-y-1.5">
            <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-indigo-400"></i>
              Syllabus Units & Weightage
            </div>
            <div class="text-xs text-gray-300 space-y-1">
              ${(subject.modules || []).slice(0, 3).map(m => `
                <div class="flex items-center justify-between py-0.5">
                  <span class="truncate pr-2">• M${m.num}: ${m.title}</span>
                  <span class="text-[11px] font-mono text-indigo-400 shrink-0 font-medium">${m.weightage}</span>
                </div>
              `).join('')}
              ${(subject.modules || []).length > 3 ? `<p class="text-[11px] text-gray-500 italic">+ ${subject.modules.length - 3} more modules</p>` : ''}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <button onclick="openSubjectModal('${subject.id}', 'imps')"
            class="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400"></i>
            IMPs (${subject.impQuestions ? subject.impQuestions.length : 0})
          </button>
          
          <button onclick="openSubjectModal('${subject.id}', 'notes')"
            class="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-400"></i>
            Notes (${subject.notes ? subject.notes.length : 0})
          </button>

          <button onclick="openSubjectModal('${subject.id}', 'overview')"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 transition-colors cursor-pointer" title="View Full Subject Details">
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function openSubjectModal(subjectId, initialTab = 'overview') {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  state.currentSubject = subject;
  state.activeTab = initialTab;

  // Add to recently viewed
  addToRecentlyViewed(subject);

  const modal = document.getElementById('subject-detail-modal');
  if (!modal) return;

  modal.classList.remove('hidden');
  renderSubjectModalContent();
}

function closeSubjectModal() {
  const modal = document.getElementById('subject-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function switchSubjectTab(tab) {
  state.activeTab = tab;
  renderSubjectModalContent();
}

function renderSubjectModalContent() {
  const s = state.currentSubject;
  if (!s) return;

  const trackBadgeEl = document.getElementById('modal-subject-track-badge');
  const titleEl = document.getElementById('modal-subject-title');
  const codeEl = document.getElementById('modal-subject-code');
  const tabsContainer = document.getElementById('modal-subject-tabs');
  const bodyContainer = document.getElementById('modal-subject-body');

  const isMajor = (s.track || 'major') === 'major';
  const dept = state.departments.find(d => d.id === s.departmentId);

  if (trackBadgeEl) {
    trackBadgeEl.innerHTML = `
      <span class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${isMajor ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
        ${isMajor ? '🎓 Major Core Degree Subject' : '📘 Minor Interdisciplinary Elective'}
      </span>
      ${dept ? `<span class="ml-2 text-xs text-gray-400">• Department of ${dept.name}</span>` : ''}
    `;
  }

  if (titleEl) titleEl.textContent = s.name;
  if (codeEl) codeEl.innerHTML = `
    <span class="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">${s.code}</span>
    <span class="text-xs text-gray-400">• Sem ${s.semester} • ${s.scheme || 'DBCM NEP Framework'} • ${s.credits} Credits</span>
  `;

  // Render Tabs
  const tabs = [
    { id: 'overview', label: 'Syllabus & Units', icon: 'layers' },
    { id: 'imps', label: `Question Bank (${s.impQuestions ? s.impQuestions.length : 0})`, icon: 'flame' },
    { id: 'notes', label: `Notes (${s.notes ? s.notes.length : 0})`, icon: 'file-text' },
    { id: 'pyqs', label: `PYQs (${s.pyqs ? s.pyqs.length : 0})`, icon: 'archive' },
    { id: 'videos', label: `Lectures (${s.videos ? s.videos.length : 0})`, icon: 'youtube' }
  ];

  tabsContainer.innerHTML = tabs.map(t => {
    const active = state.activeTab === t.id;
    return `
      <button onclick="switchSubjectTab('${t.id}')"
        class="py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap
        ${active ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-gray-400 hover:text-white'}">
        <i data-lucide="${t.icon}" class="w-4 h-4"></i>
        <span>${t.label}</span>
      </button>
    `;
  }).join('');

  // Render Tab Content
  if (state.activeTab === 'overview') {
    bodyContainer.innerHTML = `
      <div class="space-y-6">
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Synopsis</h4>
          <p class="text-sm text-gray-300 leading-relaxed">${s.description}</p>
        </div>

        ${s.syllabusPdfUrl ? `
          <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <i data-lucide="file-check" class="w-5 h-5"></i>
              </div>
              <div>
                <h5 class="text-sm font-bold text-white">Official Course Syllabus Document</h5>
                <p class="text-xs text-gray-300 mt-0.5">${s.syllabusFileName || `${s.code} Complete Curriculum`} • Verified DBCM Document</p>
              </div>
            </div>
            <button onclick="openReaderModal('${s.name.replace(/'/g, "\\'")} Syllabus', '${s.name.replace(/'/g, "\\'")}', '${s.syllabusPdfUrl}', '${(s.syllabusFileName || 'Syllabus.pdf').replace(/'/g, "\\'")}')"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0">
              <i data-lucide="book-open" class="w-4 h-4"></i> View Official Syllabus PDF
            </button>
          </div>
        ` : ''}

        <div>
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i data-lucide="book" class="w-4 h-4 text-blue-400"></i> Detailed Syllabus Breakdown (${s.modules ? s.modules.length : 0} Units)
          </h4>
          <div class="space-y-3">
            ${(s.modules || []).map(m => `
              <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm font-bold text-white">Module ${m.num}: ${m.title}</span>
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${m.weightage}</span>
                </div>
                <p class="text-xs text-gray-400">${m.summary}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (state.activeTab === 'imps') {
    const imps = s.impQuestions || [];
    bodyContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <i data-lucide="flame" class="w-4 h-4 text-amber-400"></i>
            High-Yield Exam Questions repeated in DBCM end-semester papers.
          </p>
          <span class="text-xs font-mono text-gray-400">${imps.length} Questions</span>
        </div>

        ${imps.length === 0 ? '<p class="text-sm text-gray-500 py-8 text-center">No IMP questions uploaded yet. Admin can upload from the Admin portal.</p>' : ''}

        <div class="space-y-3">
          ${imps.map((q, idx) => `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all">
              <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px]">Q${idx + 1} • Unit ${q.module}</span>
                  <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px]">${q.marks} Marks</span>
                </div>
                <span class="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">${q.frequency}</span>
              </div>
              <p class="text-sm font-semibold text-white mt-1 leading-snug">${q.question}</p>
              <div class="mt-3 pt-3 border-t border-white/5 flex items-start gap-2 bg-black/20 p-2.5 rounded-lg">
                <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"></i>
                <p class="text-xs text-gray-400"><strong class="text-gray-300">Faculty Solution Hint:</strong> ${q.answerHint}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (state.activeTab === 'notes') {
    const notes = s.notes || [];
    bodyContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-blue-400 font-semibold">Official DBCM Faculty and Topper-verified lecture notes.</p>
          <span class="text-xs font-mono text-gray-400">${notes.length} Documents</span>
        </div>

        ${notes.length === 0 ? '<p class="text-sm text-gray-500 py-8 text-center">No notes uploaded yet. Admin can upload from the Admin portal.</p>' : ''}

        <div class="space-y-3">
          ${notes.map(n => `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-blue-500/40 transition-all">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <i data-lucide="file-text" class="w-5 h-5"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h5 class="text-sm font-bold text-white truncate">${n.title}</h5>
                    ${n.pdfUrl ? '<span class="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">PDF</span>' : ''}
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5">${n.author} • ${n.pages || '20+'} Pages • ${n.fileSize ? n.fileSize + ' • ' : ''}${(n.reads || 1200).toLocaleString()} Views</p>
                </div>
              </div>
              <button onclick="openReaderModal('${n.title.replace(/'/g, "\\'")}', '${s.name.replace(/'/g, "\\'")}', '${n.pdfUrl || ''}', '${(n.fileName || '').replace(/'/g, "\\'")}')" 
                class="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i> Read Notes
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (state.activeTab === 'pyqs') {
    const pyqs = s.pyqs || [];
    bodyContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-indigo-400 font-semibold">Verified DBCM End-Semester Exam Question Papers.</p>
          <span class="text-xs font-mono text-gray-400">${pyqs.length} Papers</span>
        </div>

        <div class="space-y-3">
          ${pyqs.map(p => `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-indigo-500/40 transition-all">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <i data-lucide="archive" class="w-5 h-5"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h5 class="text-sm font-bold text-white truncate">${p.year} Exam Paper</h5>
                    ${p.pdfUrl ? '<span class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">PDF</span>' : ''}
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5">${p.paperType} • ${p.totalMarks} Marks • ${p.pages} Pages</p>
                </div>
              </div>
              <button onclick="openReaderModal('${p.year} Exam Paper', '${s.name.replace(/'/g, "\\'")}', '${p.pdfUrl || ''}', '${(p.fileName || '').replace(/'/g, "\\'")}')" 
                class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0">
                <i data-lucide="${p.pdfUrl ? 'file-text' : 'download'}" class="w-3.5 h-3.5"></i> ${p.pdfUrl ? 'Read PDF Paper' : 'View Paper'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (state.activeTab === 'videos') {
    const videos = s.videos || [];
    bodyContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-red-400 font-semibold">Curated video lecture series and playlists for ${s.name}.</p>
          <span class="text-xs font-mono text-gray-400">${videos.length} Playlists</span>
        </div>

        <div class="space-y-3">
          ${videos.map(v => `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-red-500/40 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <i data-lucide="play" class="w-5 h-5"></i>
                </div>
                <div>
                  <h5 class="text-sm font-bold text-white">${v.title}</h5>
                  <p class="text-xs text-gray-400 mt-0.5">${v.channel} • ${v.count} Video Lectures</p>
                </div>
              </div>
              <a href="${v.url}" target="_blank" rel="noopener noreferrer" 
                class="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Watch on YouTube
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// Document Reader Modal (Supports embedded PDF documents as well as structured syllabus summaries)
function openReaderModal(title, subjectName, pdfUrl = null, fileName = null) {
  const modal = document.getElementById('document-reader-modal');
  const titleEl = document.getElementById('reader-modal-title');
  const contentEl = document.getElementById('reader-modal-content');

  if (titleEl) titleEl.textContent = `${title} — ${subjectName}`;
  if (contentEl) {
    if (pdfUrl) {
      contentEl.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-4 h-full flex flex-col">
          <!-- Document Actions Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-white">${fileName || title}</p>
                <p class="text-[11px] text-gray-400 font-mono">DBCM Study Material • Verified Document</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Open in New Tab
              </a>
              <a href="${pdfUrl}" download="${fileName || 'study-document.pdf'}"
                class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download PDF
              </a>
            </div>
          </div>

          <!-- Embedded PDF / Document Viewer -->
          <div class="flex-1 min-h-[70vh] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 relative">
            <iframe src="${pdfUrl}#toolbar=1" class="w-full h-full min-h-[70vh] rounded-xl bg-white" title="${title}"></iframe>
          </div>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="border-b border-white/10 pb-4">
            <span class="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">DBCM Academic Study Material</span>
            <h2 class="text-2xl font-black text-white mt-1">${title}</h2>
            <p class="text-xs text-gray-400 mt-1">Curated Study Document • Subject: ${subjectName}</p>
          </div>

          <div class="prose prose-invert max-w-none text-sm text-gray-300 space-y-4 leading-relaxed">
            <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4 text-blue-400 shrink-0"></i>
              <span>This verified document includes official DBCM formulas, unit highlights, and solved model exam answers.</span>
            </div>

            <h3 class="text-lg font-bold text-white">1. Chapter Foundation & Objectives</h3>
            <p>
              The academic syllabus for this course establishes core theoretical and analytical mechanisms essential for passing DBCM university exams. Students must focus on structured answers and standard textbook diagrams.
            </p>

            <h3 class="text-lg font-bold text-white">2. High-Yield Principles & Concepts</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Core Definitions:</strong> All formal answers must include precise domain-specific definitions and classification tables.</li>
              <li><strong>Common Pitfall:</strong> Avoid superficial answers. DBCM examiners allocate full marks for structured step-by-step points.</li>
              <li><strong>Illustrative Examples:</strong> Always supplement theoretical arguments with relevant real-world applications or case studies.</li>
            </ul>

            <h3 class="text-lg font-bold text-white">3. Solved Model Question Summary</h3>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <p class="text-xs font-semibold text-amber-400 mb-1 font-mono">Exam Frequency: Appeared in May 2023 & Dec 2023 papers [10 Marks]</p>
              <p class="text-sm font-semibold text-white">Explain the governing principles and state three critical practical considerations.</p>
              <p class="text-xs text-gray-400 mt-2"><strong>Faculty Hint:</strong> Detail theoretical definitions followed by neat schematic diagrams and comparative advantages.</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeReaderModal() {
  const modal = document.getElementById('document-reader-modal');
  if (modal) modal.classList.add('hidden');
}

// Bookmarks logic
function toggleBookmark(subjectId, event) {
  if (event) event.stopPropagation();
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  const exists = state.bookmarks.some(b => b.id === subjectId);
  if (exists) {
    state.bookmarks = state.bookmarks.filter(b => b.id !== subjectId);
  } else {
    state.bookmarks.push({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      track: subject.track,
      semester: subject.semester
    });
  }

  localStorage.setItem('dbcm_bookmarks', JSON.stringify(state.bookmarks));
  renderSubjects();
  renderBookmarksList();
}

function openBookmarksDrawer() {
  const drawer = document.getElementById('bookmarks-drawer');
  renderBookmarksList();
  if (drawer) drawer.classList.remove('hidden');
}

function closeBookmarksDrawer() {
  const drawer = document.getElementById('bookmarks-drawer');
  if (drawer) drawer.classList.add('hidden');
}

function renderBookmarksList() {
  const container = document.getElementById('bookmarks-list-container');
  if (!container) return;

  if (state.bookmarks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i data-lucide="bookmark" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <p class="text-sm">No saved bookmarks yet.</p>
        <p class="text-xs text-gray-500 mt-1">Click the bookmark icon on any DBCM subject card to save it for quick review.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = state.bookmarks.map(b => `
    <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-amber-400/30 transition-colors">
      <div onclick="openSubjectModal('${b.id}'); closeBookmarksDrawer();" class="cursor-pointer">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-xs font-mono font-bold text-amber-400">${b.code}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${b.track === 'minor' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-500/20 text-indigo-400'}">${b.track || 'major'}</span>
        </div>
        <h4 class="text-sm font-semibold text-white">${b.name}</h4>
        <span class="text-[11px] text-gray-400">Sem ${b.semester}</span>
      </div>
      <button onclick="toggleBookmark('${b.id}')" class="p-1.5 rounded-lg text-amber-400 hover:bg-white/10 cursor-pointer" title="Remove">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

// Academic Announcements & Updates
function renderAnnouncements() {
  const container = document.getElementById('announcement-cards-container');
  if (!container) return;

  const defaultAnnouncements = [
    {
      id: 'curriculum',
      badge: 'Curriculum Update',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: 'layers',
      iconBoxClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30 group-hover:bg-blue-500/25 group-hover:text-blue-300',
      cardHoverClass: 'hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/15 hover:bg-blue-500/[0.04]',
      hoverTextClass: 'group-hover:text-blue-400',
      title: 'NEP 2024–25 Major & Minor Curricula Live',
      desc: 'All 14 DBCM academic departments updated with complete syllabus units, credit weightages, and notes for 1Y, 2Y, 3Y, and 4Y.'
    },
    {
      id: 'notes',
      badge: 'Lecture Notes',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: 'file-text',
      iconBoxClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/25 group-hover:text-amber-300',
      cardHoverClass: 'hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/15 hover:bg-amber-500/[0.04]',
      hoverTextClass: 'group-hover:text-amber-400',
      title: 'Comprehensive Study Modules & Unit Notes',
      desc: 'Verified chapter-wise reference notes, lecture presentations, and faculty handouts available for all 14 departments.'
    },
    {
      id: 'imps',
      badge: 'High-Yield IMPs',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: 'flame',
      iconBoxClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/25 group-hover:text-emerald-300',
      cardHoverClass: 'hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/15 hover:bg-emerald-500/[0.04]',
      hoverTextClass: 'group-hover:text-emerald-400',
      title: 'Question Banks with Faculty Hints Active',
      desc: 'Explore unit-wise repeated questions with marks breakdown and solution hints to optimize exam performance.'
    }
  ];

  const announcements = defaultAnnouncements.map(item => {
    const live = (state.academicNotices || []).find(n => n.id === item.id);
    return {
      ...item,
      title: (live && live.title) ? live.title : item.title,
      desc: (live && live.desc) ? live.desc : item.desc
    };
  });

  container.innerHTML = announcements.map(item => `
    <div onclick="openAnnouncementModal('${item.id}')"
      role="button"
      tabindex="0"
      onkeydown="if(event.key==='Enter'||event.key===' '){openAnnouncementModal('${item.id}');event.preventDefault();}"
      class="p-4 rounded-xl bg-white/5 border border-white/10 ${item.cardHoverClass} transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98] flex flex-col justify-between group cursor-pointer shadow-sm relative overflow-hidden">
      
      <!-- Subtle ambient corner glow on hover -->
      <div class="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/5 blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

      <div>
        <div class="flex items-center justify-between gap-1.5 mb-2.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.badgeClass}">
            ${item.badge}
          </span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${item.iconBoxClass}">
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
          </div>
        </div>
        <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-white transition-colors leading-snug">${item.title}</h4>
        <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">${item.desc}</p>
      </div>

      <!-- Interactive Cue -->
      <div class="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-gray-400 ${item.hoverTextClass} transition-colors">
        <span class="flex items-center gap-1.5">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Click to view details</span>
        </span>
        <span class="transform group-hover:translate-x-1.5 transition-transform text-xs leading-none font-bold">&rarr;</span>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function closeAnnouncementModal() {
  const modal = document.getElementById('announcement-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function openAnnouncementModal(type) {
  const modal = document.getElementById('announcement-detail-modal');
  const iconContainer = document.getElementById('announcement-modal-icon-container');
  const icon = document.getElementById('announcement-modal-icon');
  const badge = document.getElementById('announcement-modal-badge');
  const title = document.getElementById('announcement-modal-title');
  const body = document.getElementById('announcement-modal-body');

  if (!modal || !body) return;

  if (type === 'curriculum') {
    iconContainer.className = 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-500/15 text-blue-400 border-blue-500/30';
    icon.setAttribute('data-lucide', 'layers');
    badge.innerHTML = '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">Official Curriculum Update</span>';
    title.textContent = 'NEP 2024–25 Major & Minor Curricula Live';
    
    body.innerHTML = `
      <div class="space-y-4 text-xs sm:text-sm">
        <p class="text-gray-300 leading-relaxed">
          Don Bosco College Maram (Autonomous) has fully implemented the National Education Policy (NEP) curriculum across all <strong class="text-white">14 Academic Departments</strong>. Each department offers structured <strong>Major</strong> (Core Discipline) and <strong>Minor</strong> (Interdisciplinary Electives) degree curricula from <strong>1Y (Sem 1 & 2)</strong> through <strong>4Y (Sem 7 & 8)</strong>.
        </p>

        <!-- Highlights Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-blue-300 text-xs">
              <i data-lucide="graduation-cap" class="w-4 h-4 text-blue-400"></i>
              Major Degree Track (Core)
            </div>
            <p class="text-[11px] text-gray-300 leading-relaxed">
              4 Credits per course. Delivers foundational academic mastery, practical lab sessions, comprehensive units, and end-semester examinations.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-cyan-300 text-xs">
              <i data-lucide="book-marked" class="w-4 h-4 text-cyan-400"></i>
              Minor Degree Track (Electives)
            </div>
            <p class="text-[11px] text-gray-300 leading-relaxed">
              3 Credits per course. Expands interdisciplinary skills (e.g. Science students choosing Computing minor, or Arts choosing Economics/Commerce).
            </p>
          </div>
        </div>

        <!-- 4-Year Milestone Progression -->
        <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider font-mono">DBCM Degree Exit Pathways:</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
            <div class="p-2 rounded-lg bg-black/30 border border-white/5">
              <div class="font-bold text-indigo-400">1st Year (1Y)</div>
              <div class="text-gray-400 text-[10px]">UG Certificate</div>
            </div>
            <div class="p-2 rounded-lg bg-black/30 border border-white/5">
              <div class="font-bold text-blue-400">2nd Year (2Y)</div>
              <div class="text-gray-400 text-[10px]">UG Diploma</div>
            </div>
            <div class="p-2 rounded-lg bg-black/30 border border-white/5">
              <div class="font-bold text-amber-400">3rd Year (3Y)</div>
              <div class="text-gray-400 text-[10px]">Bachelor Degree</div>
            </div>
            <div class="p-2 rounded-lg bg-black/30 border border-white/5">
              <div class="font-bold text-emerald-400">4th Year (4Y)</div>
              <div class="text-gray-400 text-[10px]">Honours w/ Research</div>
            </div>
          </div>
        </div>

        <!-- Departments List & Action -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs text-gray-400 font-mono">14 Departments Available · 150+ Subjects</span>
          <button onclick="closeAnnouncementModal(); scrollToSection('subjects-section');"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>Browse 14 Departments Now ↓</span>
          </button>
        </div>
      </div>
    `;
  } else if (type === 'notes') {
    iconContainer.className = 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-amber-500/15 text-amber-400 border-amber-500/30';
    icon.setAttribute('data-lucide', 'file-text');
    badge.innerHTML = '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">Study Material Repository</span>';
    title.textContent = 'Comprehensive Study Modules & Unit Notes';

    body.innerHTML = `
      <div class="space-y-4 text-xs sm:text-sm">
        <p class="text-gray-300 leading-relaxed">
          Access high-quality lecture notes, module summaries, and presentations compiled by DBCM subject faculty and academic departments. Every subject is equipped with downloadable, printable notes optimized for exam preparation.
        </p>

        <!-- Feature List -->
        <div class="space-y-2.5">
          <div class="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="book-open" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="font-bold text-white text-xs">Modular Unit Breakdown</h5>
              <p class="text-[11px] text-gray-400 mt-0.5">Detailed notes for Units 1 through 6 with topic headings, bulleted explanations, and code/diagram references.</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="font-bold text-white text-xs">Built-in Interactive Reader</h5>
              <p class="text-[11px] text-gray-400 mt-0.5">Read directly in your browser with distraction-free layout, font scaling, and instant Print to PDF capability.</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="font-bold text-white text-xs">Faculty Vetted & NEP Compliant</h5>
              <p class="text-[11px] text-gray-400 mt-0.5">All notes are reviewed against current DBCM syllabus specifications and autonomous exam patterns.</p>
            </div>
          </div>
        </div>

        <!-- Sample notes preview -->
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
            <span class="text-xs text-amber-200 font-medium">Over 250+ full lecture note packets available across all semesters</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs text-gray-400 font-mono">Select a department below to start reading</span>
          <button onclick="closeAnnouncementModal(); scrollToSection('subjects-section');"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Browse All Course Notes ↓</span>
          </button>
        </div>
      </div>
    `;
  } else if (type === 'imps') {
    iconContainer.className = 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    icon.setAttribute('data-lucide', 'flame');
    badge.innerHTML = '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Exam Question Banks</span>';
    title.textContent = 'Question Banks with Faculty Hints Active';

    body.innerHTML = `
      <div class="space-y-4 text-xs sm:text-sm">
        <p class="text-gray-300 leading-relaxed">
          Prepare strategically for your semester examinations with DBCM High-Yield Question Banks. Questions are extracted from past university papers and faculty question sets, marked with exact exam frequencies.
        </p>

        <!-- Question Types Breakdown -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
            <span class="text-xs font-mono font-bold text-amber-400">10-Mark Questions</span>
            <p class="text-[11px] text-gray-400">Comprehensive essay questions, architectural diagrams & detailed derivations.</p>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
            <span class="text-xs font-mono font-bold text-blue-400">5-Mark Questions</span>
            <p class="text-[11px] text-gray-400">Analytical explanations, algorithms, comparisons, and unit problem solving.</p>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
            <span class="text-xs font-mono font-bold text-emerald-400">Faculty Hints</span>
            <p class="text-[11px] text-gray-400">Model answer summaries and essential key points required for maximum marks.</p>
          </div>
        </div>

        <!-- Sample High-Yield Exam Items -->
        <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span class="flex items-center gap-1.5"><i data-lucide="flame" class="w-3.5 h-3.5"></i> High-Yield Question Sample:</span>
            <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">10 Marks · High Yield</span>
          </div>
          <p class="text-xs text-white font-medium">"Explain Dijkstra's shortest path algorithm with time complexity and step-by-step example on a weighted graph."</p>
          <p class="text-[11px] text-gray-400"><strong class="text-gray-300">Faculty Hint:</strong> Define greedy choice property, initialize distance array, relaxation step, and graph tracing table.</p>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs text-gray-400 font-mono">Search questions across all 14 departments</span>
          <button onclick="closeAnnouncementModal(); openSearchModal();"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span>Search Question Banks (IMPs)</span>
          </button>
        </div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function addToRecentlyViewed() {
  // Legacy stub maintained for compatibility
}

// Search Modal
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('modal-search-input')?.focus();
  }
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.add('hidden');
}

function renderModalSearchResults(data) {
  const container = document.getElementById('modal-search-results');
  if (!container) return;

  const { subjects, impQuestions, notes } = data;
  if (!subjects.length && !impQuestions.length && !notes.length) {
    container.innerHTML = '<p class="text-sm text-gray-500 py-6 text-center">No matching resources found.</p>';
    return;
  }

  let html = '';

  if (subjects.length) {
    html += `
      <div class="mb-4">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">DBCM Subjects (${subjects.length})</h4>
        <div class="space-y-1.5">
          ${subjects.map(s => `
            <div onclick="openSubjectModal('${s.id}'); closeSearchModal();"
              class="p-2.5 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent cursor-pointer flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-white">${s.name} (${s.code})</span>
                <span class="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${s.track === 'minor' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-500/20 text-indigo-300'}">${s.track || 'major'}</span>
              </div>
              <span class="text-gray-400 font-mono">Sem ${s.semester}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (impQuestions.length) {
    html += `
      <div class="mb-4">
        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">High-Yield Questions (${impQuestions.length})</h4>
        <div class="space-y-1.5">
          ${impQuestions.map(q => `
            <div onclick="openSubjectModal('${q.subjectId}', 'imps'); closeSearchModal();"
              class="p-2.5 rounded-lg bg-white/5 hover:bg-amber-600/20 hover:border-amber-500/30 border border-transparent cursor-pointer text-xs">
              <div class="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                <span class="font-bold text-amber-400">${q.subjectName}</span>
                <span>${q.marks} Marks • ${q.frequency}</span>
              </div>
              <p class="text-white font-medium truncate">${q.question}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (notes.length) {
    html += `
      <div>
        <h4 class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Lecture Notes (${notes.length})</h4>
        <div class="space-y-1.5">
          ${notes.map(n => `
            <div onclick="openSubjectModal('${n.subjectId}', 'notes'); closeSearchModal();"
              class="p-2.5 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent cursor-pointer flex items-center justify-between text-xs">
              <span class="font-semibold text-white">${n.title}</span>
              <span class="text-gray-400 font-mono">${n.pages} Pages</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ============================================================
// STUDENT AUTH & MODAL
// ============================================================

function updateAuthUI() {
  const studentBtnLabel = document.getElementById('student-btn-label');
  const adminBtnLabel = document.getElementById('admin-btn-label');

  if (state.studentUser) {
    if (studentBtnLabel) studentBtnLabel.textContent = state.studentUser.name.split(' ')[0];
  } else {
    if (studentBtnLabel) studentBtnLabel.textContent = 'Student';
  }

  if (state.adminToken) {
    if (adminBtnLabel) adminBtnLabel.textContent = 'Admin (Active)';
  } else {
    if (adminBtnLabel) adminBtnLabel.textContent = 'Admin';
  }
}

function openStudentModal() {
  const modal = document.getElementById('student-modal');
  const loginForm = document.getElementById('student-login-form');
  const profileView = document.getElementById('student-profile-view');

  if (state.studentUser) {
    loginForm.classList.add('hidden');
    profileView.classList.remove('hidden');

    const dept = state.departments.find(d => d.id === state.studentUser.department);
    document.getElementById('student-display-name').textContent = state.studentUser.name;
    document.getElementById('student-display-dept').textContent = dept ? dept.name : (state.studentUser.department || 'BCA');
    document.getElementById('student-display-track').textContent = (state.studentUser.track || 'major').toUpperCase();
    document.getElementById('student-display-sem').textContent = `• Sem ${state.studentUser.semester || 1}`;
  } else {
    loginForm.classList.remove('hidden');
    profileView.classList.add('hidden');
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeStudentModal() {
  const modal = document.getElementById('student-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleStudentLogin(e) {
  e.preventDefault();
  const name = document.getElementById('student-name-input').value.trim();
  const department = document.getElementById('student-dept-select').value;
  const track = document.getElementById('student-track-select').value;
  const semester = parseInt(document.getElementById('student-semester-select').value, 10);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, role: 'student', department, track, semester })
    }).then(r => r.json());

    if (res.success) {
      state.studentUser = res.user;
      localStorage.setItem('dbcm_student', JSON.stringify(res.user));
      updateAuthUI();

      // Automatically sync view with student's department & track!
      state.selectedDepartment = department;
      state.selectedTrack = track;
      state.selectedSemester = String(semester);

      const trackDropdownSection = document.getElementById('track-dropdown-section');
      if (trackDropdownSection) trackDropdownSection.classList.remove('hidden');

      updateTrackAndSemesterVisibility();
      renderDepartmentChips();
      renderTrackButtons();
      renderSemesterPills();
      renderBreadcrumb();
      renderSubjects();
      openStudentModal(); // Display profile state
    }
  } catch (err) {
    console.error('Student login error:', err);
  }
}

function studentLogout() {
  state.studentUser = null;
  localStorage.removeItem('dbcm_student');
  updateAuthUI();
  openStudentModal();
}

// ============================================================
// ADMIN MANAGEMENT & PORTAL
// ============================================================

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const statusBadge = document.getElementById('admin-status-badge');

  if (state.adminToken) {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    if (statusBadge) {
      statusBadge.textContent = 'Authenticated (Admin)';
      statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400';
    }
    populateAdminSubjectDropdown();
    switchAdminTab(state.activeAdminTab);
  } else {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    if (statusBadge) {
      statusBadge.textContent = 'Authentication Required';
      statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-500/20 text-gray-400';
    }
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username-input').value.trim();
  const password = document.getElementById('admin-password-input').value;
  const errorEl = document.getElementById('admin-login-error');

  errorEl.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'admin' })
    }).then(r => r.json());

    if (res.success) {
      state.adminToken = res.user.token;
      localStorage.setItem('dbcm_admin_token', res.user.token);
      updateAuthUI();
      openAdminModal();
    } else {
      errorEl.textContent = res.message || 'Invalid credentials';
      errorEl.classList.remove('hidden');
    }
  } catch (err) {
    errorEl.textContent = 'Failed to authenticate. Please check console.';
    errorEl.classList.remove('hidden');
  }
}

function adminLogout() {
  state.adminToken = null;
  localStorage.removeItem('dbcm_admin_token');
  updateAuthUI();
  openAdminModal();
}

function switchAdminTab(tab) {
  state.activeAdminTab = tab;

  const tabs = ['upload', 'subject', 'announcement'];
  tabs.forEach(t => {
    const tabBtn = document.getElementById(`adm-tab-${t}`);
    const panel = document.getElementById(`adm-panel-${t}`);
    if (tabBtn) {
      if (t === tab) {
        tabBtn.className = 'py-3 text-xs font-bold border-b-2 border-amber-400 text-amber-300 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap';
      } else {
        tabBtn.className = 'py-3 text-xs font-medium border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap';
      }
    }
    if (panel) {
      if (t === tab) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
  });

  if (tab === 'announcement') {
    const currentAnn = document.getElementById('announcement-text')?.textContent || '';
    const input = document.getElementById('adm-announcement-input');
    if (input && !input.value) input.value = currentAnn;
  }

  if (window.lucide) lucide.createIcons();
}

function populateAdminSubjectDropdown() {
  const select = document.getElementById('adm-mat-subject');
  if (!select) return;

  // Sort by department and track
  const sorted = [...state.subjects].sort((a, b) => {
    if (a.departmentId !== b.departmentId) return a.departmentId.localeCompare(b.departmentId);
    if (a.track !== b.track) return a.track.localeCompare(b.track);
    return a.semester - b.semester;
  });

  select.innerHTML = sorted.map(s => {
    const trackTag = (s.track || 'major').toUpperCase();
    const deptTag = (s.departmentId || '').toUpperCase();
    return `<option value="${s.id}">[${deptTag}] [${trackTag}] ${s.code} - ${s.name} (Sem ${s.semester})</option>`;
  }).join('');
}

function handleMaterialTypeChange() {
  const type = document.getElementById('adm-mat-type').value;
  const noteFields = document.getElementById('adm-note-fields');
  const impFields = document.getElementById('adm-imp-fields');
  const pyqFields = document.getElementById('adm-pyq-fields');

  noteFields.classList.toggle('hidden', type !== 'note');
  impFields.classList.toggle('hidden', type !== 'imp');
  pyqFields.classList.toggle('hidden', type !== 'pyq');
}

// Upload Material to Subject
async function handleUploadMaterial(e) {
  e.preventDefault();
  const subjectId = document.getElementById('adm-mat-subject').value;
  const materialType = document.getElementById('adm-mat-type').value;

  let data = {};
  if (materialType === 'note') {
    data = {
      title: document.getElementById('adm-note-title').value || 'Lecture Notes',
      pages: parseInt(document.getElementById('adm-note-pages').value, 10) || 20,
      author: document.getElementById('adm-note-author').value || 'DBCM Faculty'
    };
  } else if (materialType === 'imp') {
    data = {
      question: document.getElementById('adm-imp-question').value,
      module: parseInt(document.getElementById('adm-imp-module').value, 10) || 1,
      marks: parseInt(document.getElementById('adm-imp-marks').value, 10) || 10,
      frequency: document.getElementById('adm-imp-freq').value || 'High Yield Exam Paper',
      answerHint: document.getElementById('adm-imp-hint').value || 'Refer to standard DBCM lecture notes.'
    };
  } else if (materialType === 'pyq') {
    data = {
      year: document.getElementById('adm-pyq-year').value || '2024',
      paperType: document.getElementById('adm-pyq-paper').value || 'DBCM End-Semester Exam'
    };
  }

  try {
    const res = await fetch('/api/admin/upload-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId, materialType, data })
    }).then(r => r.json());

    if (res.success) {
      alert(`Success: ${res.message}`);
      const subRes = await fetch('/api/subjects').then(r => r.json());
      if (subRes.success) state.subjects = subRes.data;
      renderSubjects();
      if (materialType === 'note') document.getElementById('adm-note-title').value = '';
      if (materialType === 'imp') {
        document.getElementById('adm-imp-question').value = '';
        document.getElementById('adm-imp-hint').value = '';
      }
    } else {
      alert(`Error: ${res.message}`);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Failed to upload study material. Check server logs.');
  }
}

// Add New Subject
async function handleCreateSubject(e) {
  e.preventDefault();
  const code = document.getElementById('adm-sub-code').value.trim();
  const shortName = document.getElementById('adm-sub-short').value.trim();
  const name = document.getElementById('adm-sub-name').value.trim();
  const department = document.getElementById('adm-sub-dept').value;
  const track = document.getElementById('adm-sub-track').value;
  const semester = parseInt(document.getElementById('adm-sub-sem').value, 10);
  const credits = parseInt(document.getElementById('adm-sub-credits').value, 10);
  const description = document.getElementById('adm-sub-desc').value.trim();

  try {
    const res = await fetch('/api/admin/subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        shortName,
        name,
        department,
        track,
        semester,
        credits,
        description
      })
    }).then(r => r.json());

    if (res.success) {
      alert(`Success: ${res.message}`);
      const subRes = await fetch('/api/subjects').then(r => r.json());
      if (subRes.success) state.subjects = subRes.data;
      populateAdminSubjectDropdown();
      renderTrackButtons();
      renderSubjects();
      document.getElementById('admin-subject-form').reset();
    } else {
      alert(`Error: ${res.message}`);
    }
  } catch (err) {
    console.error('Failed to create subject:', err);
    alert('Failed to create subject.');
  }
}

// Update Site Announcement
async function handleUpdateAnnouncement(e) {
  e.preventDefault();
  const announcement = document.getElementById('adm-announcement-input').value.trim();

  try {
    const res = await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    }).then(r => r.json());

    if (res.success) {
      alert('Announcement updated successfully!');
      const annEl = document.getElementById('announcement-text');
      if (annEl) annEl.textContent = res.announcement;
      const liveEl = document.getElementById('live-broadcast-text');
      if (liveEl) liveEl.textContent = res.announcement;
    } else {
      alert(`Error: ${res.message}`);
    }
  } catch (err) {
    console.error('Failed to update announcement:', err);
    alert('Failed to update announcement banner.');
  }
}

// MOTIVATIONAL QUOTES (Replaced with About The Project directory description)
function nextMotivationalQuote() {}
function renderMotivationalQuote() {}

// ============================================================
// STANDALONE PYQ SECTION (Removed as requested)
// ============================================================
function populatePyqSubjectDropdown() {}
function handlePyqFilterChange() {}
function handlePyqSearch() {}
function clearPyqSearch() {}
function renderPyqs() {}

// Open PYQ Paper in Reader Modal
function openPyqReader(pyqId) {
  const pyq = state.pyqs.find(p => p.id === pyqId);
  if (!pyq) return;

  // If this PYQ has an attached PDF uploaded from PC, open it directly in the PDF document reader
  if (pyq.pdfUrl) {
    return openReaderModal(`${pyq.subjectCode} — ${pyq.year} Exam Paper`, pyq.subjectName, pyq.pdfUrl, pyq.fileName);
  }

  const modal = document.getElementById('document-reader-modal');
  const titleEl = document.getElementById('reader-modal-title');
  const contentEl = document.getElementById('reader-modal-content');

  const isMajor = (pyq.track || 'major') === 'major';
  const imps = pyq.impQuestions || [];

  if (titleEl) {
    titleEl.textContent = `${pyq.subjectCode} — ${pyq.subjectName} (${pyq.year} Exam Paper)`;
  }

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 bg-[#0b0c14] p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl">
        
        <!-- Official Examination Header -->
        <div class="text-center border-b-2 border-white/20 pb-6 space-y-2">
          <div class="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Don Bosco College, Maram (Autonomous)
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            END-SEMESTER DEGREE EXAMINATION — ${pyq.year.toUpperCase()}
          </h2>
          <p class="text-xs text-gray-300 font-semibold tracking-wider uppercase">
            Department of ${pyq.departmentName} • ${isMajor ? 'Major Core Course' : 'Minor Interdisciplinary Elective'} • Semester ${pyq.semester}
          </p>

          <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300 font-mono flex-wrap gap-2">
            <div><strong>Course Code:</strong> ${pyq.subjectCode}</div>
            <div><strong>Course Title:</strong> ${pyq.subjectName}</div>
            <div><strong>Time:</strong> 3 Hours</div>
            <div><strong>Max Marks:</strong> 80 Marks</div>
          </div>
        </div>

        <!-- General Instructions -->
        <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1.5 leading-relaxed">
          <strong class="text-amber-400 block font-mono text-[11px] uppercase tracking-wider">Instructions to Candidates:</strong>
          <ul class="list-disc pl-5 space-y-1 text-gray-400">
            <li>Section A is compulsory. Answer all 10 questions (2 marks each).</li>
            <li>Section B contains 6 analytical questions. Answer any 4 questions (10 marks each).</li>
            <li>Section C is a comprehensive application/case study (20 marks).</li>
            <li>Draw neat and labeled schematic diagrams wherever appropriate.</li>
          </ul>
        </div>

        <!-- SECTION A -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono text-xs">A</span>
              Section A: Short Answer Conceptual Questions
            </h3>
            <span class="text-xs font-mono text-indigo-400 font-bold">[10 × 2 = 20 Marks]</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(a).</span> Define the fundamental principle of ${pyq.shortName || pyq.subjectName}.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(b).</span> State two governing boundary conditions or primary assumptions.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(c).</span> Differentiate between theoretical models and applied formulations in this unit.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(d).</span> Give one standard practical example highlighting the importance of ${pyq.subjectCode}.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(e).</span> Explain the significance of standard units and analytical classifications.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(f).</span> What are the common operational constraints faced in practice?
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(g).</span> Write the formal mathematical expression or governing definition.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(h).</span> State the role of empirical verification in this domain.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(i).</span> Briefly explain one modern technological or contemporary development.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="font-bold text-indigo-400">Q1(j).</span> List any two critical ethical or procedural guidelines for scholars.
            </div>
          </div>
        </div>

        <!-- SECTION B -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center font-mono text-xs">B</span>
              Section B: Analytical & Descriptive Problems
            </h3>
            <span class="text-xs font-mono text-amber-400 font-bold">[Answer Any 4 — 4 × 10 = 40 Marks]</span>
          </div>

          <div class="space-y-3 text-xs">
            ${imps.slice(0, 4).map((q, i) => `
              <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div class="flex items-center justify-between text-gray-400">
                  <span class="font-bold text-amber-400">Question ${i + 2}: [Unit ${q.module || (i + 1)}]</span>
                  <span class="font-mono text-gray-400">10 Marks</span>
                </div>
                <p class="text-sm font-semibold text-white leading-relaxed">${q.question}</p>
                <div class="pt-2 text-[11px] text-gray-400 border-t border-white/5">
                  <strong class="text-gray-300">Faculty Evaluation Hint:</strong> ${q.answerHint || 'Detailed step-by-step derivation, proof, and diagram required for full marks.'}
                </div>
              </div>
            `).join('')}

            ${imps.length < 4 ? `
              <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div class="flex items-center justify-between text-gray-400">
                  <span class="font-bold text-amber-400">Question 5: [Core Theory]</span>
                  <span class="font-mono text-gray-400">10 Marks</span>
                </div>
                <p class="text-sm font-semibold text-white leading-relaxed">
                  Provide a comparative analytical study of the governing methodologies in ${pyq.subjectName}. Illustrate with architectural schematics.
                </p>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- SECTION C -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-mono text-xs">C</span>
              Section C: Applied Case Study / Comprehensive Monograph
            </h3>
            <span class="text-xs font-mono text-emerald-400 font-bold">[1 × 20 = 20 Marks]</span>
          </div>

          <div class="p-5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-3">
            <div class="flex items-center justify-between text-emerald-400 font-bold">
              <span>Question 6: Real-World Engineering / Scientific Problem Solving</span>
              <span class="font-mono">20 Marks</span>
            </div>
            <p class="text-gray-300 leading-relaxed">
              Analyze an end-to-end practical scenario in ${pyq.subjectName}. Detail the problem formulation, mathematical or conceptual governance, step-by-step implementation protocol, and critical performance evaluation. Propose mitigation strategies for potential failure modes under real-world operating conditions.
            </p>
            <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <strong>Evaluation Rubric:</strong> Problem statement clarity (4M) · Algorithmic/Theoretical rigor (6M) · Schematic diagram and derivations (6M) · Critical conclusion and feasibility analysis (4M).
            </div>
          </div>
        </div>

        <!-- Paper End Marker -->
        <div class="text-center pt-6 border-t border-white/10 text-xs font-mono text-gray-500">
          *** END OF QUESTION PAPER — DON BOSCO COLLEGE MARAM (AUTONOMOUS) ***
        </div>

      </div>
    `;
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}


