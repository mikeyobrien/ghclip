# Using Git Worktrees - Complete Reference

Git worktrees enable isolated workspaces within a shared repository, letting you work on multiple branches simultaneously. The approach prioritizes systematic directory selection combined with safety checks.

## Key Workflow Steps

**Announcement:** Begin by stating "I'm using the using-git-worktrees skill to set up an isolated workspace."

**Directory Priority:**
1. Check for existing `.worktrees/` or `worktrees/` directories
2. Review CLAUDE.md for stated preferences
3. Ask the user if neither exists

**Safety-Critical Verification:**
For project-local directories, confirm the location appears in `.gitignore` before proceeding. If absent, add it immediately and commit this change—this prevents accidentally tracking worktree contents.

**Setup Process:**
After creating the worktree with `git worktree add`, auto-detect the project type and run appropriate dependency installation (npm, cargo, pip, poetry, or go mod). Then execute baseline tests to establish a clean starting point.

## Critical Rules

Never skip `.gitignore` verification for project-local worktrees. Always follow the directory priority order rather than assuming locations. Report test failures and request explicit permission before proceeding. Auto-detect setup commands based on project files instead of hardcoding them.

The skill pairs with "finishing-a-development-branch" for cleanup and integrates with implementation-focused skills like "executing-plans."
