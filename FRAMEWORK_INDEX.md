# Agent Framework - Complete Index

## 📍 Location Reference

### In Project Root (`/jp/`)

#### **AGENT_FRAMEWORK_RECAP.md** ⭐ START HERE
Comprehensive breakdown of JP project's agent approaches, rules, and best practices. Bridge between project-specific implementation and generic framework.
- **Read time:** 15 minutes
- **Purpose:** Understand how JP project uses agents
- **Contains:** Core principles, workflow, rules, patterns, quality gates

#### **AGENT_FRAMEWORK_SUMMARY.md** 📋 OVERVIEW
Complete summary of all created files and how they work together.
- **Read time:** 10 minutes
- **Purpose:** See the big picture
- **Contains:** What was created, file descriptions, key concepts

#### **FRAMEWORK_INDEX.md** (this file)
Navigation guide to all framework files.

---

### In `generic-agent-framework/` Folder

#### Getting Started (Read in This Order)

1. **README.md** — Framework overview
   - 5 min read
   - What the framework provides
   - How to adapt for your project
   - Examples for different project types

2. **QUICKSTART.md** — 30-minute setup
   - Step-by-step: Copy → Customize → Test
   - Quick edits for each file
   - Common customizations per tech stack

3. **FRAMEWORK_GUIDE.md** — Complete integration
   - File relationships and dependencies
   - Detailed usage guide for each file
   - Line-by-line customization checklist
   - 4-week implementation roadmap

---

#### Daily Reference (Agents Use These)

4. **AGENTS-generic.md** — Operating contract
   - Quick checklist (before/during/after work)
   - Non-negotiables (hard rules)
   - Scope control process
   - Final response requirements

5. **coding-agent-instructions-generic.md** — Workflow
   - Step-by-step starting guide
   - Code organization patterns
   - Testing requirements
   - Documentation best practices

---

#### Task Planning (When Creating Work)

6. **backlog-format-generic.md** — Story structure
   - Epic/Feature/Story format
   - Acceptance criteria template
   - Technical notes
   - Tests required
   - Complete example story

7. **working-agreement-generic.md** — Team rules
   - Core rules for agents
   - Approval process for scope changes
   - Team expectations

---

#### Quality Standards (Used During Code Review)

8. **quality-gates-generic.md** — Pipeline checks
   - Standard completion commands (customize for your stack)
   - Extra gates by change type
   - 80% coverage requirement
   - Red pipeline rule

9. **definition-of-done-generic.md** — Completion checklists
   - Backend service checklist
   - Database migration checklist
   - Frontend page/screen checklist
   - Frontend component checklist
   - Quality gates checklist

---

#### Architecture Guidance (When Planning Features)

10. **component-boundary-contracts-generic.md** — File ownership
    - When to split files
    - Feature contract template
    - Common architecture patterns
    - Component responsibility rules
    - New feature checklist

11. **no-duplicate-policy-generic.md** — Code reuse rules
    - Single sources of truth
    - High-risk duplication areas
    - How to find and fix duplicates
    - Search examples

---

#### Documentation (When Committing)

12. **documentation-sync-generic.md** — Keeping docs current
    - Files that must sync (same commit)
    - Documentation by change type
    - Progress tracking patterns
    - Commit message guidelines
    - Common mistakes to avoid

---

## 🎯 Reading by Role

### If You're a Software Engineer
1. AGENT_FRAMEWORK_RECAP.md (understand approach)
2. generic-agent-framework/AGENTS-generic.md (daily reference)
3. generic-agent-framework/coding-agent-instructions-generic.md (workflow)
4. generic-agent-framework/definition-of-done-generic.md (what "done" means)

### If You're a Tech Lead / Architect
1. AGENT_FRAMEWORK_RECAP.md (understand approach)
2. generic-agent-framework/FRAMEWORK_GUIDE.md (how to implement)
3. generic-agent-framework/component-boundary-contracts-generic.md (architecture)
4. generic-agent-framework/no-duplicate-policy-generic.md (code reuse)

