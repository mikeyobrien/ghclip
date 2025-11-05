# Test-Driven Development (TDD) Guide

This comprehensive document outlines the TDD methodology, emphasizing that developers must write failing tests before implementing features.

## Core Principle

The foundational rule is: "Write the test first. Watch it fail. Write minimal code to pass." The rationale is direct—if you don't observe the test fail initially, you cannot be certain it validates the correct behavior.

## The Discipline

The guide establishes an "Iron Law": production code requires a failing test first. Developers who write code before tests must delete that code and restart. This applies universally, with no exceptions for keeping code "as reference" or adapting existing implementations.

## The Red-Green-Refactor Cycle

The methodology follows three distinct phases:

1. **RED**: Create a minimal failing test demonstrating desired behavior
2. **GREEN**: Implement the simplest code satisfying the test
3. **REFACTOR**: Improve code while keeping tests passing

Each phase has verification checkpoints, which are mandatory. Developers must confirm tests fail for the right reasons and pass completely before proceeding.

## Addressing Objections

The document systematically dismantles common rationalizations for skipping TDD:

- Writing tests afterward produces immediately-passing tests, proving nothing
- Manual testing is ad-hoc and irreproducible
- Deleting unverified code avoids technical debt accumulation
- TDD discovers edge cases through test-first thinking

## Practical Application

The guide provides concrete examples showing well-structured tests versus poorly-designed ones, emphasizing clarity, single-responsibility focus, and real code usage over mocks.

A verification checklist ensures completeness before considering work finished.
