# Finishing a Development Branch - Complete Documentation

This skill guides completing development work through verification, structured options, and cleanup.

## Key Process Steps

**Core workflow:** "Verify tests → Present options → Execute choice → Clean up"

The agent must announce: "I'm using the finishing-a-development-branch skill to complete this work."

### Test Verification (Critical First Step)

Before presenting any options, tests must pass. The process runs the project's test suite and stops if failures occur, preventing broken code from being merged or submitted in pull requests.

### Base Branch Determination

The agent identifies the base branch (typically main or master) to understand merge targets.

### The Four Options

The agent presents exactly these choices without elaboration:
1. Merge locally to base branch
2. Push and create a Pull Request
3. Keep branch as-is for later
4. Discard the work

### Execution Details

**Option 1 (Merge):** Switches to base branch, pulls latest, merges feature branch, verifies tests, deletes feature branch, cleans worktree.

**Option 2 (PR):** Pushes branch and creates PR with summary and test plan, preserves worktree.

**Option 3 (Keep):** Preserves branch and worktree unchanged.

**Option 4 (Discard):** Requires typed "discard" confirmation before permanently deleting branch and worktree.

## Critical Rules

Never skip test verification, merge without re-testing, or delete work without explicit confirmation. Only clean worktrees for Options 1 and 4.
