const fs = require('fs');
const path = require('path');

const pages = {
    Admin: ['Dashboard', 'Users', 'Quizzes', 'Questions', 'Attempts', 'Analytics'],
    Teacher: ['Dashboard', 'MyQuizzes', 'CreateQuiz', 'EditQuiz', 'QuestionBank', 'Attempts', 'ReviewAttempt'],
    Student: ['Dashboard', 'QuizList', 'QuizDetail', 'TakeQuiz', 'Result', 'History'],
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writePage(dir, name) {
    const jsx = `import React from 'react';\nimport './${name}.css';\n\nexport default function ${name}(){\n  return (\n    <div className="container ${name.toLowerCase()}">\n      <div className="card">\n        <h2>${name}</h2>\n        <p>Placeholder content for ${name} page.</p>\n      </div>\n    </div>\n  );\n}\n`;
    fs.writeFileSync(path.join(dir, `${name}.jsx`), jsx);

    const css = `.container {\n  padding: 24px;\n}\n.card {\n  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 6px 18px rgba(8, 20, 50, 0.08);\n}\n.${name.toLowerCase()} h2 {\n  background: linear-gradient(90deg,#6a11cb,#2575fc);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n`;
    fs.writeFileSync(path.join(dir, `${name}.css`), css);
}

function writeIndex(dir, list) {
    let content = list.map(n => `export { default as ${n} } from './${n}';`).join('\n') + '\n';
    fs.writeFileSync(path.join(dir, `index.js`), content);
}

for (const [module, comps] of Object.entries(pages)) {
    const base = path.join(__dirname, '..', 'src', 'pages', module);
    ensureDir(base);
    comps.forEach(c => writePage(base, c));
    // also add index that exports
    writeIndex(base, comps);
    // add module-level css
    const moduleCss = `/* ${module} shared styles */\n.container{padding:20px;}\n.card{padding:18px;border-radius:10px;}\n`;
    fs.writeFileSync(path.join(base, `${module}.css`), moduleCss);
}

// NotFound
const nfDir = path.join(__dirname, '..', 'src', 'pages', 'NotFound');
ensureDir(nfDir);
fs.writeFileSync(path.join(nfDir, 'NotFound.jsx'), `import React from 'react';\nimport './NotFound.css';\nexport default function NotFound(){\n  return (\n    <div className=\"container notfound\">\n      <div className=\"card\">\n        <h1>404 — Page Not Found</h1>\n        <p>The page you&apos;re looking for doesn\'t exist.</p>\n      </div>\n    </div>\n  );\n}\n`);
fs.writeFileSync(path.join(nfDir, 'NotFound.css'), `.container{padding:30px;text-align:center;}\n.card{padding:30px;border-radius:12px;}\n`);
fs.writeFileSync(path.join(nfDir, 'index.js'), `export { default } from './NotFound';\n`);

console.log('Pages generated.');
