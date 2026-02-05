# TEST VALIDATION REQUIREMENTS

## CRITICAL RULE: Tests Must Validate Outcomes, Not Just Execution

### ❌ FORBIDDEN Test Pattern
```typescript
test('should do something', async () => {
    await functionCall();
    assert.ok(true, 'Function ran without error'); // WORTHLESS
});
```

### ✅ REQUIRED Test Pattern
```typescript
test('should do something', async () => {
    const result = await functionCall();
    
    // Validate ACTUAL outcome
    assert.strictEqual(result.status, 'expected');
    assert.ok(result.data.includes('expected content'));
    assert.strictEqual(result.items.length, 5);
});
```

## For UI Components (WebViews, TreeViews, etc.)

### ✅ HTML Generation Tests
```typescript
test('should generate correct HTML for scenario X', () => {
    const html = view.getHtmlContent(mockData);
    
    // MUST validate visible text
    assert.ok(html.includes('Expected User Message'));
    assert.ok(!html.includes('Should Not Show'));
    
    // MUST validate structure
    assert.ok(html.includes('<div class="expected-class">'));
});
```

### ✅ Integration Tests
```typescript
test('should display correct data in UI', async () => {
    await view.show(mockData);
    
    // Validate what user actually sees
    const displayedText = getVisibleText();
    assert.ok(displayedText.includes('Expected Value'));
});
```

## Test Coverage Requirements

For every user-facing feature:
1. **Happy path**: Normal successful operation
2. **Edge cases**: Empty data, null values, boundaries
3. **Error states**: What user sees when things fail
4. **Visual validation**: HTML/UI contains correct text

## Prevention Checklist

Before marking a feature "complete":
- [ ] Tests validate USER-VISIBLE behavior, not just "no error"
- [ ] Tests check HTML content, not just that HTML is generated
- [ ] Tests verify correct data is displayed for each scenario
- [ ] Tests validate error messages user would see
- [ ] Manual verification performed with actual data

## This Incident

**What went wrong:**
- Tests verified `view.show()` didn't throw
- Tests did NOT verify HTML contained correct content
- Detection logic hid data that should be visible
- No manual verification against SFX behavior

**Cost:**
- User frustration
- Wasted time
- Loss of trust
- Code that "works" but doesn't meet requirements

**Lesson:**
Tests that only verify "didn't crash" are **worse than no tests** - they give false confidence.
