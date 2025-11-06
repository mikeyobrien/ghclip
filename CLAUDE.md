# GHClip Project Conventions

This file defines conventions that ALL Claude sessions must follow when working on this project.

## 📁 Documentation Structure

### MANDATORY: All Documentation Goes in `/docs`

**NEVER** create documentation files in the repository root.

**Correct:**
```
docs/
├── QUICK_START.md
├── GITHUB_APP_SETUP.md
├── CHROME_IDENTITY_SETUP.md
├── OAUTH_VALIDATION_REPORT.md
├── TESTING.md
└── [any other documentation]
```

**Wrong:**
```
❌ QUICK_START.md (root level)
❌ SETUP_GUIDE.md (root level)
❌ HOW_TO.md (root level)
```

### Exceptions (Files that MUST stay in root):

- ✅ `README.md` - Primary project readme
- ✅ `LICENSE` - Project license
- ✅ `CONTRIBUTING.md` - Contribution guidelines (if needed)
- ✅ `.gitignore` - Git configuration
- ✅ `package.json` - Package manifest
- ✅ `manifest.json` - Extension manifest

### When Creating New Documentation:

1. **Always** create files in `/docs` directory
2. Use descriptive, UPPERCASE names: `FEATURE_NAME_GUIDE.md`
3. Update references in code to point to `docs/FILENAME.md`
4. Add entry to `docs/README.md` index (see below)

## 📝 Documentation Index

Create/maintain a `docs/README.md` that lists all documentation:

```markdown
# GHClip Documentation

## Quick Start
- [Quick Start Guide](QUICK_START.md) - Get up and running in 5 minutes

## Setup Guides
- [GitHub App Setup](GITHUB_APP_SETUP.md) - Configure GitHub App
- [Chrome Identity Setup](CHROME_IDENTITY_SETUP.md) - OAuth configuration

## Reference
- [OAuth Validation Report](OAUTH_VALIDATION_REPORT.md) - Security validation
- [Testing Guide](TESTING.md) - QA checklist
```

## 🔗 Linking to Documentation

### In Code Files:

```javascript
// ✅ Correct
console.log('See docs/QUICK_START.md for setup');
throw new Error('Deploy backend - see docs/QUICK_START.md');

// ❌ Wrong
console.log('See QUICK_START.md for setup');
console.log('See backend/README.md'); // Exception: backend has its own docs
```

### In Markdown Files:

```markdown
<!-- ✅ Correct from root README.md -->
See [Quick Start Guide](docs/QUICK_START.md)

<!-- ✅ Correct from within docs/ -->
See [Quick Start Guide](QUICK_START.md)

<!-- ❌ Wrong -->
See [Quick Start Guide](../QUICK_START.md)
```

## 📦 Backend Documentation

The `/backend` directory has its own `README.md` because it's a deployable module.

This is acceptable:
```
backend/
└── README.md  ✅ (deployment-specific docs stay with code)
```

But general guides about the backend should reference:
- `docs/QUICK_START.md` - For user setup
- `backend/README.md` - For technical deployment details

## 🚨 Validation Rules

Before committing, verify:

- [ ] No `.md` files in root except README.md, LICENSE, CONTRIBUTING.md
- [ ] All new documentation is in `/docs`
- [ ] All code references use `docs/` prefix
- [ ] `docs/README.md` index is updated
- [ ] Cross-references between docs are correct

## 🔄 Migration Process

If you find documentation in the wrong place:

1. Move it to `/docs`:
   ```bash
   mv WRONG_PLACE.md docs/
   ```

2. Update all references:
   ```bash
   # Find references
   grep -r "WRONG_PLACE.md" .

   # Update them to docs/WRONG_PLACE.md
   ```

3. Commit with clear message:
   ```
   Move WRONG_PLACE.md to docs directory

   - Moved WRONG_PLACE.md to docs/
   - Updated all references in code
   - Follows project documentation conventions
   ```

## 📂 Other Directory Conventions

### `/backend` - Backend code
- Serverless functions
- Deployment configs
- Backend-specific README

### `/docs` - All documentation
- User guides
- Setup instructions
- Technical reports
- Testing documentation

### `/icons` - Extension icons
- Icon assets
- Generation scripts
- Icon-specific README

### Root Level - Only essentials
- manifest.json
- Source code (.js, .html, .css)
- README.md
- .gitignore
- package.json (if needed)

## ⚡ Quick Reference for Claude Sessions

When creating documentation:

```javascript
// 1. Check if it's a special case (README, LICENSE, etc.)
const specialFiles = ['README.md', 'LICENSE', 'CONTRIBUTING.md'];
if (!specialFiles.includes(filename)) {
  // 2. Put it in docs/
  const filePath = `docs/${filename}`;

  // 3. Update references
  updateReferences(filename, `docs/${filename}`);

  // 4. Update docs index
  updateDocsIndex(filename);
}
```

## 🎯 Why These Conventions?

1. **Cleaner root directory** - Easier to find source code
2. **Organized documentation** - All guides in one place
3. **Scalability** - Easy to add more docs without cluttering
4. **Standard practice** - Follows common open-source conventions
5. **Better navigation** - Users know where to find docs

## 📌 Enforcement

These conventions are **mandatory** for all Claude sessions working on this project.

If a session violates these conventions:
1. The next session should fix it
2. Follow the migration process above
3. Commit with clear documentation restructuring message

---

**Last Updated:** 2025-11-06
**Enforced By:** All Claude sessions via CLAUDE.md (this file)
**Location:** This file MUST be in the repository root as CLAUDE.md
