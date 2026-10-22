const state = {
  departments: [],
  semesters: [],
  subjects: [],
  notices: [],
  resources: [],
  lectures: [],
  selection: { department: '', track: '', semester: '', subject: '' },
  search: '',
  activeCategory: '',
  theme: localStorage.getItem('dbcm-theme') === 'dark' ? 'dark' : 'light'
};

const elements = {
  department: document.getElementById('department-select'),
  track: document.getElementById('track-select'),
  semester: document.getElementById('semester-select'),
  subject: document.getElementById('subject-select'),
  search: document.getElementById('course-search'),
  list: document.getElementById('subject-list'),
  resultCount: document.getElementById('result-count'),
  status: document.getElementById('status-message'),
  noticeList: document.getElementById('notice-list'),
  selectedCourse: document.getElementById('selected-course'),
  resourcePanel: document.getElementById('resource-panel'),
  resourceList: document.getElementById('resource-list')
};

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  document.documentElement.dataset.theme = state.theme;
  updateThemeButton();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  const menuButton = document.getElementById('menu-toggle');
  const navigation = document.getElementById('main-navigation');
  menuButton.addEventListener('click', () => setNavigationOpen(menuButton, navigation, menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavigationOpen(menuButton, navigation, false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setNavigationOpen(menuButton, navigation, false);
  });
  elements.department.addEventListener('change', selectDepartment);
  elements.track.addEventListener('change', selectTrack);
  elements.semester.addEventListener('change', selectSemester);
  elements.subject.addEventListener('change', () => selectSubject(elements.subject.value));
  elements.search.addEventListener('input', () => {
    state.search = elements.search.value.trim().toLocaleLowerCase();
    renderSubjectChoices();
  });
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => showResources(button.dataset.category)));
  document.getElementById('close-resources').addEventListener('click', () => { elements.resourcePanel.hidden = true; });

  try {
    const [departments, semesters, subjects, notices] = await Promise.all([
      api('/api/departments'), api('/api/semesters'), api('/api/subjects'), api('/api/notices')
    ]);
    state.departments = departments.data || [];
    state.semesters = semesters.data || [];
    state.subjects = subjects.data || [];
    state.notices = notices.data || [];
    fillSelect(elements.department, state.departments, 'Select programme', item => item.id, item => `${item.name} (${item.code})`);
    renderNotices();
    setStatus(`${state.departments.length} programmes · ${state.subjects.length} subjects`, 'success');
  } catch (error) {
    setStatus('The catalogue could not be loaded. Please open this site through the Node server and try again.', 'error');
    renderNotices(error.message);
    return;
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, { cache: 'no-store', ...options });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
  return result;
}

function fillSelect(select, items, placeholder, valueOf, labelOf) {
  select.replaceChildren(new Option(placeholder, ''));
  items.forEach(item => select.add(new Option(labelOf(item), valueOf(item))));
  select.value = '';
}

function selectDepartment() {
  state.selection.department = elements.department.value;
  state.selection.track = '';
  state.selection.semester = '';
  clearSelectedSubject();
  const tracks = [...new Set(state.subjects.filter(subject => subject.departmentId === state.selection.department).map(subject => subject.track || 'major'))];
  fillSelect(elements.track, tracks.map(track => ({ track })), 'Select track', item => item.track, item => item.track === 'major' ? 'Major' : 'Minor');
  elements.track.disabled = !state.selection.department || tracks.length === 0;
  clearSelect(elements.semester, 'Select semester');
  clearSelect(elements.subject, 'Select subject');
  renderSubjectChoices();
}

function selectTrack() {
  state.selection.track = elements.track.value;
  state.selection.semester = '';
  clearSelectedSubject();
  const semesters = [...new Set(state.subjects.filter(matchesSelectionWithoutSemester).map(subject => Number(subject.semester)))].sort((a, b) => a - b);
  fillSelect(elements.semester, semesters, 'Select semester', value => value, value => `Semester ${value}`);
  elements.semester.disabled = !state.selection.track;
  clearSelect(elements.subject, 'Select subject');
  renderSubjectChoices();
}

function selectSemester() {
  state.selection.semester = elements.semester.value;
  clearSelectedSubject();
  elements.subject.disabled = !state.selection.semester;
  renderSubjectChoices();
}

function matchesSelectionWithoutSemester(subject) {
  return subject.departmentId === state.selection.department && (subject.track || 'major') === state.selection.track;
}

