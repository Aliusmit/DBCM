const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists for PDFs and documents
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to save base64 encoded document to public/uploads
function saveBase64File(fileData, originalFileName) {
  if (!fileData || typeof fileData !== 'string') return null;
  try {
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }
    const ext = path.extname(originalFileName || '') || '.pdf';
    const safeBase = (path.basename(originalFileName || 'document', ext)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}_${safeBase}${ext}`;
    const targetPath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(targetPath, buffer);
    console.log(`[File Upload] Successfully saved file to ${uniqueFilename} (${buffer.length} bytes)`);
    return `/uploads/${uniqueFilename}`;
  } catch (err) {
    console.error('[Upload Error] Failed to save base64 file:', err.message);
    return null;
  }
}

// Disable caching on API endpoints so refresh always returns real-time data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Load curriculum data
const dataFilePath = path.join(__dirname, 'data', 'curriculum.json');
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
  totalStudents: "25,000+ Enrolled Students",
  rating: 4.96
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

// Site Announcement (Admin can update this)
let siteAnnouncement = "🔥 DBCM Semester Exam Prep Portal Active — Select your Department, choose Major or Minor, and access Notes, IMP Questions & PYQs.";

// Academic Announcement Notices (Curriculum Update, Lecture Notes, High-Yield IMPs)
let academicNotices = (rawData && rawData.academicNotices && rawData.academicNotices.length > 0) ? rawData.academicNotices : [
  {
    id: 'curriculum',
    badge: 'Curriculum Update',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: 'layers',
    title: 'NEP 2024–25 Major & Minor Curricula Live',
    desc: 'All 14 DBCM academic departments updated with complete syllabus units, credit weightages, and notes for 1Y, 2Y, 3Y, and 4Y.'
  },
  {
    id: 'notes',
    badge: 'Lecture Notes',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: 'file-text',
    title: 'Comprehensive Study Modules & Unit Notes',
    desc: 'Verified chapter-wise reference notes, lecture presentations, and faculty handouts available for all 14 departments.'
  },
  {
    id: 'imps',
    badge: 'High-Yield IMPs',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: 'flame',
    title: 'Question Banks with Faculty Hints Active',
    desc: 'Explore unit-wise repeated questions with marks breakdown and solution hints to optimize exam performance.'
  }
];

// Helper to save data back to file
function persistCurriculum() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(rawData, null, 2));
    console.log('[Data Saved] Successfully persisted curriculum to disk.');
  } catch (err) {
    console.error('[Data Error] Failed to persist curriculum:', err);
  }
}

// Subject normalizer
function normalizeSubject(s) {
  const deptId = s.departmentId || s.branchId || (Array.isArray(s.branches) ? s.branches[0] : 'bca');
  const track = (s.track || 'major').toLowerCase();

  let imps = s.impQuestions || [];
  if (imps.length === 0 && s.modules) {
    imps = s.modules.flatMap(m => (m.impQuestions || []).map(q => ({
      id: q.id || `q-${Math.random().toString(36).substr(2, 6)}`,
      module: q.module || m.moduleNumber || m.num || 1,
      marks: q.marks || 10,
      frequency: q.frequency || q.examFrequency || "DBCM Exam Paper",
      question: q.question,
      answerHint: q.answerHint || q.modelAnswerSummary || "Refer to standard DBCM lecture notes and syllabus."
    })));
  }

  const videos = (s.videos && s.videos.length > 0) ? s.videos : [
    { channel: "DBCM Faculty Lectures", title: `${s.name} Complete Video Lectures`, url: "https://www.youtube.com", count: 24 },
    { channel: "Academic Masterclass", title: `${s.name} Comprehensive Review`, url: "https://www.youtube.com", count: 16 }
  ];

  const notes = (s.notes && s.notes.length > 0) ? s.notes : [
    { id: `n-${s.id}-1`, title: `${s.name} - Complete DBCM Department Notes`, pages: 58, author: "DBCM Academic Faculty", reads: 14200 },
    { id: `n-${s.id}-2`, title: `${s.name} - Unit Summaries & Quick Revision Guide`, pages: 22, author: "DBCM Subject Cell", reads: 9800 }
  ];

  const pyqs = (s.pyqs && s.pyqs.length > 0) ? s.pyqs : [
    { year: "May / June 2024", session: "Summer 2024", pages: 4, paperType: `DBCM End-Semester Exam (${track.toUpperCase()})`, totalMarks: 80 },
    { year: "Nov / Dec 2023", session: "Winter 2023", pages: 4, paperType: `DBCM End-Semester Exam (${track.toUpperCase()})`, totalMarks: 80 },
    { year: "May / June 2023", session: "Summer 2023", pages: 4, paperType: `DBCM End-Semester Exam (${track.toUpperCase()})`, totalMarks: 80 }
  ];

  const modules = (s.modules && s.modules.length > 0) ? s.modules.map((m, idx) => ({
    num: m.num || m.moduleNumber || (idx + 1),
    title: m.title || `Module ${idx + 1}`,
    weightage: m.weightage || "~14 Marks",
    summary: m.summary || `Syllabus topics for Module ${idx + 1}.`
  })) : [
    { num: 1, title: "Foundations & Core Principles", weightage: "14 Marks", summary: "Theoretical foundations, definitions, and classifications." },
    { num: 2, title: "Governing Models & Architecture", weightage: "16 Marks", summary: "Structural methodologies and standard diagrams." },
    { num: 3, title: "Advanced Implementations", weightage: "18 Marks", summary: "Design paradigms, algorithms, and technical use cases." },
    { num: 4, title: "Applied Problem Solving", weightage: "16 Marks", summary: "Analytical problems, derivations, and proofs." },
    { num: 5, title: "System Protocols & Standards", weightage: "14 Marks", summary: "Operational interfaces and best practices." },
    { num: 6, title: "Modern Trends & Case Studies", weightage: "12 Marks", summary: "Contemporary innovations and case studies." }
  ];

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
    description: s.description || `${s.name} for DBCM undergraduate program.`,
    syllabusPdfUrl: s.syllabusPdfUrl || null,
    syllabusFileName: s.syllabusFileName || null,
    syllabusFileSize: s.syllabusFileSize || null,
    modules: modules,
    impQuestions: imps,
    notes: notes,
    pyqs: pyqs,
    videos: videos
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

// 5. Dedicated PYQ Endpoint (Across all 14 departments)
app.get('/api/pyqs', (req, res) => {
  const { department, track, semester, year, search } = req.query;
  const depts = rawData.departments && rawData.departments.length > 0 ? rawData.departments : defaultDepartments;
  
  let allPyqs = [];
  
  for (const s of normalizedSubjects) {
    const deptObj = depts.find(d => d.id === s.departmentId) || { name: s.departmentId, code: s.departmentId.toUpperCase() };
    for (const p of s.pyqs) {
      allPyqs.push({
        id: `pyq-${s.id}-${p.session.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        subjectId: s.id,
        subjectCode: s.code,
        subjectName: s.name,
        shortName: s.shortName,
        departmentId: s.departmentId,
        departmentName: deptObj.name,
        departmentCode: deptObj.code,
        track: s.track,
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

  // Filter by department
  if (department && department !== 'all') {
    allPyqs = allPyqs.filter(p => p.departmentId === department.toLowerCase());
  }

  // Filter by track
  if (track && track !== 'all') {
    allPyqs = allPyqs.filter(p => (p.track || 'major').toLowerCase() === track.toLowerCase());
  }

  // Filter by semester
  if (semester && semester !== 'all') {
    const semNum = parseInt(semester, 10);
    if (!isNaN(semNum)) {
      allPyqs = allPyqs.filter(p => p.semester === semNum);
    }
  }

  // Filter by year
  if (year && year !== 'all') {
    const y = year.toLowerCase();
    allPyqs = allPyqs.filter(p => p.year.toLowerCase().includes(y) || p.session.toLowerCase().includes(y));
  }

  // Filter by search query
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    allPyqs = allPyqs.filter(p =>
      p.subjectName.toLowerCase().includes(q) ||
      p.subjectCode.toLowerCase().includes(q) ||
      p.departmentName.toLowerCase().includes(q) ||
      p.year.toLowerCase().includes(q) ||
      p.paperType.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: allPyqs.length, data: allPyqs });
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
    return res.json({ success: true, data: { subjects: [], impQuestions: [], notes: [] } });
  }

  const matchedSubjects = [];
  const matchedIMPs = [];
  const matchedNotes = [];

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

    for (const q of s.impQuestions) {
      if (q.question && q.question.toLowerCase().includes(query)) {
        matchedIMPs.push({
          subjectId: s.id,
          subjectName: s.name,
          track: s.track,
          questionId: q.id,
          question: q.question,
          marks: q.marks,
          frequency: q.frequency
        });
      }
    }

    for (const n of s.notes) {
      if (n.title && n.title.toLowerCase().includes(query)) {
        matchedNotes.push({
          subjectId: s.id,
          subjectName: s.name,
          track: s.track,
          noteId: n.id,
          title: n.title,
          pages: n.pages
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      subjects: matchedSubjects.slice(0, 10),
      impQuestions: matchedIMPs.slice(0, 10),
      notes: matchedNotes.slice(0, 10)
    }
  });
});

