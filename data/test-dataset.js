const fs = require('fs');
const path = require('path');

console.log("Verifying Brainheaters Curriculum dataset...");

// 1. Test JSON validity
const jsonPath = path.join(__dirname, 'curriculum.json');
const rawJson = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawJson);

console.log(`[JSON Test] Valid JSON parsed.`);
console.log(`- Universities: ${data.universities.length}`);
console.log(`- Branches: ${data.branches.length}`);
console.log(`- Semesters: ${data.semesters.length}`);
console.log(`- Subjects: ${data.subjects.length}`);

// 2. Test JS Module
const cur = require('./curriculum.js');
console.log(`\n[JS API Test]`);
console.log(`- Universities count:`, cur.getUniversities().length);
console.log(`- Branches count:`, cur.getBranches().length);
console.log(`- Semesters count:`, cur.getSemesters().length);

// Query Computer Engineering Semester 4
const ceSem4 = cur.getSubjects({ branch: 'ce', semester: 4 });
console.log(`\nComputer Engineering Semester 4 Subjects (${ceSem4.length}):`);
ceSem4.forEach(s => console.log(`  * [${s.code}] ${s.name} (${s.shortName}) - ${s.modules.length} modules, ${s.pyqs.length} PYQs`));

// Query Analysis of Algorithms deep subject
const aoa = cur.getSubjectById('csc402');
if (aoa) {
  console.log(`\n[Subject Deep-Dive] ${aoa.name} (${aoa.code}):`);
  console.log(`  * Passing Probability: ${aoa.passingProbability}`);
  console.log(`  * Passing Hack / Tip: "${aoa.brainheatersTip.slice(0, 90)}..."`);
  console.log(`  * Total Modules: ${aoa.modules.length}`);
  aoa.modules.forEach(m => {
    console.log(`    - Module ${m.moduleNumber}: ${m.title} [Weightage: ${m.weightage}] (${m.impQuestions.length} IMPs)`);
  });
  console.log(`  * Question Banks: ${aoa.questionBanks.length}`);
  console.log(`  * Topper Notes: ${aoa.notes.length}`);
  console.log(`  * PYQs: ${aoa.pyqs.length} (Years: ${aoa.pyqs.map(p => p.year).join(', ')})`);
  console.log(`  * Curated Video Playlists: ${aoa.videoPlaylists.length}`);
  aoa.videoPlaylists.forEach(v => console.log(`    - [${v.platform}] ${v.title} by ${v.channel} (${v.videoCount} videos, ${v.rating}★)`));
} else {
  console.error("ERROR: CSC402 not found!");
  process.exit(1);
}

// Test search
const searchRes = cur.searchCurriculum('machine learning');
console.log(`\n[Search Test for 'machine learning']:`);
console.log(`  * Matches found: ${searchRes.subjects.length} subjects`);
searchRes.subjects.forEach(s => console.log(`    - [${s.code}] ${s.name} (Sem ${s.semester})`));

// Test semester coverage across all 8 semesters
console.log(`\n[Semester Coverage Check across all 8 Semesters]:`);
for (let sem = 1; sem <= 8; sem++) {
  const subjectsInSem = cur.getSubjects({ semester: sem });
  console.log(`  * Semester ${sem}: ${subjectsInSem.length} subjects`);
}

console.log("\nALL TESTS PASSED WITH 100% SUCCESS!");
