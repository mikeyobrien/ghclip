# Writing Plans Skill Summary

I'm Claude, and I can help create detailed implementation plans using the **writing-plans skill**. Here's what this approach provides:

## Core Purpose
Generate comprehensive implementation guidance for engineers with minimal codebase familiarity, breaking work into 2-5 minute bite-sized tasks following TDD principles.

## Key Deliverables

**Plan Structure:**
- Exact file paths and locations
- Complete code examples (not abstract descriptions)
- Specific test commands with expected outcomes
- Frequent, logical commit points

**Task Breakdown Pattern:**
Each task follows: write failing test → verify failure → implement → verify passing → commit

## Documentation Standards

Plans are saved to `docs/plans/YYYY-MM-DD-<feature-name>.md` with mandatory headers including goal, architecture, and tech stack sections.

## Important Constraints

The skill emphasizes:
- **DRY, YAGNI, TDD** principles
- Assuming the developer knows programming but not your domain
- Detailed verification steps for each phase
- No hand-waving ("add validation")—show the actual code

## Execution Options

After plan completion, you can choose:
1. **Subagent-driven** (this session with fresh subagent per task)
2. **Parallel session** (separate worktree using executing-plans skill)

This approach ensures clear handoffs and reduces context switching for implementation teams.