function selectedSubjects() {
  return state.subjects.filter(subject => {
    if (state.selection.department && subject.departmentId !== state.selection.department) return false;
    if (state.selection.track && (subject.track || 'major') !== state.selection.track) return false;
    if (state.selection.semester && String(subject.semester) !== state.selection.semester) return false;
    if (state.search && !`${subject.name} ${subject.code} ${subject.shortName || ''}`.toLocaleLowerCase().includes(state.search)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function renderSubjectChoices() {
  const subjects = selectedSubjects();
  const current = state.selection.subject;
  fillSelect(elements.subject, subjects, subjects.length ? 'Select subject' : 'No matching subjects', item => item.id, item => `${item.code} · ${item.name}`);
  elements.subject.disabled = !(state.selection.department && state.selection.track && state.selection.semester) || subjects.length === 0;
  if (subjects.some(subject => subject.id === current)) elements.subject.value = current;
  else if (current) clearSelectedSubject();
  elements.resultCount.textContent = `${subjects.length} subject${subjects.length === 1 ? '' : 's'}`;
  renderSubjectList(subjects);
}

function renderSubjectList(subjects) {
  elements.list.replaceChildren();
  if (!state.selection.department) {
    elements.list.append(makeMessage('Select a programme to see its subjects.'));
    return;
  }
  if (subjects.length === 0) {
    elements.list.append(makeMessage('No subjects match these selections.'));
    return;
  }

  subjects.forEach(subject => {
    const row = document.createElement('article');
    row.className = 'subject-row';
    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = subject.name;
    const meta = document.createElement('p');
    meta.textContent = `${subject.code} · ${subject.track === 'minor' ? 'Minor' : 'Major'} · Semester ${subject.semester}`;
    info.append(title, meta);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Select subject';
    button.setAttribute('aria-label', `Select ${subject.name}`);
    button.addEventListener('click', () => {
      if (elements.subject.value !== subject.id) elements.subject.value = subject.id;
      selectSubject(subject.id);
      document.getElementById('course-finder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    row.append(info, button);
    elements.list.append(row);
  });
}

async function selectSubject(subjectId) {
  const subject = state.subjects.find(item => item.id === subjectId);
  if (!subject) {
    elements.selectedCourse.hidden = true;
    return;
  }
  state.selection.department = subject.departmentId;
  state.selection.track = subject.track || 'major';
  state.selection.semester = String(subject.semester);
  state.selection.subject = subjectId;
  elements.department.value = state.selection.department;
  const tracks = [...new Set(state.subjects.filter(matchesSelectionWithoutSemester).map(item => item.track || 'major'))];
  fillSelect(elements.track, tracks.map(track => ({ track })), 'Select track', item => item.track, item => item.track === 'major' ? 'Major' : 'Minor');
  elements.track.disabled = false;
  elements.track.value = state.selection.track;
  const semesters = [...new Set(state.subjects.filter(matchesSelectionWithoutSemester).map(item => Number(item.semester)))].sort((a, b) => a - b);
  fillSelect(elements.semester, semesters, 'Select semester', value => value, value => `Semester ${value}`);
  elements.semester.disabled = false;
  elements.semester.value = state.selection.semester;
  renderSubjectChoices();
  elements.subject.value = subjectId;
  document.getElementById('course-context').textContent = `${departmentName(subject.departmentId)} · ${subject.track === 'minor' ? 'Minor' : 'Major'} · Semester ${subject.semester}`;
  document.getElementById('course-name').textContent = subject.name;
  document.getElementById('course-code').textContent = subject.code;
  document.getElementById('course-description').textContent = subject.description || '';
  renderOutline(subject.modules || []);
  elements.selectedCourse.hidden = false;
  elements.resourcePanel.hidden = true;
  document.querySelectorAll('.resource-count').forEach(button => { button.disabled = false; button.setAttribute('aria-pressed', 'false'); });
  try {
    const [resources, lectures] = await Promise.all([
      api(`/api/resources?subjectId=${encodeURIComponent(subjectId)}`),
      api(`/api/lectures?subjectId=${encodeURIComponent(subjectId)}`)
    ]);
    state.resources = resources.data || [];
    state.lectures = lectures.data || [];
    const counts = {
      pdf: state.resources.filter(item => item.category === 'pdf').length,
      pyqs: state.resources.filter(item => item.category === 'pyqs').length,
      notes: state.resources.filter(item => item.category === 'notes').length,
      lectures: state.lectures.length
    };
    Object.entries(counts).forEach(([key, value]) => { document.getElementById(`count-${key}`).textContent = String(value); });
    setStatus(`${subject.code} selected`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

function renderOutline(modules) {
  const details = document.getElementById('syllabus-details');
  const list = document.getElementById('course-outline');
  list.replaceChildren();
  modules.forEach(module => {
    if (!module.title && !module.summary) return;
    const item = document.createElement('div');
    item.className = 'outline-item';
    const title = document.createElement('strong');
    title.textContent = `Unit ${module.num}: ${module.title || 'Course unit'}`;
    item.append(title);
    if (module.summary) {
      const summary = document.createElement('span');
      summary.textContent = module.summary;
      item.append(summary);
    }
    list.append(item);
  });
  details.hidden = list.childElementCount === 0;
}

function showResources(category) {
  if (!state.selection.subject) return;
  state.activeCategory = category;
  document.querySelectorAll('.resource-count').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  const titles = { pdf: 'PDFs', pyqs: 'Previous year papers', notes: 'Notes', lectures: 'Lecture links' };
  document.getElementById('resource-heading').textContent = titles[category];
  elements.resourceList.replaceChildren();
  const records = category === 'lectures' ? state.lectures : state.resources.filter(item => item.category === category);
  if (!records.length) elements.resourceList.append(makeMessage('No resources are available for this subject yet.'));
  records.forEach(record => elements.resourceList.append(renderResource(record, category)));
  elements.resourcePanel.hidden = false;
}

function renderResource(record, category) {
  const row = document.createElement('article');
  row.className = 'resource-item';
  const info = document.createElement('div');
  info.className = 'min-width-zero';
  const title = document.createElement('h4');
  title.textContent = record.title || 'Untitled resource';
  info.append(title);
  const detail = document.createElement('p');
  detail.textContent = [record.description, record.fileName, record.lecturer].filter(Boolean).join(' · ');
  if (detail.textContent) info.append(detail);
  const link = document.createElement('a');
  link.className = 'resource-action';
  link.href = record.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = category === 'lectures' ? 'Open lecture ↗' : 'Open PDF ↗';
  link.setAttribute('aria-label', `${link.textContent}: ${record.title}`);
  row.append(info, link);
  return row;
}

function renderNotices(error) {
  elements.noticeList.replaceChildren();
  if (error) {
    elements.noticeList.append(makeMessage('Notices could not be loaded from the server.'));
    return;
  }
  if (!state.notices.length) {
    elements.noticeList.append(makeMessage('There are no current notices.'));
    return;
  }
  state.notices.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).forEach(notice => {
    const item = document.createElement('article');
    item.className = 'notice-item';
    const heading = document.createElement('h3');
    heading.textContent = notice.title;
    const text = document.createElement('p');
    text.textContent = notice.text || notice.desc || '';
    item.append(heading, text);
    if (notice.createdAt) {
      const date = document.createElement('time');
      date.className = 'notice-date';
      date.dateTime = notice.createdAt;
      date.textContent = new Date(notice.createdAt).toLocaleDateString();
      item.append(date);
    }
    elements.noticeList.append(item);
  });
}

function clearSelect(select, placeholder) {
  select.replaceChildren(new Option(placeholder, ''));
  select.value = '';
  select.disabled = true;
}

function departmentName(id) {
  return state.departments.find(item => item.id === id)?.name || id;
}

function makeMessage(message) {
  const node = document.createElement('p');
  node.className = 'muted';
  node.textContent = message;
  return node;
}

function setStatus(message, kind = '') {
  elements.status.textContent = message;
  elements.status.dataset.kind = kind;
}

function updateThemeButton() {
  const button = document.getElementById('theme-toggle');
  const next = state.theme === 'light' ? 'dark' : 'light';
  button.setAttribute('aria-label', `Switch to ${next} theme`);
  button.title = `Switch to ${next} theme`;
  button.querySelector('span').textContent = state.theme === 'light' ? '◐' : '☼';
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('dbcm-theme', state.theme);
  updateThemeButton();
}

function setNavigationOpen(button, navigation, isOpen) {
  button.setAttribute('aria-expanded', String(isOpen));
  button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', isOpen);
}

function clearSelectedSubject() {
  state.selection.subject = '';
  state.resources = [];
  state.lectures = [];
  state.activeCategory = '';
  elements.selectedCourse.hidden = true;
  elements.resourcePanel.hidden = true;
  document.querySelectorAll('.resource-count').forEach(button => {
    button.disabled = true;
    button.setAttribute('aria-pressed', 'false');
  });
  ['pdf', 'pyqs', 'notes', 'lectures'].forEach(category => {
    document.getElementById(`count-${category}`).textContent = '0';
  });
  setStatus(state.selection.department ? 'Select a subject to see its resources.' : 'Select a programme to begin.');
}