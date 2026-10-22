# DBCM Study Resources

A Node.js and Express web app for browsing the Don Bosco College, Maram course catalogue and finding available PDFs, notes, previous-year question papers (PYQs), lecture links, and notices. Course selection follows programme, Major/Minor track, semester, and subject.

The catalogue is stored as JSON in `data/curriculum.json`; `public/data/curriculum.json` is its generated mirror. Uploaded PDFs are stored under `public/uploads` by default. The admin workspace supports resource replacement and deletion, lecture-link management, notice publishing, and course maintenance.

## Requirements

- Node.js 18 or newer
- npm

## Run Locally

```powershell
npm install
$env:ADMIN_USERNAME = "your-admin-name"
$env:ADMIN_PASSWORD = "use-a-long-unique-password"
npm start
```

Open `http://localhost:3000`. The admin console is at `http://localhost:3000/admin`. Admin credentials are read from the environment; the server does not provide a default password. The login session uses a random, expiring HttpOnly cookie. Clear the environment values when closing the local PowerShell session.

For development with automatic restarts, use `npm run dev` after setting the same environment values.

## Environment

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ADMIN_USERNAME` | Yes, for admin login | None | Administrator username |
| `ADMIN_PASSWORD` | Yes, for admin login | None | Administrator password |
| `PORT` | No | `3000` | HTTP port |
| `UPLOAD_DIR` | No | `public/uploads` | PDF storage directory |
| `CURRICULUM_FILE` | No | `data/curriculum.json` | JSON data file |
| `NODE_ENV` | No | None | Set to `production` to mark the admin cookie Secure |

Do not commit real credentials. Configure them in your host’s environment-variable settings. Admin endpoints require a server-issued session; uploads are limited to valid PDF files up to 15 MB. Lecture links must use HTTPS.

## Data and Hosting

This app needs a Node.js web-service host. GitHub Pages can host only a static version and cannot run the Express API or admin tools.

The default JSON and upload directories are local files. Some hosting plans have an ephemeral filesystem, so admin changes and uploaded files may disappear after a restart or deploy. For durable use, mount persistent storage and set `CURRICULUM_FILE` and `UPLOAD_DIR` to paths on that storage, or move these records and files to a database/object-storage service. Keep backups of the curriculum and uploads.

## Tests

```powershell
npm test
```

The integration test runs the server with a temporary curriculum copy and temporary upload directory. It checks unauthorized access, PDF validation, resource create/replace/delete, lecture-link create/edit/delete, notice create/edit/delete, and logout. It does not change the project’s real curriculum or uploads.

## Regenerate Curriculum

```powershell
node scripts/generate_departments_data.js
```

The generator writes both JSON copies and starts new subjects with no fabricated notes, PYQs, or lecture links. Verify department/course details against the college’s current official curriculum before publishing them.