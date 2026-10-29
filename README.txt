MATCHDAY TOURNAMENT MANAGER — UPDATED FRONTEND DEMO

START HERE
1. Extract this ZIP into one folder. Keep all HTML, CSS and JS files together.
2. Open index.html in a browser, or deploy the folder to GitHub Pages.
3. Demo admin login: admin@matchday.demo / admin123
4. Register a student, log in as admin, approve the application, assign a team, then add match results.
5. Teams, scores, points table, leaderboard and dashboard now read from the same localStorage data.

IMPORTANT LIMITATIONS
- This is a frontend prototype. Data is saved only in the same browser/device and is not shared across users or devices.
- Client-side role checks are not secure authentication. Do not use real/private passwords. A backend and database are required for real multi-user use.
- The schedule page shows recorded matches; future fixture scheduling/time/venue management is not implemented.
- If your browser already contains old demo data, it may remain in localStorage. Use browser DevTools > Application > Local Storage to clear keys beginning with matchday_demo_ if you want a clean demo.

UPDATED FILES
app.js, teams.js, scores.js, tables.js, teams.html, points.html, leaderboard.html, schedule.html. Other original design files are retained.
