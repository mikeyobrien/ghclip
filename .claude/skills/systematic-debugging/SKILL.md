# Systematic Debugging Framework

This guide emphasizes a disciplined four-phase approach to problem-solving that prioritizes understanding root causes before attempting fixes.

## Core Principle

The framework's foundation is uncompromising: **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST."** Random fixes waste time and mask underlying issues.

## The Four Essential Phases

**Phase 1: Root Cause Investigation** focuses on careful error analysis, consistent reproduction, reviewing recent changes, and gathering diagnostic evidence. For multi-component systems, the approach requires instrumenting each boundary to identify exactly where failures occur.

**Phase 2: Pattern Analysis** involves locating working examples, comparing them against broken code, and understanding all dependencies and assumptions involved.

**Phase 3: Hypothesis and Testing** applies scientific methodology—formulating specific theories, making minimal changes, and testing one variable at a time rather than bundling modifications.

**Phase 4: Implementation** includes creating failing test cases first, implementing focused fixes, and recognizing architectural problems when three or more fixes successively fail.

## Critical Red Flags

The guide warns against several dangerous patterns: proposing solutions before understanding data flow, attempting multiple fixes simultaneously, claiming "simple bugs don't need process," or continuing fix attempts beyond two failures without reconsidering the architecture itself.

## Key Insight

The document emphasizes that **"rushing guarantees rework"**—systematic investigation actually proves faster than iterative guessing in real-world debugging scenarios.
