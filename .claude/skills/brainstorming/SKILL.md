# Brainstorming Ideas Into Designs

## Overview

This guide helps transform rough ideas into fully-formed designs through collaborative dialogue. Start by understanding project context, then ask targeted questions to refine the concept. Once you grasp what's being built, present the design in digestible sections while validating incrementally.

## The Process

**Understanding the idea:**
- Review current project state (files, docs, commits)
- Pose questions sequentially to refine thinking
- Favor multiple-choice questions when feasible
- "Only one question per message - if a topic needs more exploration, break it into multiple questions"
- Concentrate on grasping purpose, constraints, and success metrics

**Exploring approaches:**
- Present 2-3 different approaches with corresponding trade-offs
- Frame options conversationally with reasoning
- Lead with the recommended option

**Presenting the design:**
- Once you understand the project, present the design
- Structure into 200-300 word sections
- Validate after each section
- Address: architecture, components, data flow, error handling, testing
- Remain prepared to revisit unclear areas

## After the Design

**Documentation:**
- Write validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Use clear, concise writing skills if available
- Commit the design document to git

**Implementation (if continuing):**
- Ask about readiness to set up for implementation
- Use git worktrees for isolated workspaces
- Create detailed implementation plan

## Key Principles

- **One question at a time** to avoid overwhelming
- **Multiple choice preferred** over open-ended responses
- "YAGNI ruthlessly - Remove unnecessary features from all designs"
- **Explore alternatives** before settling on approach
- **Incremental validation** through section-by-section review
- **Be flexible** and clarify when needed
