@AGENTS.md

# Local database
- Local Postgres only (never Neon prod in `.env`). Dev DB `hackathon_app`, tests `hackathon_app_test` (`TEST_DATABASE_URL`).
- Each worktree gets its own DB `hackathon_app_<issue>` and its own Metro port (`--port 80<nn>`).
