const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const adminSessions = new Map();
const loginAttempts = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/[<>"'`]/g, '').trim().slice(0, maxLength);
}

function getSessionToken(req) {
  const cookie = (req.headers.cookie || '').split(';').map(part => part.trim())
    .find(part => part.startsWith('dbcm_admin_session='));
  if (!cookie) return '';
  try {
    return decodeURIComponent(cookie.slice('dbcm_admin_session='.length));
  } catch (_) {
    return '';
  }
}

function setSessionCookie(res, token, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `dbcm_admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`);
}

function requireAdmin(req, res, next) {
  const token = getSessionToken(req);
  const session = adminSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Administrator sign-in required.' });
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  next();
}

app.use(express.json({ limit: '22mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
  next();
});

// Ensure upload directory exists for PDFs and documents
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Accept only small, well-formed PDF data and use a generated storage name.
function saveBase64File(fileData, originalFileName) {
  if (!fileData || typeof fileData !== 'string') return null;
  const matches = fileData.match(/^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/);
  const encoded = matches ? matches[1] : fileData;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  const buffer = Buffer.from(encoded, 'base64');
  if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024 || buffer.subarray(0, 5).toString() !== '%PDF-') return null;
  const safeBase = path.basename(originalFileName || 'document', path.extname(originalFileName || '')).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'document';
  const uniqueFilename = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${safeBase}.pdf`;
  const targetPath = path.join(uploadDir, uniqueFilename);
  fs.writeFileSync(targetPath, buffer, { flag: 'wx' });
  return `/uploads/${uniqueFilename}`;
}

// Disable caching on API endpoints so refresh always returns real-time data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));

// Load curriculum data
const dataFilePath = process.env.CURRICULUM_FILE || path.join(__dirname, 'data', 'curriculum.json');
const publicDataFilePath = path.join(__dirname, 'public', 'data', 'curriculum.json');
let rawData = { institution: null, departments: [], semesters: [], subjects: [] };

try {
  if (fs.existsSync(dataFilePath)) {
    rawData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  }
} catch (err) {
  console.error('[Data Error] Failed to load curriculum.json:', err.message);
}

// Single Institution - DBCM Study Material
const dbcmInstitution = rawData.institution || {
  id: "dbcm",
  name: "DBCM Study Material Platform",
  shortName: "DBCM",
  badge: "Autonomous Academic Portal",
  location: "DBCM Academic Campus",
  icon: "graduation-cap",
  schemes: ["DBCM Autonomous NEP 2024", "Major-Minor Degree Framework", "CBCS Undergraduate"],
  totalStudents: null,
  rating: null
};

// 14 Official Departments
const defaultDepartments = [
  { id: "bca", name: "Computer Science (BCA)", code: "BCA", icon: "laptop", color: "#3B82F6", category: "Computing & IT" },
  { id: "botany", name: "Botany", code: "BOT", icon: "sprout", color: "#10B981", category: "Life Sciences" },
  { id: "chemistry", name: "Chemistry", code: "CHEM", icon: "flask-conical", color: "#F59E0B", category: "Physical Sciences" },
  { id: "physics", name: "Physics", code: "PHY", icon: "atom", color: "#6366F1", category: "Physical Sciences" },
  { id: "zoology", name: "Zoology", code: "ZOO", icon: "bug", color: "#EC4899", category: "Life Sciences" },
  { id: "biotech", name: "Biotechnology (BBT)", code: "BBT", icon: "dna", color: "#8B5CF6", category: "Life Sciences" },
  { id: "commerce", name: "Commerce (B.Com)", code: "B.COM", icon: "bar-chart-3", color: "#14B8A6", category: "Commerce & Management" },
  { id: "economics", name: "Economics", code: "ECO", icon: "trending-up", color: "#06B6D4", category: "Social Sciences" },
  { id: "education", name: "Education", code: "EDU", icon: "book-open", color: "#F97316", category: "Humanities" },
  { id: "english", name: "English", code: "ENG", icon: "feather", color: "#E11D48", category: "Humanities & Languages" },
  { id: "history", name: "History", code: "HIST", icon: "landmark", color: "#A855F7", category: "Social Sciences" },
  { id: "polsci", name: "Political Science", code: "POL", icon: "scale", color: "#3B82F6", category: "Social Sciences" },
  { id: "sociology", name: "Sociology", code: "SOC", icon: "users", color: "#10B981", category: "Social Sciences" },
  { id: "bsw", name: "Social Work (BSW)", code: "BSW", icon: "heart-handshake", color: "#EF4444", category: "Social Services" }
];

const defaultSemesters = rawData.semesters && rawData.semesters.length > 0 ? rawData.semesters : [
  { number: 1, year: "1Y", label: "Sem 1 (1Y)" },
  { number: 2, year: "1Y", label: "Sem 2 (1Y)" },
  { number: 3, year: "2Y", label: "Sem 3 (2Y)" },
  { number: 4, year: "2Y", label: "Sem 4 (2Y)" },
  { number: 5, year: "3Y", label: "Sem 5 (3Y)" },
  { number: 6, year: "3Y", label: "Sem 6 (3Y)" },
  { number: 7, year: "4Y", label: "Sem 7 (4Y)" },
  { number: 8, year: "4Y", label: "Sem 8 (4Y)" }
];

if (!Array.isArray(rawData.notices)) rawData.notices = [];

// Helper to save data back to file
function persistCurriculum() {
  const targets = process.env.CURRICULUM_FILE ? [dataFilePath] : [dataFilePath, publicDataFilePath];
  const temporaryFiles = [];
  try {
    const serialized = `${JSON.stringify(rawData, null, 2)}\n`;
    for (const target of targets) {
      const temporaryPath = `${target}.${process.pid}.tmp`;
      fs.writeFileSync(temporaryPath, serialized);
      temporaryFiles.push({ temporaryPath, target });
    }
    for (const file of temporaryFiles) fs.renameSync(file.temporaryPath, file.target);
    console.log('[Data Saved] Successfully persisted curriculum to disk.');
    return true;
  } catch (err) {
    for (const file of temporaryFiles) {
      removeStoredFile(file.temporaryPath);
    }
    console.error('[Data Error] Failed to persist curriculum:', err);
    return false;
  }
}

function getStoredUploadPath(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return null;
  const root = path.resolve(uploadDir) + path.sep;
  const filename = url.slice('/uploads/'.length);
  if (!filename || filename !== path.basename(filename)) return null;
  const filePath = path.resolve(uploadDir, filename);
  return filePath.startsWith(root) && fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : null;
}

function removeStoredFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return true;
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error('[Storage Error] Could not remove stored file:', error.message);
    return false;
  }
}

function isValidLectureUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname) ? true :
      url.protocol === 'https:' && (url.hostname === 'youtu.be' ? url.pathname.length > 1 : url.hostname.endsWith('youtube.com') && url.pathname !== '/');
  } catch (_) {
    return false;
  }
}

function getSubjectResourceRecords(subject) {
  const records = [];
  const add = (resource, category, legacy = false) => {
    const url = resource.fileUrl || resource.pdfUrl || resource.syllabusPdfUrl;
    if (!url) return;
    records.push({
      id: resource.id || `legacy-${subject.id}-${records.length}`,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      departmentId: subject.departmentId,
      semester: subject.semester,
      category,
      title: resource.title || resource.fileName || subject.name,
      description: resource.description || '',
      fileName: resource.fileName || path.basename(url),
      fileSize: resource.fileSize || '',
      url,
      available: !!getStoredUploadPath(url),
      legacy
    });
  };

  (subject.resources || []).forEach(resource => add(resource, resource.category || 'pdf'));
  if (subject.syllabusPdfUrl) add({ id: `syllabus-${subject.id}`, title: `${subject.code} Syllabus`, fileName: subject.syllabusFileName, fileSize: subject.syllabusFileSize, pdfUrl: subject.syllabusPdfUrl }, 'pdf', true);
  (subject.notes || []).forEach(resource => add(resource, 'notes', true));
  (subject.pyqs || []).forEach(resource => add(resource, 'pyqs', true));
  return records;
}

// Subject normalizer
function normalizeSubject(s) {
  const deptId = s.departmentId || s.branchId || (Array.isArray(s.branches) ? s.branches[0] : 'bca');
  const track = (s.track || 'major').toLowerCase();

  const imps = (s.impQuestions || []).filter(question => typeof question.question === 'string' && question.question.trim());
  const lectures = [...(s.lectures || []), ...(s.videos || [])].filter(lecture => isValidLectureUrl(lecture.url));
  const notes = (s.notes || []).filter(note => getStoredUploadPath(note.pdfUrl || note.fileUrl));
  const pyqs = (s.pyqs || []).filter(paper => getStoredUploadPath(paper.pdfUrl || paper.fileUrl));

  const modules = (s.modules || []).map((m, idx) => ({
    num: m.num || m.moduleNumber || (idx + 1),
    title: m.title || '',
    weightage: m.weightage || '',
    summary: m.summary || ''
  }));

  return {
    id: s.id || `${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${(s.shortName || 'sub').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    code: s.code,
    name: s.name,
    shortName: s.shortName || s.name,
    semester: s.semester,
    track: track, // 'major' | 'minor'
    departmentId: deptId,
    branches: [deptId],
    branchId: deptId,
    universityId: 'dbcm',
    credits: s.credits || (track === 'major' ? 4 : 3),
    scheme: s.scheme || `DBCM Autonomous NEP 2024 (${track.toUpperCase()})`,
    difficulty: s.difficulty || (track === 'major' ? "Core Major" : "Interdisciplinary Minor"),
    passingProbability: s.passingProbability || "90%+",
    description: s.description || '',
    syllabusPdfUrl: s.syllabusPdfUrl || null,
    syllabusFileName: s.syllabusFileName || null,
    syllabusFileSize: s.syllabusFileSize || null,
    modules: modules,
    impQuestions: imps,
    notes: notes,
    pyqs: pyqs,
    lectures,
    resources: s.resources || [],
    resourceRecords: getSubjectResourceRecords({ ...s, id: s.id, departmentId: deptId })
  };
}

let normalizedSubjects = (rawData.subjects || []).map(normalizeSubject);
console.log(`[DBCM] Initialized with ${normalizedSubjects.length} subjects across 14 departments!`);

// --- REST Endpoints ---

// 1. Institution details
app.get('/api/institution', (req, res) => {
  res.json({ success: true, data: dbcmInstitution });
});

// Backward compatible endpoint
app.get('/api/universities', (req, res) => {
  res.json({ success: true, count: 1, data: [dbcmInstitution] });
});

// 2. Departments
app.get('/api/departments', (req, res) => {
  const depts = rawData.departments && rawData.departments.length > 0 ? rawData.departments : defaultDepartments;
  res.json({ success: true, count: depts.length, data: depts });
});

// Backward compatible alias
app.get('/api/branches', (req, res) => {
  const depts = rawData.departments && rawData.departments.length > 0 ? rawData.departments : defaultDepartments;
  res.json({ success: true, count: depts.length, data: depts });
});

// 3. Semesters
app.get('/api/semesters', (req, res) => {
  res.json({ success: true, count: defaultSemesters.length, data: defaultSemesters });
});

// 4. Subjects (filtered by department, track [major/minor], semester, search)
app.get('/api/subjects', (req, res) => {
  const { department, branch, track, semester, search } = req.query;
  let results = normalizedSubjects;

  const targetDept = (department || branch || '').toLowerCase();
  if (targetDept && targetDept !== 'all') {
    results = results.filter(s =>
      s.departmentId === targetDept ||
      (s.branches && s.branches.includes(targetDept))
    );
  }

  if (track && track !== 'all') {
    const t = track.toLowerCase();
    results = results.filter(s => (s.track || 'major').toLowerCase() === t);
  }

  if (semester && semester !== 'all') {
    const semNum = parseInt(semester, 10);
    if (!isNaN(semNum)) {
      results = results.filter(s => s.semester === semNum);
    }
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.shortName && s.shortName.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.track && s.track.toLowerCase().includes(q)) ||
      (s.modules && s.modules.some(m => m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q)))
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

function getRawSubject(subjectId) {
  return (rawData.subjects || []).find(subject => subject.id === subjectId || subject.code.toLowerCase() === String(subjectId).toLowerCase());
}

function getAllResourceRecords() {
  const records = (rawData.subjects || []).flatMap(subject => getSubjectResourceRecords(subject));
  return [...new Map(records.map(record => [`${record.subjectId}:${record.id}`, record])).values()];
}

function getAllLectureRecords() {
  return (rawData.subjects || []).flatMap(subject => {
    const lectures = [...(subject.lectures || []), ...(subject.videos || []).filter(lecture => isValidLectureUrl(lecture.url))];
    const seen = new Set();
    return lectures.filter(lecture => {
      if (!isValidLectureUrl(lecture.url)) return false;
      const key = lecture.id || lecture.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(lecture => ({
      id: lecture.id || `legacy-${subject.id}-${Buffer.from(lecture.url).toString('hex').slice(0, 16)}`,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      departmentId: subject.departmentId || subject.branchId,
      semester: subject.semester,
      title: lecture.title || '',
      description: lecture.description || '',
      lecturer: lecture.lecturer || lecture.channel || '',
      url: lecture.url
    }));
  });
}

function filterByCourse(records, query) {
  const { department, semester, subjectId, search } = query;
  return records.filter(record => {
    if (department && record.departmentId !== department) return false;
    if (semester && String(record.semester) !== String(semester)) return false;
    if (subjectId && record.subjectId !== subjectId) return false;
    if (search) {
      const text = `${record.title} ${record.description} ${record.subjectName} ${record.subjectCode}`.toLowerCase();
      if (!text.includes(String(search).toLowerCase())) return false;
    }
    return true;
  });
}

app.get('/api/resources', (req, res) => {
  const data = filterByCourse(getAllResourceRecords().filter(resource => resource.available), req.query);
  const category = req.query.category;
  const filtered = category ? data.filter(resource => resource.category === category) : data;
  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/lectures', (req, res) => {
  const data = filterByCourse(getAllLectureRecords(), req.query);
  res.json({ success: true, count: data.length, data });
});

app.get('/api/notices', (req, res) => {
  res.json({ success: true, count: rawData.notices.length, data: rawData.notices });
});

app.get('/api/pyqs', (req, res) => {
  const data = filterByCourse(getAllResourceRecords(), req.query).filter(resource => resource.category === 'pyqs');
  res.json({ success: true, count: data.length, data });
});

// 6. Subject Detail
app.get('/api/subject/:id', (req, res) => {
  const subject = normalizedSubjects.find(s => s.id === req.params.id || s.code.toLowerCase() === req.params.id.toLowerCase());
  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }
  res.json({ success: true, data: subject });
});

// 6. Global Search
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.json({ success: true, data: { subjects: [], resources: [], lectures: [] } });
  }

  const matchedSubjects = [];
  for (const s of normalizedSubjects) {
    if (s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query) || s.shortName.toLowerCase().includes(query)) {
      matchedSubjects.push({
        id: s.id,
        name: s.name,
        code: s.code,
        track: s.track,
        semester: s.semester,
        departmentId: s.departmentId
      });
    }

  }

  res.json({
    success: true,
    data: {
      subjects: matchedSubjects.slice(0, 10),
      resources: getAllResourceRecords().filter(resource => `${resource.title} ${resource.subjectName}`.toLowerCase().includes(query)).slice(0, 10),
      lectures: getAllLectureRecords().filter(lecture => `${lecture.title} ${lecture.subjectName} ${lecture.lecturer}`.toLowerCase().includes(query)).slice(0, 10)
    }
  });
});