// 7. Stats
app.get('/api/stats', (req, res) => {
  const totalNotes = normalizedSubjects.reduce((acc, s) => acc + s.notes.length, 0);
  const totalIMPs = normalizedSubjects.reduce((acc, s) => acc + s.impQuestions.length, 0);
  const totalPYQs = normalizedSubjects.reduce((acc, s) => acc + s.pyqs.length, 0);
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
      impsCount: totalIMPs,
      pyqsCount: totalPYQs,
      activeStudents: "25,000+ Enrolled Students",
      announcement: siteAnnouncement,
      academicNotices: academicNotices
    }
  });
});

// 8. Announcement & Academic Notices
app.get('/api/announcement', (req, res) => {
  res.json({
    success: true,
    announcement: siteAnnouncement,
    notices: academicNotices
  });
});

app.get('/api/academic-notices', (req, res) => {
  res.json({
    success: true,
    notices: academicNotices
  });
});

// --- AUTHENTICATION (Student & Admin) ---
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  if (role === 'admin') {
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      return res.json({
        success: true,
        user: { username: 'admin', name: 'DBCM Administrator', role: 'admin', token: 'admin-auth-token-dbcm' }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials. Use admin / admin123' });
    }
  } else {
    const rollOrName = username && username.trim() !== '' ? username.trim() : 'Student';
    return res.json({
      success: true,
      user: {
        username: rollOrName,
        name: rollOrName,
        role: 'student',
        department: req.body.department || req.body.branch || 'bca',
        track: req.body.track || 'major',
        semester: req.body.semester || 1,
        token: 'student-session-dbcm'
      }
    });
  }
});

