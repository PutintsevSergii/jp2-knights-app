# No Duplicate Policy (Generic)

Duplication in critical code is a risk for security, maintainability, and correctness.

## Single Sources of Truth

| Concern | Single Source | Risk |
|---------|---------------|------|
| User roles | Shared role enum/constants | Cross-app permission inconsistency |
| Visibility/access filters | Shared visibility utilities | Data leaks if filtering differs |
| Authentication | Shared auth service/helpers | Auth bypasses if logic differs |
| Permission checks | Shared permission utilities | Unauthorized access if checks differ |
| Error handling | Common error contract | Inconsistent error responses |
| Data validation | Shared validators/schemas | Data integrity issues |
| API client | Generated from schema | Type mismatches |
| Business workflows | Shared service logic | Inconsistent state transitions |
| Design tokens | Shared token package | Visual inconsistency |
| Component patterns | Shared component library | UI behavior differences |
| Date/time formatting | Shared formatter | Display inconsistencies |
| Audit/logging | Shared audit helpers | Incomplete audit trails |

## Required Agent Behavior

- [ ] **Search before creating** anything that might be reusable
- [ ] **Check existing code** for patterns in use (roles, enums, services)
- [ ] **Prefer moving** a repeated pattern into a shared library over copying it
- [ ] **Keep shared utilities boring** and domain-specific; avoid speculative frameworks
- [ ] **Use component boundary contracts** before expanding files with reusable behavior
- [ ] **Update shared inventories** when adding new shared code
- [ ] **Document why duplication** exists if temporary during migration

## High-Risk Duplication Areas

These should NEVER be duplicated across your codebase:

### Security-Critical
- [ ] Role definitions and permission checks
- [ ] User authentication logic
- [ ] Access control decisions
- [ ] Data visibility filters
- [ ] Authorization helpers

### Data-Critical
- [ ] Business entity definitions
- [ ] Validation rules
- [ ] State transition logic
- [ ] Domain calculations
- [ ] Audit/logging logic

### Contract-Critical
- [ ] API DTOs/request/response shapes
- [ ] Error response formats
- [ ] API client code
- [ ] Generated types and schemas
- [ ] Message/event contracts

### UI-Critical
- [ ] Design tokens and colors
- [ ] Component variants and styling
- [ ] Reusable layout patterns
- [ ] Form field patterns
- [ ] Navigation components

## Finding Duplicates

When starting work, run these searches:

```bash
# Search for role/permission patterns
grep -r "role\|permission\|access" src/ --include="*.ts"

# Search for existing components
find . -name "*component*" -o -name "*shared*"

# Search for duplicate business logic
grep -r "const.*=.*function\|export.*function" src/ --include="*.ts"

# Search for validation schemas
grep -r "schema\|validation\|validator" src/ --include="*.ts"

# Check for API client code
find . -name "*client*" -o -name "*api*"
```

## Refactoring for Single Source

If you discover duplication:

1. **Identify the pattern** — what concept is repeated?
2. **Choose the best implementation** as the single source
3. **Create shared location** (lib/services/types/components)
4. **Migrate all uses** to the shared version
5. **Remove duplicates** in same commit
6. **Update inventory/docs** if it's a shared component

Example:
```
Before: permission check duplicated in auth service AND api routes
After: shared permission utility used everywhere
       auth service → calls shared utility
       api routes → calls shared utility
       no duplication
```

## Making Exceptions

If duplication is temporary during a migration:

- [ ] Document why it's temporary
- [ ] Set clear timeline for consolidation
- [ ] Add cleanup issue/task
- [ ] Keep exception only in migration scope

If security logic is duplicated temporarily, this is NOT acceptable. Security must have single source immediately.