// 7. Stats
app.get('/api/stats', (req, res) => {
  const resources = getAllResourceRecords();
  const totalNotes = resources.filter(resource => resource.category === 'notes').length;
  const totalPYQs = resources.filter(resource => resource.category === 'pyqs').length;
  const majorCount = normalizedSubjects.filter(s => s.track === 'major').length;
  const minorCount = normalizedSubjects.filter(s => s.track === 'minor').length;

  res.json({
    success: true,
    data: {
      institution: dbcmInstitution.name,
      departmentsCount: defaultDepartments.length,
      subjectsCount: normalizedSubjects.length,
      majorCount: majorCount,
      minorCount: minorCount,
      notesCount: totalNotes,
      pyqsCount: totalPYQs,
      pdfCount: resources.filter(resource => resource.category === 'pdf').length,
      lecturesCount: getAllLectureRecords().length,
      noticeCount: rawData.notices.length
    }
  });
});

// --- AUTHENTICATION (Student & Admin) ---
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  if (role === 'admin') {
    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredUsername || !configuredPassword) {
      return res.status(503).json({ success: false, message: 'Admin sign-in is not configured on this server.' });
    }
    if (typeof username !== 'string' || typeof password !== 'string' || username.length > 256 || password.length > 256) {
      return res.status(400).json({ success: false, message: 'Enter valid administrator credentials.' });
    }

    const address = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(address) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    if (attempt.resetAt <= now) {
      attempt.count = 0;
      attempt.resetAt = now + 15 * 60 * 1000;
    }
    if (attempt.count >= 10) {
      return res.status(429).json({ success: false, message: 'Too many sign-in attempts. Try again later.' });
    }

    if (!safeEqual(username, configuredUsername) || !safeEqual(password, configuredPassword)) {
      attempt.count += 1;
      loginAttempts.set(address, attempt);
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    loginAttempts.delete(address);
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { expiresAt: now + SESSION_TTL_MS });
    setSessionCookie(res, token, SESSION_TTL_MS / 1000);
    return res.json({ success: true, user: { username: configuredUsername, name: 'DBCM Administrator', role: 'admin' } });
  }
  return res.status(400).json({ success: false, message: 'Unsupported sign-in role.' });
});

