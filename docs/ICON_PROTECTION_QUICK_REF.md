# Icon Rendering Protection

## Quick Reference

**CRITICAL:** Do NOT call `_onDidChangeTreeData.fire(child)` on individual static icon items.

## What This Protects

The icon rendering bug where static icons (image store, manifest, events, commands) appeared **without colors** despite having `ThemeColor` configured.

## The Rule

✅ **DO:** Refresh parent container
```typescript
this._onDidChangeTreeData.fire(clusterItem);
```

❌ **DON'T:** Refresh individual static items
```typescript
clusterItem.children.forEach(child => {
    this._onDidChangeTreeData.fire(child);  // ← BREAKS ICON COLORS!
});
```

## Test Protection

Run before committing:
```bash
npm test -- icon-rendering-validation.test.ts
```

**All 10 tests must pass:**
- ✅ No individual static item refresh in populateRootGroupsInBackground
- ✅ Only cluster-level refresh
- ✅ All static icons have ThemeIcon with ThemeColor
- ✅ No post-construction mutations

## Full Documentation

See [ICON_RENDERING_BUG.md](./ICON_RENDERING_BUG.md) for:
- Root cause analysis
- Git history
- VS Code API limitations
- Debugging guide
- Best practices

## Git Context

- **5492bcb** - Working (no background population)
- **c1441db** - Broken (added per-item refresh)
- **80f11e8** - Fixed (removed per-item refresh)
