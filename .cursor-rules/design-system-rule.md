---
agent: rule
title: Use Only Design System Colors and Typography
description: Always use CSS variables and utility classes from design-system.css for all color and typography values. Do not use hardcoded hex, rgb, rgba, font-size, or font-weight values. Do not use rem for font sizes, only px.
---

# Cursor Rule: Use Only Design System Colors and Typography

## 1. Colors: Only Use Design System Variables
**Rule:**
- Always use CSS variables from `design-system.css` for all color values in your styles.
- Do NOT use hardcoded hex, rgb, or rgba values for colors.

### Good Examples
```css
.button {
  background: var(--bs-blue-5);
  color: var(--bs-white);
}

.error {
  color: var(--bs-red-5);
  background: var(--bs-red-1);
}

.box {
  background: linear-gradient(90deg, var(--bs-blue-5) 0%, var(--bs-blue-4) 100%);
}
```

### Bad Examples
```css
.button {
  background: #3b82f6;
  color: #fff;
}

.error {
  color: #e11d48;
  background: #fef2f2;
}

.box {
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
}
```

---

## 2. Typography: Only Use Utility Classes, Not font-size/font-weight
**Rule:**
- Do NOT use `font-size` or `font-weight` directly in your CSS or inline styles.
- Use the utility classes from `design-system.css` (e.g., `text-body`, `text-headline-6`, `text-headline-1`, `text-caption`, `text-disabled`).
- In React, use `getClasses()` to combine these classes.

### Good Examples
```tsx
<div className={getClasses(['text-headline-4', 'color-black-6'])}>Title</div>
<span className={getClasses(['text-body', 'color-gray-6'])}>Description</span>
<p className={getClasses(['text-caption'])}>Caption text</p>
```

### Bad Examples
```css
.title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
}

.caption {
  font-size: 13px;
  color: #bbb;
}
```
```tsx
<div style={{ fontSize: '2rem', fontWeight: 700 }}>Title</div>
<span style={{ fontSize: '13px', color: '#bbb' }}>Caption text</span>
```

---

## 3. Do Not Use rem, Only px
**Rule:**
- Do NOT use `rem` units. Use `px` as in `design-system.css`.
- All font sizes in the design system are defined in px for consistency.

### Good Examples
```css
.text-body {
  font-size: 12px;
}
.text-headline-4 {
  font-size: 22px;
}
```

### Bad Examples
```css
.text-body {
  font-size: 0.75rem;
}
.text-headline-4 {
  font-size: 1.375rem;
}
```

---

## 4. Use getClasses() for Combining Utility Classes in React
**Rule:**
- Always use the `getClasses()` utility to combine multiple utility classes in React components.
- Do NOT concatenate class names manually or use template strings for utility classes.

### Good Examples
```tsx
<div className={getClasses(['text-headline-4', 'color-black-6'])}>Title</div>
<span className={getClasses(['text-body', 'color-gray-6'])}>Description</span>
```

### Bad Examples
```tsx
<div className={"text-headline-4 color-black-6"}>Title</div>
<span className={"text-body color-gray-6"}>Description</span>
```

---

## 5. Do Not Use Inline Styles for Layout, Colors, or Typography
**Rule:**
- Do NOT use inline styles for layout, color, or typography. Use CSS Modules or global utility classes instead.
- For third-party components (e.g., rc-slider) that require style objects, use only design system CSS variables (e.g., var(--bs-red-5)), never hardcoded values.

### Good Examples
```tsx
// Using CSS module for layout and utility classes for typography
<div className={getClasses([styles.sliderContainer, 'text-body'])}>...</div>

// rc-slider with design system variables
<Slider
  trackStyle={[{ backgroundColor: 'var(--bs-red-5)' }]}
  handleStyle={[{ borderColor: 'var(--bs-red-5)' }]}
  railStyle={{ backgroundColor: 'var(--bs-gray-2)' }}
/>
```

### Bad Examples
```tsx
// Inline style for layout or color
<div style={{ padding: '24px', color: '#e11d48', fontSize: '13px' }}>...</div>

// rc-slider with hardcoded hex values
<Slider
  trackStyle={[{ backgroundColor: '#e11d48' }]}
  handleStyle={[{ borderColor: '#e11d48' }]}
  railStyle={{ backgroundColor: '#eee' }}
/>
```

---

## 6. Use Logical Properties for Direction (start/end) Instead of left/right
**Rule:**
- Always use logical CSS properties (inset-inline-start, inset-inline-end, margin-inline-start, margin-inline-end, padding-inline-start, padding-inline-end, border-inline-start, border-inline-end, etc.) instead of left/right, margin-left/right, padding-left/right, border-left/right, etc.
- This ensures proper support for both LTR and RTL layouts.

### Good Examples
```css
.button {
  padding-inline-start: 16px;
  padding-inline-end: 24px;
  margin-inline-start: 8px;
  margin-inline-end: 0;
  border-inline-end: 2px solid var(--bs-red-6);
  inset-inline-end: 12px;
}
.input {
  inset-inline-start: 0;
  inset-inline-end: 0;
}
```

### Bad Examples
```css
.button {
  padding-left: 16px;
  padding-right: 24px;
  margin-left: 8px;
  margin-right: 0;
  border-right: 2px solid var(--bs-red-6);
  right: 12px;
}
.input {
  left: 0;
  right: 0;
}
```

---

**Summary:**
- Use only variables like `var(--bs-blue-5)`, `var(--bs-red-1)`, etc. for all color and background-color properties.
- Use only utility classes like `text-body`, `text-headline-6`, etc. for typography, never font-size/font-weight directly.
- Do not use rem for font sizes, only px (as in design-system.css).
- Always use `getClasses()` to combine utility classes in React.
- This ensures consistency, maintainability, and easy theming across the app. 