app.get('/api/auth/session', (req, res) => {
  const session = adminSessions.get(getSessionToken(req));
  res.json({ authenticated: !!session && session.expiresAt > Date.now() });
});

app.post('/api/auth/logout', (req, res) => {
  adminSessions.delete(getSessionToken(req));
  setSessionCookie(res, '', 0);
  res.json({ success: true });
});

// --- ADMIN MANAGEMENT ENDPOINTS ---
app.use('/api/admin', requireAdmin);

app.get('/api/admin/resources', (req, res) => {
  const data = filterByCourse(getAllResourceRecords(), req.query);
  const category = req.query.category;
  const filtered = category ? data.filter(resource => resource.category === category) : data;
  res.json({ success: true, count: filtered.length, data: filtered });
});

function refreshNormalizedSubjects() {
  normalizedSubjects = (rawData.subjects || []).map(normalizeSubject);
}

function locateResource(id) {
  for (const subject of rawData.subjects || []) {
    const resource = (subject.resources || []).find(item => item.id === id);
    if (resource) return { subject, resource, source: 'resources' };
    if (id === `syllabus-${subject.id}` && subject.syllabusPdfUrl) {
      return { subject, source: 'syllabus', resource: { id, category: 'pdf', title: `${subject.code} Syllabus`, fileName: subject.syllabusFileName, fileSize: subject.syllabusFileSize, fileUrl: subject.syllabusPdfUrl } };
    }
    for (const key of ['notes', 'pyqs']) {
      const item = (subject[key] || []).find(entry => entry.id === id);
      if (item) return { subject, resource: { ...item, category: key, fileUrl: item.fileUrl || item.pdfUrl }, source: key, original: item };
    }
  }
  return null;
}

