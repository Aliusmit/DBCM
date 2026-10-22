const adminState = { departments: [], semesters: [], subjects: [], resources: [], lectures: [], notices: [], activeTab: 'resources' };

document.addEventListener('DOMContentLoaded', initializeAdmin);

async function initializeAdmin() {
  document.getElementById('login-form').addEventListener('submit', signIn);
  document.getElementById('logout-button').addEventListener('click', signOut);
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  document.getElementById('resource-form').addEventListener('submit', saveResource);
  document.getElementById('resource-reset').addEventListener('click', resetResourceForm);
  document.getElementById('lecture-form').addEventListener('submit', saveLecture);
  document.getElementById('lecture-reset').addEventListener('click', resetLectureForm);
  document.getElementById('notice-form').addEventListener('submit', saveNotice);
  document.getElementById('notice-reset').addEventListener('click', resetNoticeForm);
  document.getElementById('course-form').addEventListener('submit', createCourse);
  ['resource-filter-department', 'resource-filter-semester', 'resource-filter-subject', 'resource-filter-category', 'resource-search'].forEach(id => {
    document.getElementById(id).addEventListener(id === 'resource-search' ? 'input' : 'change', renderResources);
  });
  document.getElementById('lecture-search').addEventListener('input', renderLectures);
  document.getElementById('course-admin-search').addEventListener('input', renderCourses);

  try {
    const session = await request('/api/auth/session');
    if (session.authenticated) await openWorkspace();
  } catch (error) {
    showLoginMessage(error.message);
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !url.includes('/api/auth/login')) showLogin();
    throw new Error(result.message || `Request failed (${response.status}).`);
  }
  return result;
}

async function signIn(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  showLoginMessage('Signing in…');
  try {
    await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: document.getElementById('login-username').value.trim(), password: document.getElementById('login-password').value, role: 'admin' })
    });
    document.getElementById('login-password').value = '';
    await openWorkspace();
  } catch (error) {
    showLoginMessage(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

async function signOut() {
  try { await request('/api/auth/logout', { method: 'POST' }); } catch (_) {}
  showLogin();
}

async function openWorkspace() {
  const [departments, semesters, subjects, resources, lectures, notices] = await Promise.all([
    request('/api/departments'), request('/api/semesters'), request('/api/subjects'),
    request('/api/admin/resources'), request('/api/lectures'), request('/api/notices')
  ]);
  adminState.departments = departments.data || [];
  adminState.semesters = semesters.data || [];
  adminState.subjects = subjects.data || [];
  adminState.resources = resources.data || [];
  adminState.lectures = lectures.data || [];
  adminState.notices = notices.data || [];
  document.getElementById('login-panel').hidden = true;
  document.getElementById('admin-workspace').hidden = false;
  document.getElementById('logout-button').hidden = false;
  populateSelects();
  renderResources();
  renderLectures();
  renderNotices();
  renderCourses();
  switchTab(adminState.activeTab);
  document.getElementById('admin-status').textContent = `${adminState.subjects.length} subjects · ${adminState.resources.filter(item => item.available).length} available files`;
}

function showLogin() {
  document.getElementById('login-panel').hidden = false;
  document.getElementById('admin-workspace').hidden = true;
  document.getElementById('logout-button').hidden = true;
}

function showLoginMessage(text, kind = '') {
  const message = document.getElementById('login-message');
  message.textContent = text;
  message.dataset.kind = kind;
}

function switchTab(tab) {
  adminState.activeTab = tab;
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === tab)));
  document.querySelectorAll('[data-section]').forEach(section => { section.hidden = section.dataset.section !== tab; });
}

function populateSelects() {
  setOptions('resource-subject', adminState.subjects, 'Select subject', item => item.id, item => `${item.code} · ${item.name} · Sem ${item.semester}`);
  setOptions('lecture-subject', adminState.subjects, 'Select subject', item => item.id, item => `${item.code} · ${item.name} · Sem ${item.semester}`);
  setOptions('resource-filter-department', adminState.departments, 'All programmes', item => item.id, item => item.name);
  setOptions('resource-filter-semester', adminState.semesters, 'All semesters', item => item.number, item => `Semester ${item.number}`);
  setOptions('resource-filter-subject', adminState.subjects, 'All subjects', item => item.id, item => `${item.code} · ${item.name}`);
  setOptions('new-course-department', adminState.departments, 'Select programme', item => item.id, item => item.name);
  setOptions('new-course-semester', adminState.semesters, 'Select semester', item => item.number, item => `Semester ${item.number}`);
}