// --- ADMIN MANAGEMENT ENDPOINTS ---

// Update Site Announcement
app.post('/api/admin/announcement', (req, res) => {
  const { announcement } = req.body;
  if (!announcement || !announcement.trim()) {
    return res.status(400).json({ success: false, message: 'Announcement text is required' });
  }
  siteAnnouncement = announcement.trim();
  res.json({ success: true, message: 'Announcement updated successfully', announcement: siteAnnouncement });
});

// Update Academic Notices (Curriculum Update, Lecture Notes, High-Yield IMPs)
app.post('/api/admin/academic-notices', (req, res) => {
  const { notices, id, title, desc } = req.body;

  if (Array.isArray(notices)) {
    // Bulk update notices
    notices.forEach(n => {
      const target = academicNotices.find(e => e.id === n.id);
      if (target) {
        if (n.title !== undefined) target.title = n.title.trim();
        if (n.desc !== undefined) target.desc = n.desc.trim();
      }
    });
  } else if (id) {
    // Single notice update
    const target = academicNotices.find(e => e.id === id);
    if (!target) {
      return res.status(404).json({ success: false, message: `Notice with ID '${id}' not found` });
    }
    if (title !== undefined) target.title = title.trim();
    if (desc !== undefined) target.desc = desc.trim();
  } else {
    return res.status(400).json({ success: false, message: 'Valid notices array or id with title/desc is required' });
  }

  rawData.academicNotices = academicNotices;
  persistCurriculum();

  res.json({
    success: true,
    message: 'Academic announcement notice updated successfully!',
    notices: academicNotices
  });
});