function validateResourceInput({ category, title, description }) {
  return ['pdf', 'notes', 'pyqs'].includes(category) &&
    typeof title === 'string' && title.trim().length > 0 && title.trim().length <= 140 &&
    (description === undefined || (typeof description === 'string' && description.length <= 1000));
}

app.post('/api/admin/resources', (req, res) => {
  const { subjectId, category, title, description = '', fileName, fileData } = req.body;
  const subject = getRawSubject(subjectId);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  if (!validateResourceInput({ category, title, description }) || !fileData) {
    return res.status(400).json({ success: false, message: 'Choose a resource type, title, and PDF file.' });
  }

  let fileUrl;
  try {
    fileUrl = saveBase64File(fileData, fileName);
  } catch (error) {
    console.error('[Upload Error]', error.message);
    return res.status(400).json({ success: false, message: 'The PDF could not be saved.' });
  }
  if (!fileUrl) return res.status(400).json({ success: false, message: 'Upload a valid PDF no larger than 15 MB.' });

  const resource = {
    id: crypto.randomUUID(), category, title: title.trim(), description: description.trim(),
    fileName: path.basename(fileName || fileUrl), fileSize: fs.statSync(getStoredUploadPath(fileUrl)).size,
    fileUrl, uploadedAt: new Date().toISOString()
  };
  subject.resources = subject.resources || [];
  subject.resources.push(resource);
  if (!persistCurriculum()) {
    subject.resources.pop();
    removeStoredFile(getStoredUploadPath(fileUrl));
    return res.status(500).json({ success: false, message: 'Could not save the resource record.' });
  }
  refreshNormalizedSubjects();
  res.status(201).json({ success: true, message: 'Resource uploaded.', data: getSubjectResourceRecords(subject).find(item => item.id === resource.id) });
});