function setOptions(id, records, placeholder, valueOf, labelOf) {
  const select = document.getElementById(id);
  const previous = select.value;
  select.replaceChildren(new Option(placeholder, ''));
  records.forEach(record => select.add(new Option(labelOf(record), valueOf(record))));
  if (records.some(record => String(valueOf(record)) === previous)) select.value = previous;
}

function filteredResources() {
  const department = document.getElementById('resource-filter-department').value;
  const semester = document.getElementById('resource-filter-semester').value;
  const subjectId = document.getElementById('resource-filter-subject').value;
  const category = document.getElementById('resource-filter-category').value;
  const query = document.getElementById('resource-search').value.trim().toLowerCase();
  return adminState.resources.filter(resource => {
    if (department && resource.departmentId !== department) return false;
    if (semester && String(resource.semester) !== semester) return false;
    if (subjectId && resource.subjectId !== subjectId) return false;
    if (category && resource.category !== category) return false;
    return !query || `${resource.title} ${resource.fileName} ${resource.subjectName}`.toLowerCase().includes(query);
  });
}

function renderResources() {
  const container = document.getElementById('resource-admin-list');
  container.replaceChildren();
  const records = filteredResources();
  if (!records.length) return container.append(messageNode('No matching files. Upload one using the form.'));
  records.forEach(resource => {
    const row = manageRow(resource.title, `${categoryName(resource.category)} · ${resource.subjectCode} · Semester ${resource.semester} · ${resource.fileName}${resource.available ? '' : ' · File missing on server'}`,
      [{ label: 'Edit', run: () => editResource(resource) }, { label: 'Delete', action: 'delete', run: () => deleteResource(resource) }]);
    if (!resource.available) row.dataset.kind = 'warning';
    container.append(row);
  });
}

