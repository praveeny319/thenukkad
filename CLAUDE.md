# Working rules for Claude

- Work and push directly on `main`. No `dev` branch, no PRs.
- Before each push: syntax check `src/app.js` (`node --check src/app.js`), then summarize what changed.
- Praveen tests on the live site. If he reports a problem, `git revert` the commit (never rewrite history, never force-push).
- If a change needs SQL in Supabase, give him the SQL and the undo SQL, since `git revert` does not undo database changes.
- Surgical changes only. One issue at a time.