app.put('/api/admin/resources/:id', (req, res) => {
  const located = locateResource(req.params.id);
  if (!located) return res.status(404).json({ success: false, message: 'Resource not found.' });
  const category = req.body.category || located.resource.category;
  const title = req.body.title === undefined ? located.resource.title : req.body.title;
  const description = req.body.description === undefined ? located.resource.description || '' : req.body.description;
  if (!validateResourceInput({ category, title, description })) {
    return res.status(400).json({ success: false, message: 'Check the resource type, title, and description.' });
  }

  let newFileUrl = null;
  if (req.body.fileData) {
    try {
      newFileUrl = saveBase64File(req.body.fileData, req.body.fileName || located.resource.fileName);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'The replacement PDF could not be saved.' });
    }
    if (!newFileUrl) return res.status(400).json({ success: false, message: 'Replacement must be a valid PDF no larger than 15 MB.' });
  }

  const oldFilePath = getStoredUploadPath(located.resource.fileUrl);
  const snapshot = JSON.stringify(rawData);
  let resource = located.resource;
  if (located.source !== 'resources') {
    if (located.source === 'syllabus') {
      located.subject.syllabusPdfUrl = null;
      located.subject.syllabusFileName = null;
      located.subject.syllabusFileSize = null;
    } else {
      located.subject[located.source] = (located.subject[located.source] || []).filter(item => item.id !== located.resource.id);
    }
    resource = { ...located.resource, id: req.params.id, fileUrl: located.resource.fileUrl };
    located.subject.resources = located.subject.resources || [];
    located.subject.resources.push(resource);
  }
  resource.category = category;
  resource.title = title.trim();
  resource.description = description.trim();
  if (newFileUrl) {
    resource.fileUrl = newFileUrl;
    resource.fileName = path.basename(req.body.fileName || newFileUrl);
    resource.fileSize = fs.statSync(getStoredUploadPath(newFileUrl)).size;
    resource.updatedAt = new Date().toISOString();
  }

  if (!persistCurriculum()) {
    rawData = JSON.parse(snapshot);
    refreshNormalizedSubjects();
    if (newFileUrl) removeStoredFile(getStoredUploadPath(newFileUrl));
    return res.status(500).json({ success: false, message: 'Could not save resource changes.' });
  }
  const oldFileRemoved = !newFileUrl || !oldFilePath || oldFilePath === getStoredUploadPath(newFileUrl) || removeStoredFile(oldFilePath);
  refreshNormalizedSubjects();
  res.json({ success: true, message: oldFileRemoved ? 'Resource updated.' : 'Resource updated, but its previous file could not be removed.', data: getSubjectResourceRecords(located.subject).find(item => item.id === resource.id) });
});