// Add New Subject (Supports attaching Syllabus PDF from PC)
app.post('/api/admin/subject', (req, res) => {
  const { code, name, shortName, semester, department, branch, track, credits, description, fileData, fileName, fileSize } = req.body;
  if (!code || !name || !semester) {
    return res.status(400).json({ success: false, message: 'Code, Name, and Semester are required' });
  }

  const dept = department || branch || 'bca';
  const subTrack = (track || 'major').toLowerCase();

  // Save syllabus PDF if provided
  let syllabusPdfUrl = null;
  if (fileData) {
    const defaultSyllabusName = `${code.trim().toUpperCase()}_Syllabus.pdf`;
    syllabusPdfUrl = saveBase64File(fileData, fileName || defaultSyllabusName);
  }

  const newSubject = {
    id: `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${(shortName || code).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    code: code.trim().toUpperCase(),
    name: name.trim(),
    shortName: (shortName || name).trim(),
    semester: parseInt(semester, 10),
    track: subTrack,
    departmentId: dept,
    branches: [dept],
    credits: parseInt(credits, 10) || (subTrack === 'major' ? 4 : 3),
    description: description ? description.trim() : `${name} curriculum for DBCM degree program.`,
    syllabusPdfUrl: syllabusPdfUrl || null,
    syllabusFileName: fileName || (syllabusPdfUrl ? path.basename(syllabusPdfUrl) : null),
    syllabusFileSize: fileSize || null,
    modules: [
      { num: 1, title: "Introduction & Unit 1", weightage: "14 Marks", summary: "Module 1 syllabus overview." },
      { num: 2, title: "Core Concepts & Unit 2", weightage: "16 Marks", summary: "Module 2 syllabus overview." },
      { num: 3, title: "Advanced Topics & Unit 3", weightage: "18 Marks", summary: "Module 3 syllabus overview." },
      { num: 4, title: "Applied Problem Solving", weightage: "16 Marks", summary: "Module 4 syllabus overview." },
      { num: 5, title: "Standards & Governance", weightage: "14 Marks", summary: "Module 5 syllabus overview." },
      { num: 6, title: "Modern Applications", weightage: "12 Marks", summary: "Module 6 syllabus overview." }
    ],
    impQuestions: [],
    notes: [],
    pyqs: [],
    videos: []
  };

  const normalized = normalizeSubject(newSubject);
  normalizedSubjects.unshift(normalized);

  if (!rawData.subjects) rawData.subjects = [];
  rawData.subjects.unshift(newSubject);
  persistCurriculum();

  res.json({ 
    success: true, 
    message: `Subject added successfully to DBCM Study Material (${subTrack.toUpperCase()})!${syllabusPdfUrl ? ' (Syllabus PDF uploaded)' : ''}`, 
    data: normalized 
  });
});

// Upload/Add Material to existing Subject (Notes, IMP Question, or PYQ, with PC PDF upload)
app.post('/api/admin/upload-material', (req, res) => {
  const { subjectId, materialType, data } = req.body;
  if (!subjectId || !materialType || !data) {
    return res.status(400).json({ success: false, message: 'Subject ID, Material Type, and Data are required' });
  }

  const subject = normalizedSubjects.find(s => s.id === subjectId || s.code.toLowerCase() === subjectId.toLowerCase());
  if (!subject) {
    return res.status(404).json({ success: false, message: 'Target subject not found' });
  }

  // Save attached PDF / document if provided
  let fileUrl = null;
  const rawBase64 = data.fileData || req.body.fileData;
  const originalFileName = data.fileName || req.body.fileName;
  const originalFileSize = data.fileSize || req.body.fileSize;

  if (rawBase64) {
    fileUrl = saveBase64File(rawBase64, originalFileName || `${subject.code}_${materialType}.pdf`);
  }

  // Also locate the rawSubject in rawData.subjects so changes are persisted to disk
  let rawSub = (rawData.subjects || []).find(s => s.id === subject.id || (s.code && s.code.toLowerCase() === subject.code.toLowerCase()));
  if (!rawSub) {
    if (!rawData.subjects) rawData.subjects = [];
    rawSub = JSON.parse(JSON.stringify(subject));
    rawData.subjects.push(rawSub);
  }

  if (materialType === 'note') {
    const newNote = {
      id: `note-${Date.now()}`,
      title: data.title || (originalFileName ? originalFileName.replace(/\.[^/.]+$/, '') : 'Lecture Notes'),
      pages: parseInt(data.pages, 10) || 24,
      author: data.author || 'DBCM Faculty',
      reads: 1,
      content: data.content || '',
      pdfUrl: fileUrl || data.pdfUrl || null,
      fileName: originalFileName || (fileUrl ? path.basename(fileUrl) : null),
      fileSize: originalFileSize || null,
      uploadedAt: new Date().toISOString()
    };
    subject.notes.unshift(newNote);
    if (!rawSub.notes) rawSub.notes = [];
    rawSub.notes.unshift(newNote);
  } else if (materialType === 'imp') {
    const newImp = {
      id: `q-admin-${Date.now()}`,
      module: parseInt(data.module, 10) || 1,
      marks: parseInt(data.marks, 10) || 10,
      frequency: data.frequency || 'DBCM Mid/End Sem Regular',
      question: data.question || 'Sample High-Yield Question',
      answerHint: data.answerHint || 'Refer to classroom lecture notes.',
      pdfUrl: fileUrl || data.pdfUrl || null,
      fileName: originalFileName || (fileUrl ? path.basename(fileUrl) : null),
      fileSize: originalFileSize || null
    };
    subject.impQuestions.unshift(newImp);
    if (!rawSub.impQuestions) rawSub.impQuestions = [];
    rawSub.impQuestions.unshift(newImp);
  } else if (materialType === 'pyq') {
    const newPyq = {
      year: data.year || '2024',
      session: data.session || 'Regular Exam',
      pages: parseInt(data.pages, 10) || 4,
      paperType: data.paperType || `DBCM End-Semester Exam (${subject.track.toUpperCase()})`,
      totalMarks: parseInt(data.totalMarks, 10) || 80,
      pdfUrl: fileUrl || data.pdfUrl || null,
      fileName: originalFileName || (fileUrl ? path.basename(fileUrl) : null),
      fileSize: originalFileSize || null,
      uploadedAt: new Date().toISOString()
    };
    subject.pyqs.unshift(newPyq);
    if (!rawSub.pyqs) rawSub.pyqs = [];
    rawSub.pyqs.unshift(newPyq);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid material type. Use note, imp, or pyq.' });
  }

  persistCurriculum();
  res.json({ 
    success: true, 
    message: `Successfully added ${materialType.toUpperCase()} to ${subject.name}!${fileUrl ? ' (File attached & saved)' : ''}`, 
    data: subject 
  });
});

// Delete Subject
app.delete('/api/admin/subject/:id', (req, res) => {
  const id = req.params.id;
  normalizedSubjects = normalizedSubjects.filter(s => s.id !== id);
  if (rawData.subjects) {
    rawData.subjects = rawData.subjects.filter(s => s.id !== id);
  }
  persistCurriculum();
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
