const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const projectRoot = path.join(__dirname, '..');
let temporaryRoot;
let uploadRoot;
let curriculumPath;
let baseUrl;
let serverProcess;
let adminCookie;

async function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const { port } = listener.address();
      listener.close(error => error ? reject(error) : resolve(port));
    });
  });
}

async function callApi(route, options = {}, authenticated = true) {
  const headers = new Headers(options.headers || {});
  if (authenticated && adminCookie) headers.set('Cookie', adminCookie);
  const response = await fetch(`${baseUrl}${route}`, { ...options, headers });
  const responseText = await response.text();
  let body = {};
  try { body = JSON.parse(responseText); } catch (_) { body.message = responseText; }
  return { response, body };
}

function postJson(body) {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (serverProcess.exitCode !== null) throw new Error('Test server exited during startup.');
    try {
      const response = await fetch(`${baseUrl}/api/subjects`);
      if (response.ok) return;
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Test server did not start in time.');
}

before(async () => {
  temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dbcm-resource-test-'));
  uploadRoot = path.join(temporaryRoot, 'uploads');
  curriculumPath = path.join(temporaryRoot, 'curriculum.json');
  fs.copyFileSync(path.join(projectRoot, 'data', 'curriculum.json'), curriculumPath);
  fs.mkdirSync(uploadRoot, { recursive: true });
  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, [path.join(projectRoot, 'server.js')], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      ADMIN_USERNAME: 'test-admin',
      ADMIN_PASSWORD: 'test-password-for-local-suite',
      UPLOAD_DIR: uploadRoot,
      CURRICULUM_FILE: curriculumPath
    },
    stdio: 'ignore'
  });
  await waitForServer();
});

after(() => {
  if (serverProcess && serverProcess.exitCode === null) serverProcess.kill();
  if (temporaryRoot) fs.rmSync(temporaryRoot, { recursive: true, force: true });
});