app.delete('/api/admin/resources/:id', (req, res) => {
  const located = locateResource(req.params.id);
  if (!located) return res.status(404).json({ success: false, message: 'Resource not found.' });
  const snapshot = JSON.stringify(rawData);
  const filePath = getStoredUploadPath(located.resource.fileUrl);
  if (located.source === 'resources') {
    located.subject.resources = located.subject.resources.filter(item => item.id !== req.params.id);
  } else if (located.source === 'syllabus') {
    located.subject.syllabusPdfUrl = null;
    located.subject.syllabusFileName = null;
    located.subject.syllabusFileSize = null;
  } else {
    located.subject[located.source] = located.subject[located.source].filter(item => item.id !== req.params.id);
  }
  if (!persistCurriculum()) {
    rawData = JSON.parse(snapshot);
    refreshNormalizedSubjects();
    return res.status(500).json({ success: false, message: 'Could not delete the resource record.' });
  }
  const fileRemoved = removeStoredFile(filePath);
  refreshNormalizedSubjects();
  res.json({ success: true, message: fileRemoved ? 'Resource deleted.' : 'Resource record deleted, but its stored file could not be removed.' });
});

app.post('/api/admin/lectures', (req, res) => {
  const { subjectId, title, url, description = '', lecturer = '' } = req.body;
  const subject = getRawSubject(subjectId);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  if (typeof title !== 'string' || !title.trim() || title.length > 140 || !isValidLectureUrl(url) || description.length > 1000 || lecturer.length > 120) {
    return res.status(400).json({ success: false, message: 'Enter a title and a valid HTTPS lecture URL. Optional fields are limited in length.' });
  }
  const lecture = { id: crypto.randomUUID(), title: title.trim(), url, description: description.trim(), lecturer: lecturer.trim(), createdAt: new Date().toISOString() };
  subject.lectures = subject.lectures || [];
  subject.lectures.push(lecture);
  if (!persistCurriculum()) {
    subject.lectures.pop();
    return res.status(500).json({ success: false, message: 'Could not save the lecture link.' });
  }
  res.status(201).json({ success: true, data: { ...lecture, subjectId, subjectName: subject.name, subjectCode: subject.code, departmentId: subject.departmentId, semester: subject.semester } });
});

