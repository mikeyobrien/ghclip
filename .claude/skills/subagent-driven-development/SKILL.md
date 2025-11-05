# Subagent-Driven Development Summary

This workflow orchestrates implementation by dispatching independent subagents for each task within a single session, incorporating code reviews between steps.

## Key Characteristics

**Core approach:** The method emphasizes "Fresh subagent per task + review between tasks = high quality, fast iteration." Each subagent works independently, eliminating context pollution while maintaining quality checkpoints.

**When applicable:** Use this technique when staying in the current session with mostly independent tasks and wanting continuous progress with built-in quality gates. Avoid it when needing to review plans first or handling tightly coupled tasks.

## Workflow Steps

The process follows a structured sequence: load the plan into a TodoWrite, dispatch fresh subagents for implementation, conduct code reviews via specialized reviewers, apply feedback, and mark tasks complete. After all tasks finish, a final review ensures requirements are met before completion.

**Critical safeguards:** Never skip code reviews, proceed with unfixed critical issues, or dispatch multiple implementation subagents in parallel.

## Supporting Requirements

This skill requires three integrated workflows: **writing-plans** creates the foundation, **requesting-code-review** handles quality gates at each step, and **finishing-a-development-branch** finalizes the work. All subagents should employ test-driven development practices.

The approach offers advantages over manual execution through automated TDD application, fresh context per task, and early issue detection—though it requires additional subagent invocations.