test('admin APIs protect and persist resource, lecture, and notice workflows', async () => {
  const unauthorized = await callApi('/api/admin/notices', postJson({ title: 'No access', text: 'No access' }), false);
  assert.equal(unauthorized.response.status, 401);

  const invalidLogin = await callApi('/api/auth/login', postJson({ username: 'wrong', password: 'wrong', role: 'admin' }), false);
  assert.equal(invalidLogin.response.status, 401);
  const malformedLogin = await callApi('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'null' }, false);
  assert.equal(malformedLogin.response.status, 400);

  const login = await callApi('/api/auth/login', postJson({ username: 'test-admin', password: 'test-password-for-local-suite', role: 'admin' }), false);
  assert.equal(login.response.status, 200);
  const setCookie = login.response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  adminCookie = setCookie.split(';')[0];

  const initial = await callApi('/api/subjects');
  const subjectId = initial.body.data[0].id;
  const invalidFile = await callApi('/api/admin/resources', postJson({
    subjectId, category: 'pyqs', title: 'Invalid paper', fileName: 'paper.pdf', fileData: 'data:application/pdf;base64,SGVsbG8='
  }));
  assert.equal(invalidFile.response.status, 400);

  const firstPdf = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\nFirst\n%%EOF').toString('base64')}`;
  const createdResource = await callApi('/api/admin/resources', postJson({
    subjectId, category: 'pyqs', title: 'Exam paper 2025', description: 'End-semester paper', fileName: 'paper.pdf', fileData: firstPdf
  }));
  assert.equal(createdResource.response.status, 201);
  const resourceId = createdResource.body.data.id;
  const firstFile = path.join(uploadRoot, path.basename(createdResource.body.data.url));
  assert.equal(fs.existsSync(firstFile), true);

  const listedResources = await callApi(`/api/resources?subjectId=${encodeURIComponent(subjectId)}&category=pyqs`);
  assert.equal(listedResources.body.count, 1);
  assert.equal(listedResources.body.data[0].id, resourceId);

  const replacementPdf = `data:application/pdf;base64,${Buffer.from('%PDF-1.4\nReplacement\n%%EOF').toString('base64')}`;
  const replaced = await callApi(`/api/admin/resources/${resourceId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Corrected paper 2025', fileName: 'corrected.pdf', fileData: replacementPdf })
  });
  assert.equal(replaced.response.status, 200);
  assert.equal(replaced.body.data.id, resourceId);
  assert.equal(fs.existsSync(firstFile), false);
  assert.equal((await callApi(`/api/resources?subjectId=${encodeURIComponent(subjectId)}&category=pyqs`)).body.count, 1);

  const deletedResource = await callApi(`/api/admin/resources/${resourceId}`, { method: 'DELETE' });
  assert.equal(deletedResource.response.status, 200);
  assert.equal(fs.existsSync(path.join(uploadRoot, path.basename(replaced.body.data.url))), false);
  assert.equal((await callApi(`/api/resources?subjectId=${encodeURIComponent(subjectId)}&category=pyqs`)).body.count, 0);

  const invalidLecture = await callApi('/api/admin/lectures', postJson({ subjectId, title: 'Lecture', url: 'http://example.org/lecture' }));
  assert.equal(invalidLecture.response.status, 400);
  const createdLecture = await callApi('/api/admin/lectures', postJson({ subjectId, title: 'Lecture 1', url: 'https://example.org/lecture-1', lecturer: 'Faculty' }));
  assert.equal(createdLecture.response.status, 201);
  const lectureId = createdLecture.body.data.id;
  assert.equal((await callApi(`/api/lectures?subjectId=${encodeURIComponent(subjectId)}`)).body.count, 1);
  const updatedLecture = await callApi(`/api/admin/lectures/${lectureId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subjectId, title: 'Updated lecture', url: 'https://example.org/lecture-2' })
  });
  assert.equal(updatedLecture.response.status, 200);
  assert.equal(updatedLecture.body.data.title, 'Updated lecture');
  assert.equal((await callApi(`/api/lectures?subjectId=${encodeURIComponent(subjectId)}`)).body.count, 1);
  assert.equal((await callApi(`/api/admin/lectures/${lectureId}`, { method: 'DELETE' })).response.status, 200);
  assert.equal((await callApi(`/api/lectures?subjectId=${encodeURIComponent(subjectId)}`)).body.count, 0);

  const createdNotice = await callApi('/api/admin/notices', postJson({ title: 'Exam schedule', text: 'The schedule is now available.' }));
  assert.equal(createdNotice.response.status, 201);
  const noticeId = createdNotice.body.data.id;
  assert.equal((await callApi('/api/notices')).body.count, 1);
  const updatedNotice = await callApi(`/api/admin/notices/${noticeId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Updated schedule information.' })
  });
  assert.equal(updatedNotice.response.status, 200);
  assert.equal(updatedNotice.body.data.text, 'Updated schedule information.');
  assert.equal((await callApi(`/api/admin/notices/${noticeId}`, { method: 'DELETE' })).response.status, 200);
  assert.equal((await callApi('/api/notices')).body.count, 0);

  await callApi('/api/auth/logout', { method: 'POST' });
  adminCookie = '';
  assert.equal((await callApi('/api/admin/resources', {}, false)).response.status, 401);
});

test('curriculum generator keeps the mirrored datasets aligned without fabricated resources', () => {
  const generatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dbcm-generator-test-'));
  try {
    const scriptDirectory = path.join(generatedRoot, 'scripts');
    fs.mkdirSync(scriptDirectory, { recursive: true });
    fs.mkdirSync(path.join(generatedRoot, 'data'), { recursive: true });
    fs.mkdirSync(path.join(generatedRoot, 'public', 'data'), { recursive: true });
    fs.copyFileSync(path.join(projectRoot, 'scripts', 'generate_departments_data.js'), path.join(scriptDirectory, 'generate_departments_data.js'));
    const result = spawnSync(process.execPath, [path.join(scriptDirectory, 'generate_departments_data.js')], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const serverData = JSON.parse(fs.readFileSync(path.join(generatedRoot, 'data', 'curriculum.json'), 'utf8'));
    const publicData = JSON.parse(fs.readFileSync(path.join(generatedRoot, 'public', 'data', 'curriculum.json'), 'utf8'));
    assert.deepEqual(publicData, serverData);
    assert.equal(serverData.meta.totalSubjects, serverData.subjects.length);
    assert.equal(serverData.notices.length, 0);
    for (const subject of serverData.subjects) {
      assert.equal(subject.notes.length, 0);
      assert.equal(subject.pyqs.length, 0);
      assert.equal(subject.impQuestions.length, 0);
      assert.equal(subject.lectures.length, 0);
    }
  } finally {
    fs.rmSync(generatedRoot, { recursive: true, force: true });
  }
});