app.put('/api/admin/lectures/:id', (req, res) => {
  const lecture = getAllLectureRecords().find(item => item.id === req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture link not found.' });
  const subject = getRawSubject(req.body.subjectId || lecture.subjectId);
  const title = req.body.title === undefined ? lecture.title : req.body.title;
  const url = req.body.url === undefined ? lecture.url : req.body.url;
  const description = req.body.description === undefined ? lecture.description : req.body.description;
  const lecturer = req.body.lecturer === undefined ? lecture.lecturer : req.body.lecturer;
  if (!subject || typeof title !== 'string' || !title.trim() || title.length > 140 || !isValidLectureUrl(url) || typeof description !== 'string' || description.length > 1000 || typeof lecturer !== 'string' || lecturer.length > 120) {
    return res.status(400).json({ success: false, message: 'Check the course, title, HTTPS URL, and optional details.' });
  }
  const snapshot = JSON.stringify(rawData);
  for (const candidate of rawData.subjects || []) {
    candidate.lectures = (candidate.lectures || []).filter(item => item.id !== lecture.id);
    candidate.videos = (candidate.videos || []).filter(item => item.id !== lecture.id && item.url !== lecture.url);
  }
  subject.lectures = subject.lectures || [];
  const updated = { id: lecture.id, title: title.trim(), url, description: description.trim(), lecturer: lecturer.trim() };
  subject.lectures.push(updated);
  if (!persistCurriculum()) {
    rawData = JSON.parse(snapshot);
    return res.status(500).json({ success: false, message: 'Could not save lecture changes.' });
  }
  res.json({ success: true, data: { ...updated, subjectId: subject.id, subjectName: subject.name, subjectCode: subject.code, departmentId: subject.departmentId, semester: subject.semester } });
});

app.delete('/api/admin/lectures/:id', (req, res) => {
  const lecture = getAllLectureRecords().find(item => item.id === req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture link not found.' });
  const snapshot = JSON.stringify(rawData);
  for (const subject of rawData.subjects || []) {
    subject.lectures = (subject.lectures || []).filter(item => item.id !== lecture.id);
    subject.videos = (subject.videos || []).filter(item => item.id !== lecture.id && item.url !== lecture.url);
  }
  if (!persistCurriculum()) {
    rawData = JSON.parse(snapshot);
    return res.status(500).json({ success: false, message: 'Could not delete the lecture link.' });
  }
  res.json({ success: true });
});

app.post('/api/admin/notices', (req, res) => {
  const { title, text } = req.body;
  if (typeof title !== 'string' || !title.trim() || title.length > 140 || typeof text !== 'string' || !text.trim() || text.length > 3000) {
    return res.status(400).json({ success: false, message: 'Enter a notice title and text (up to 3,000 characters).' });
  }
  const notice = { id: crypto.randomUUID(), title: title.trim(), text: text.trim(), createdAt: new Date().toISOString() };
  rawData.notices.push(notice);
  if (!persistCurriculum()) {
    rawData.notices.pop();
    return res.status(500).json({ success: false, message: 'Could not save this notice.' });
  }
  res.status(201).json({ success: true, data: notice });
});

app.put('/api/admin/notices/:id', (req, res) => {
  const notice = rawData.notices.find(item => item.id === req.params.id);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
  const title = req.body.title === undefined ? notice.title : req.body.title;
  const text = req.body.text === undefined ? notice.text : req.body.text;
  if (typeof title !== 'string' || !title.trim() || title.length > 140 || typeof text !== 'string' || !text.trim() || text.length > 3000) {
    return res.status(400).json({ success: false, message: 'Enter a notice title and text (up to 3,000 characters).' });
  }
  const previous = { title: notice.title, text: notice.text, updatedAt: notice.updatedAt };
  notice.title = title.trim();
  notice.text = text.trim();
  notice.updatedAt = new Date().toISOString();
  if (!persistCurriculum()) {
    Object.assign(notice, previous);
    return res.status(500).json({ success: false, message: 'Could not save notice changes.' });
  }
  res.json({ success: true, data: notice });
});

app.delete('/api/admin/notices/:id', (req, res) => {
  const index = rawData.notices.findIndex(item => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ success: false, message: 'Notice not found.' });
  const [notice] = rawData.notices.splice(index, 1);
  if (!persistCurriculum()) {
    rawData.notices.splice(index, 0, notice);
    return res.status(500).json({ success: false, message: 'Could not delete the notice.' });
  }
  res.json({ success: true });
});

// Add New Subject (Supports attaching Syllabus PDF from PC)
app.post('/api/admin/subject', (req, res) => {
  const { code, name, shortName, semester, department, branch, track, credits, description, fileData, fileName, fileSize } = req.body;
  const cleanCode = cleanText(code, 24).toUpperCase();
  const cleanName = cleanText(name, 140);
  const dept = department || branch;
  const subTrack = String(track || '').toLowerCase();
  const semesterNumber = Number(semester);
  if (!cleanCode || !cleanName || !Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 8 ||
      !['major', 'minor'].includes(subTrack) || !defaultDepartments.some(item => item.id === dept)) {
    return res.status(400).json({ success: false, message: 'Enter a valid course code, title, department, track, and semester.' });
  }
  if ((rawData.subjects || []).some(subject => subject.code.toLowerCase() === cleanCode.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'A subject with this course code already exists.' });
  }

  let syllabusPdfUrl = null;
  if (fileData) {
    try {
      syllabusPdfUrl = saveBase64File(fileData, fileName || `${cleanCode}_Syllabus.pdf`);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'The syllabus PDF could not be saved.' });
    }
    if (!syllabusPdfUrl) return res.status(400).json({ success: false, message: 'Syllabus must be a valid PDF no larger than 15 MB.' });
  }

  const newSubject = {
    id: `${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}-${cleanText(shortName || cleanName, 60).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    code: cleanCode,
    name: cleanName,
    shortName: cleanText(shortName || cleanName, 60),
    semester: semesterNumber,
    track: subTrack,
    departmentId: dept,
    branches: [dept],
    credits: Number.isInteger(Number(credits)) && Number(credits) > 0 ? Number(credits) : (subTrack === 'major' ? 4 : 3),
    description: cleanText(description, 1000),
    syllabusPdfUrl: syllabusPdfUrl || null,
    syllabusFileName: syllabusPdfUrl ? path.basename(syllabusPdfUrl) : null,
    syllabusFileSize: syllabusPdfUrl ? fs.statSync(getStoredUploadPath(syllabusPdfUrl)).size : null,
    modules: [],
    notes: [],
    pyqs: [],
    lectures: [],
    resources: []
  };

  if (!rawData.subjects) rawData.subjects = [];
  rawData.subjects.unshift(newSubject);
  if (!persistCurriculum()) {
    rawData.subjects.shift();
    if (syllabusPdfUrl) removeStoredFile(getStoredUploadPath(syllabusPdfUrl));
    return res.status(500).json({ success: false, message: 'Could not save the new subject.' });
  }
  refreshNormalizedSubjects();

  res.status(201).json({
    success: true, 
    message: `Subject added successfully${syllabusPdfUrl ? ' with syllabus PDF' : ''}.`,
    data: normalizedSubjects.find(subject => subject.id === newSubject.id)
  });
});

// Delete Subject
app.delete('/api/admin/subject/:id', (req, res) => {
  const id = req.params.id;
  const subject = getRawSubject(id);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  const snapshot = JSON.stringify(rawData);
  const files = new Set(getSubjectResourceRecords(subject).map(resource => getStoredUploadPath(resource.url)).filter(Boolean));
  rawData.subjects = (rawData.subjects || []).filter(item => item.id !== subject.id);
  if (!persistCurriculum()) {
    rawData = JSON.parse(snapshot);
    refreshNormalizedSubjects();
    return res.status(500).json({ success: false, message: 'Could not delete the subject.' });
  }
  for (const filePath of files) removeStoredFile(filePath);
  refreshNormalizedSubjects();
  res.json({ success: true, message: 'Subject deleted successfully' });
});

// About the Developers Page
app.get('/about-developers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about-developers.html'));
});

// Admin Console Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  DBCM Study Material Platform running at:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
