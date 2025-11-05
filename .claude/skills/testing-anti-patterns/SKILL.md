# Testing Anti-Patterns Guide

This document establishes three foundational rules for effective testing:

1. **Never test mock behavior** — verify actual component functionality instead
2. **Never add test-only methods to production classes** — use test utilities
3. **Never mock without understanding dependencies** — comprehend what you're isolating

## Key Principles

The core guidance emphasizes that "Tests must verify real behavior, not mock behavior. Mocks are a means to isolate, not the thing being tested."

The document identifies five major anti-patterns:

**Testing Mock Behavior**: Asserting that mocks exist rather than verifying real component output represents a fundamental test failure.

**Test-Only Methods**: Adding methods like `destroy()` solely for test cleanup pollutes production code. Instead, place cleanup logic in dedicated test utilities.

**Mocking Without Understanding**: Over-mocking to "be safe" often breaks critical test logic by replacing methods whose side effects the test depends upon. Understanding dependency chains before mocking is essential.

**Incomplete Mocks**: Partial mock objects create false confidence—they pass tests while failing in real integration when code accesses unmocked fields.

**Integration Tests as Afterthought**: TDD prevents this by writing tests first, which naturally surfaces what actually needs mocking versus what should remain real.

## Prevention Strategy

Test-Driven Development inherently prevents these anti-patterns by forcing developers to observe tests fail against real implementations before adding mocks. This process reveals whether mocks are genuinely needed or whether complex mock setups suggest reconsidering the testing approach entirely.