### If You're Setting Up a New Project
1. AGENT_FRAMEWORK_SUMMARY.md (see what's available)
2. generic-agent-framework/QUICKSTART.md (30-minute setup)
3. generic-agent-framework/FRAMEWORK_GUIDE.md (detailed checklist)
4. Customize files using checklist

### If You're Reviewing Code
1. generic-agent-framework/definition-of-done-generic.md (checklist)
2. generic-agent-framework/quality-gates-generic.md (standards)
3. generic-agent-framework/no-duplicate-policy-generic.md (duplication check)
4. generic-agent-framework/component-boundary-contracts-generic.md (architecture)

---

## 📊 Quick Reference Table

| Need | File | Read Time | Purpose |
|------|------|-----------|---------|
| Understand JP approach | AGENT_FRAMEWORK_RECAP.md | 15 min | Learn from existing implementation |
| See big picture | AGENT_FRAMEWORK_SUMMARY.md | 10 min | Overview of all files |
| Set up framework | QUICKSTART.md | 30 min | Quick adaptation |
| Deep dive implementation | FRAMEWORK_GUIDE.md | 1 hour | Complete understanding |
| Daily checklist | AGENTS-generic.md | 5 min | Quick reference |
| How to start work | coding-agent-instructions-generic.md | 10 min | Workflow details |
| Create stories | backlog-format-generic.md | 5 min | Story structure |
| Quality standards | quality-gates-generic.md | 10 min | Pipeline checks |
| Code review | definition-of-done-generic.md | 10 min | Done checklist |
| Architecture | component-boundary-contracts-generic.md | 15 min | File ownership |
| Code reuse | no-duplicate-policy-generic.md | 5 min | Duplication rules |
| Commit docs | documentation-sync-generic.md | 10 min | Sync discipline |
| Team rules | working-agreement-generic.md | 5 min | Non-negotiables |

---

## 🚀 Quick Start Paths

### Path A: 30-Minute Quick Start
1. Read: generic-agent-framework/QUICKSTART.md
2. Copy files to your project
3. Customize top 5 files
4. Share AGENTS.md with team
5. Done!

### Path B: 2-Hour Thorough Implementation
1. Read: AGENT_FRAMEWORK_RECAP.md (15 min)
2. Read: generic-agent-framework/README.md (10 min)
3. Read: generic-agent-framework/FRAMEWORK_GUIDE.md (45 min)
4. Customize using checklist (30 min)
5. Create progress tracking doc (10 min)
6. Train team (10 min)

### Path C: Full Understanding (4-6 Hours)
1. Read all framework files in order
2. Create all customization checklist items
3. Set up CI/CD with quality gates
4. Create all project-specific docs
5. Run through example story
6. Train team on each file

---

## 🔗 File Dependencies

```
START HERE
    ↓
AGENT_FRAMEWORK_RECAP.md (understand)
    ↓
    ├─→ Generic Framework README.md
    ├─→ Generic Framework QUICKSTART.md
    └─→ Generic Framework FRAMEWORK_GUIDE.md
            ↓
            All other files depend on these 3
```

**For agents starting work:**
```
AGENTS-generic.md
    ↓
    ├─→ coding-agent-instructions-generic.md
    ├─→ backlog-format-generic.md
    ├─→ quality-gates-generic.md
    └─→ definition-of-done-generic.md
```

**For code review:**
```
definition-of-done-generic.md
    ↓
    ├─→ quality-gates-generic.md
    ├─→ component-boundary-contracts-generic.md
    └─→ no-duplicate-policy-generic.md
```

**For planning architecture:**
```
component-boundary-contracts-generic.md
    ↓
    ├─→ no-duplicate-policy-generic.md
    └─→ documentation-sync-generic.md
```

---

## 📥 How to Get These Files

### Option 1: Copy from JP Project
```bash
cp /Users/perfrico/projects/anigravity-projects/jp/AGENT_FRAMEWORK_RECAP.md ./
cp -r /Users/perfrico/projects/anigravity-projects/jp/generic-agent-framework ./
```

### Option 2: View in Your Editor
Open these files:
- `/Users/perfrico/projects/anigravity-projects/jp/AGENT_FRAMEWORK_RECAP.md`
- `/Users/perfrico/projects/anigravity-projects/jp/generic-agent-framework/`

---

## ✅ Verification Checklist

You have all files if you can answer YES to:

- [ ] Can find AGENT_FRAMEWORK_RECAP.md
- [ ] Can find AGENT_FRAMEWORK_SUMMARY.md
- [ ] Can find generic-agent-framework/ folder
- [ ] Folder has 12 files (README.md + 11 others)
- [ ] All filenames end in `-generic.md` except README.md, FRAMEWORK_GUIDE.md, QUICKSTART.md
- [ ] Can read AGENTS-generic.md (operating contract)
- [ ] Can read coding-agent-instructions-generic.md (workflow)
- [ ] Can read definition-of-done-generic.md (done checklist)
- [ ] Can read component-boundary-contracts-generic.md (architecture)

---

## 🎓 What This Framework Teaches

After reading and implementing, you'll understand:

✅ Scope control without constant battles
✅ Quality gates that actually prevent bugs
✅ Code organization that scales
✅ Documentation that stays current
✅ Duplication prevention for critical code
✅ Clear component responsibilities
✅ Consistent team standards
✅ Progress tracking that's reliable

---

## 💡 Pro Tips

1. **Start with QUICKSTART.md** if you're in a hurry
2. **Use FRAMEWORK_GUIDE.md** for detailed customization
3. **Share AGENTS-generic.md** with your whole team
4. **Use definition-of-done-generic.md** in code reviews
5. **Keep component-boundary-contracts-generic.md** open when planning
6. **Reference documentation-sync-generic.md** before committing

---

## 🔄 Next Steps

1. [ ] Read AGENT_FRAMEWORK_RECAP.md
2. [ ] Choose your learning path (Quick/Thorough/Full)
3. [ ] Copy files to your project
4. [ ] Customize for your tech stack
5. [ ] Create progress tracking document
6. [ ] Share with team
7. [ ] Use during development
8. [ ] Collect feedback and iterate

---

Last Updated: 2026-05-08