function editResource(resource) {
  document.getElementById('resource-id').value = resource.id;
  document.getElementById('resource-subject').value = resource.subjectId;
  document.getElementById('resource-subject').disabled = true;
  document.getElementById('resource-category').value = resource.category;
  document.getElementById('resource-title').value = resource.title;
  document.getElementById('resource-description').value = resource.description || '';
  document.getElementById('resource-file').required = !resource.available;
  document.getElementById('resource-file-hint').textContent = resource.available ? 'Optional · Select a replacement PDF' : 'Required · Current file is missing; upload a replacement';
  const current = document.getElementById('current-resource-file');
  current.replaceChildren();
  current.hidden = false;
  current.append(document.createTextNode(`${resource.available ? 'Current file' : 'Missing file'}: ${resource.fileName}`));
  if (resource.available) {
    const link = document.createElement('a');
    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View current PDF';
    current.append(document.createElement('br'), link);
  }
  document.getElementById('resource-form-eyebrow').textContent = 'Update existing record';
  document.getElementById('resource-form-heading').textContent = 'Edit resource';
  document.getElementById('resource-message').textContent = '';
  document.getElementById('resource-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function saveResource(event) {
  event.preventDefault();
  const id = document.getElementById('resource-id').value;
  const fileInput = document.getElementById('resource-file');
  const file = fileInput.files[0];
  if (file && (!isPdfFile(file) || file.size > 15 * 1024 * 1024)) return setMessage('resource-message', 'Choose a PDF file no larger than 15 MB.', 'error');
  if (!id && !file) return setMessage('resource-message', 'Choose a PDF file to upload.', 'error');
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const body = {
      subjectId: document.getElementById('resource-subject').value,
      category: document.getElementById('resource-category').value,
      title: document.getElementById('resource-title').value.trim(),
      description: document.getElementById('resource-description').value.trim()
    };
    if (file) {
      body.fileName = file.name;
      body.fileData = await fileAsDataUrl(file);
    }
    const result = await request(id ? `/api/admin/resources/${encodeURIComponent(id)}` : '/api/admin/resources', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    showToast(result.message || (id ? 'Resource updated.' : 'Resource uploaded.'));
    resetResourceForm();
    await reloadManagedData();
  } catch (error) {
    setMessage('resource-message', error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

async function deleteResource(resource) {
  if (!window.confirm(`Delete “${resource.title}” and its stored file? This cannot be undone.`)) return;
  try {
    const result = await request(`/api/admin/resources/${encodeURIComponent(resource.id)}`, { method: 'DELETE' });
    resetResourceForm();
    showToast(result.message || 'Resource deleted.');
    await reloadManagedData();
  } catch (error) { showToast(error.message, 'error'); }
}

function resetResourceForm() {
  document.getElementById('resource-form').reset();
  document.getElementById('resource-id').value = '';
  document.getElementById('resource-subject').disabled = false;
  document.getElementById('resource-file').required = true;
  document.getElementById('resource-file-hint').textContent = 'Required · PDF up to 15 MB';
  document.getElementById('current-resource-file').hidden = true;
  document.getElementById('resource-form-eyebrow').textContent = 'Add a file';
  document.getElementById('resource-form-heading').textContent = 'Upload resource';
  setMessage('resource-message', '');
}

function renderLectures() {
  const container = document.getElementById('lecture-admin-list');
  container.replaceChildren();
  const query = document.getElementById('lecture-search').value.trim().toLowerCase();
  const records = adminState.lectures.filter(item => !query || `${item.title} ${item.subjectName} ${item.lecturer}`.toLowerCase().includes(query));
  if (!records.length) return container.append(messageNode('No lecture links match this search.'));
  records.forEach(lecture => container.append(manageRow(lecture.title, `${lecture.subjectCode} · Semester ${lecture.semester}${lecture.lecturer ? ` · ${lecture.lecturer}` : ''}`, [
    { label: 'Open ↗', run: () => window.open(lecture.url, '_blank', 'noopener,noreferrer') },
    { label: 'Edit', run: () => editLecture(lecture) },
    { label: 'Delete', action: 'delete', run: () => deleteLecture(lecture) }
  ])));
}

function editLecture(lecture) {
  document.getElementById('lecture-id').value = lecture.id;
  document.getElementById('lecture-subject').value = lecture.subjectId;
  document.getElementById('lecture-title').value = lecture.title;
  document.getElementById('lecture-url').value = lecture.url;
  document.getElementById('lecture-lecturer').value = lecture.lecturer || '';
  document.getElementById('lecture-description').value = lecture.description || '';
  document.getElementById('lecture-form-eyebrow').textContent = 'Update existing record';
  document.getElementById('lecture-form-heading').textContent = 'Edit lecture link';
  document.getElementById('lecture-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function saveLecture(event) {
  event.preventDefault();
  const id = document.getElementById('lecture-id').value;
  const url = document.getElementById('lecture-url').value.trim();
  if (!isHttpsUrl(url)) return setMessage('lecture-message', 'Enter a valid HTTPS link.', 'error');
  const body = {
    subjectId: document.getElementById('lecture-subject').value,
    title: document.getElementById('lecture-title').value.trim(),
    url,
    lecturer: document.getElementById('lecture-lecturer').value.trim(),
    description: document.getElementById('lecture-description').value.trim()
  };
  try {
    await request(id ? `/api/admin/lectures/${encodeURIComponent(id)}` : '/api/admin/lectures', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    resetLectureForm();
    showToast(id ? 'Lecture link updated.' : 'Lecture link added.');
    await reloadManagedData();
  } catch (error) { setMessage('lecture-message', error.message, 'error'); }
}

async function deleteLecture(lecture) {
  if (!window.confirm(`Delete the lecture link “${lecture.title}”?`)) return;
  try {
    await request(`/api/admin/lectures/${encodeURIComponent(lecture.id)}`, { method: 'DELETE' });
    resetLectureForm();
    showToast('Lecture link deleted.');
    await reloadManagedData();
  } catch (error) { showToast(error.message, 'error'); }
}

function resetLectureForm() {
  document.getElementById('lecture-form').reset();
  document.getElementById('lecture-id').value = '';
  document.getElementById('lecture-form-eyebrow').textContent = 'Add a link';
  document.getElementById('lecture-form-heading').textContent = 'New lecture link';
  setMessage('lecture-message', '');
}

function renderNotices() {
  const container = document.getElementById('notice-admin-list');
  container.replaceChildren();
  if (!adminState.notices.length) return container.append(messageNode('There are no notices yet.'));
  adminState.notices.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).forEach(notice => container.append(manageRow(notice.title, notice.text, [
    { label: 'Edit', run: () => editNotice(notice) },
    { label: 'Delete', action: 'delete', run: () => deleteNotice(notice) }
  ])));
}

function editNotice(notice) {
  document.getElementById('notice-id').value = notice.id;
  document.getElementById('notice-title').value = notice.title;
  document.getElementById('notice-text').value = notice.text || notice.desc || '';
  document.getElementById('notice-form-eyebrow').textContent = 'Update published notice';
  document.getElementById('notice-form-heading').textContent = 'Edit notice';
  document.getElementById('notice-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function saveNotice(event) {
  event.preventDefault();
  const id = document.getElementById('notice-id').value;
  const body = { title: document.getElementById('notice-title').value.trim(), text: document.getElementById('notice-text').value.trim() };
  try {
    await request(id ? `/api/admin/notices/${encodeURIComponent(id)}` : '/api/admin/notices', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    resetNoticeForm();
    showToast(id ? 'Notice updated.' : 'Notice published.');
    await reloadManagedData();
  } catch (error) { setMessage('notice-message', error.message, 'error'); }
}

async function deleteNotice(notice) {
  if (!window.confirm(`Delete notice “${notice.title}”?`)) return;
  try {
    await request(`/api/admin/notices/${encodeURIComponent(notice.id)}`, { method: 'DELETE' });
    resetNoticeForm();
    showToast('Notice deleted.');
    await reloadManagedData();
  } catch (error) { showToast(error.message, 'error'); }
}

function resetNoticeForm() {
  document.getElementById('notice-form').reset();
  document.getElementById('notice-id').value = '';
  document.getElementById('notice-form-eyebrow').textContent = 'Publish an update';
  document.getElementById('notice-form-heading').textContent = 'New notice';
  setMessage('notice-message', '');
}

function renderCourses() {
  const container = document.getElementById('course-admin-list');
  container.replaceChildren();
  const query = document.getElementById('course-admin-search').value.trim().toLowerCase();
  const records = adminState.subjects.filter(item => !query || `${item.code} ${item.name} ${item.departmentId}`.toLowerCase().includes(query));
  if (!records.length) return container.append(messageNode('No matching courses.'));
  records.forEach(subject => container.append(manageRow(subject.name, `${subject.code} · ${departmentName(subject.departmentId)} · ${subject.track} · Semester ${subject.semester}`, [
    { label: 'Delete', action: 'delete', run: () => deleteCourse(subject) }
  ])));
}

async function createCourse(event) {
  event.preventDefault();
  const body = {
    code: document.getElementById('new-course-code').value.trim(),
    name: document.getElementById('new-course-name').value.trim(),
    shortName: document.getElementById('new-course-short').value.trim(),
    department: document.getElementById('new-course-department').value,
    track: document.getElementById('new-course-track').value,
    semester: Number(document.getElementById('new-course-semester').value),
    description: document.getElementById('new-course-description').value.trim()
  };
  try {
    await request('/api/admin/subject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    document.getElementById('course-form').reset();
    setMessage('course-message', 'Course added.');
    showToast('Course added.');
    await reloadManagedData();
  } catch (error) { setMessage('course-message', error.message, 'error'); }
}

async function deleteCourse(subject) {
  if (!window.confirm(`Delete “${subject.name}” and all its associated files? This cannot be undone.`)) return;
  try {
    await request(`/api/admin/subject/${encodeURIComponent(subject.id)}`, { method: 'DELETE' });
    showToast('Course deleted.');
    await reloadManagedData();
  } catch (error) { showToast(error.message, 'error'); }
}

async function reloadManagedData() {
  const [subjects, resources, lectures, notices] = await Promise.all([
    request('/api/subjects'), request('/api/admin/resources'), request('/api/lectures'), request('/api/notices')
  ]);
  adminState.subjects = subjects.data || [];
  adminState.resources = resources.data || [];
  adminState.lectures = lectures.data || [];
  adminState.notices = notices.data || [];
  populateSelects();
  renderResources(); renderLectures(); renderNotices(); renderCourses();
  document.getElementById('admin-status').textContent = `${adminState.subjects.length} subjects · ${adminState.resources.filter(item => item.available).length} available files`;
}

function manageRow(titleText, detailText, actions) {
  const row = document.createElement('article');
  row.className = 'manage-row';
  const info = document.createElement('div');
  info.className = 'manage-row-info';
  const title = document.createElement('h3'); title.textContent = titleText;
  const detail = document.createElement('p'); detail.textContent = detailText;
  info.append(title, detail);
  const controls = document.createElement('div'); controls.className = 'manage-row-actions';
  actions.forEach(action => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    if (action.action) button.dataset.action = action.action;
    button.addEventListener('click', action.run);
    controls.append(button);
  });
  row.append(info, controls);
  return row;
}

function messageNode(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'muted';
  paragraph.textContent = text;
  return paragraph;
}

function setMessage(id, message, kind = '') {
  const node = document.getElementById(id);
  node.textContent = message;
  node.dataset.kind = kind;
}

function showToast(message, kind = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 4000);
}

function categoryName(category) {
  return ({ pdf: 'PDF', pyqs: 'PYQ', notes: 'Notes' })[category] || category;
}

function departmentName(id) {
  return adminState.departments.find(item => item.id === id)?.name || id;
}

function isPdfFile(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:'; } catch (_) { return false; }
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}