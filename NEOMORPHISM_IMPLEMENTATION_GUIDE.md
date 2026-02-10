# Complete Neomorphism Design Implementation Guide

## Design System Colors & Shadows

### Color Palette
```css
/* Primary Background Colors */
--neo-bg: #e8e8eb
--neo-bg-alt: #f0f0f3
--neo-bg-dark: #ececef

/* Text Colors */
--text-primary: #334155 (slate-700)
--text-secondary: #64748b (slate-500)
--text-muted: #94a3b8 (slate-400)

/* Accent Colors */
--emerald-primary: #10b981 (emerald-500)
--emerald-dark: #059669 (emerald-600)
--emerald-darker: #047857 (emerald-700)

/* Shadow Colors */
--shadow-dark: rgba(163, 177, 198, 0.5)
--shadow-light: rgba(255, 255, 255, 0.9)
```

### Shadow Patterns
```css
/* Elevated/Raised Elements */
box-shadow: 
    5px 5px 12px rgba(163, 177, 198, 0.5),
    -5px -5px 12px rgba(255, 255, 255, 0.9);

/* Inset/Pressed Elements */
box-shadow: 
    inset 4px 4px 10px rgba(163, 177, 198, 0.4),
    inset -4px -4px 10px rgba(255, 255, 255, 0.9);

/* Hover State */
box-shadow: 
    3px 3px 8px rgba(163, 177, 198, 0.4),
    -3px -3px 8px rgba(255, 255, 255, 0.9);

/* Active State */
box-shadow: 
    inset 3px 3px 6px rgba(163, 177, 198, 0.3),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
```

## CSS Utility Classes (Already Added to globals.css)

### Backgrounds
- `.neo-surface` - Standard gray gradient background
- `.neo-surface-alt` - Alternative gradient background
- `.neo-surface-gradient` - Vertical gradient

### Elevated Elements (Buttons, Cards, Headers)
- `.neo-elevated` - Standard raised effect
- `.neo-elevated-sm` - Small raised effect
- `.neo-elevated-lg` - Large raised effect
- `.neo-elevated-xl` - Extra large raised effect

### Inset Elements (Inputs, Active States, Pressed Buttons)
- `.neo-inset` - Standard inset effect
- `.neo-inset-sm` - Small inset effect
- `.neo-inset-lg` - Large inset effect

### Button Styles
- `.neo-btn-primary` - Emerald gradient button with neomorphism
- `.neo-elevated:hover` - Hover state for raised elements
- `.neo-elevated:active` - Active/pressed state

### Special States
- `.neo-selected` - Active/selected state with emerald tint
- `.neo-message-user` - User message bubble (emerald gradient)
- `.neo-message-assistant` - Assistant message bubble (gray gradient)

### Containers
- `.neo-container` - Large container with strong shadows

## Page-by-Page Implementation Pattern

### 1. Page Background
```tsx
// Replace
className="min-h-screen bg-background"

// With
className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]"
```

### 2. Navigation/Header
```tsx
// Replace
className="bg-background border-b"

// With
className="bg-gradient-to-r from-[#ececef] to-[#e8e8eb] border-b border-black/5"
```

### 3. Cards/Containers
```tsx
// Replace
className="neo-card" or className="bg-card border"

// With
className="neo-elevated rounded-3xl"  // For regular cards
className="neo-elevated-lg rounded-3xl" // For large cards
className="neo-elevated-xl rounded-3xl" // For hero/featured cards
```

### 4. Buttons
```tsx
// Primary Action Buttons
className="neo-btn-primary rounded-2xl"

// Secondary/Outline Buttons
className="neo-elevated rounded-2xl text-emerald-600 hover:neo-inset-sm"

// Icon Buttons
className="neo-elevated rounded-xl hover:neo-inset-sm"
```

### 5. Input Fields
```tsx
// Text inputs, textareas, selects
className="neo-inset rounded-2xl border-none text-slate-700 placeholder:text-slate-400 focus:neo-inset-lg"
```

### 6. Active/Selected States
```tsx
// For selected items (tabs, list items, etc.)
className={isActive ? "neo-selected" : "neo-elevated"}
```

### 7. Text Colors
```tsx
// Headings
className="text-slate-700"

// Body text
className="text-slate-600"

// Muted/secondary text
className="text-slate-500"

// Accent text
className="text-emerald-600"
```

### 8. Modal/Dialog Backgrounds
```tsx
className="neo-container p-6 max-w-md"
```

## Quick Replacement Guide for ALL Pages

### Landing Page (page.tsx) - ✅ COMPLETED
- Main background: gradient-to-br from-[#e8e8eb]
- Nav: gradient-to-r from-[#ececef]
- All cards: neo-elevated
- Buttons: neo-btn-primary
- Stats: neo-inset

### Login Page (login/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Login card
neo-container p-8

// Feature icons
neo-elevated-sm

// Google button
neo-btn-primary

// Mode toggle buttons
neo-elevated → neo-selected (when active)
```

### Home Page (home/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Featured scheme cards
neo-elevated-lg rounded-3xl

// Eligible scheme cards
neo-elevated rounded-2xl

// Section backgrounds
bg-gradient-to-b from-[#f0f0f3] to-[#e8e8eb]

// Scroll buttons
neo-elevated-sm rounded-full
```

### Schemes Page (schemes/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Search input
neo-inset rounded-2xl

// Filter buttons
neo-elevated rounded-xl → neo-selected (when active)

// Scheme cards
neo-elevated rounded-3xl hover:neo-elevated-lg

// Category badges
neo-inset-sm rounded-full
```

### Profile Page (profile/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Profile header card
neo-elevated-xl rounded-3xl

// Info sections
neo-elevated rounded-2xl

// Edit button
neo-btn-primary

// Input fields (when editing)
neo-inset rounded-xl

// Stats/badges
neo-inset-sm rounded-lg
```

### Notifications Page (notifications/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Notification card (unread)
neo-elevated rounded-2xl

// Notification card (read)
neo-inset-sm rounded-2xl

// Mark as read button
neo-elevated-sm rounded-lg

// Clear all button
neo-elevated rounded-xl text-slate-600
```

### Onboarding Page (onboarding/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Step indicators
neo-inset rounded-full (inactive)
neo-btn-primary rounded-full (active)

// Form cards
neo-elevated-lg rounded-3xl

// Input fields
neo-inset rounded-2xl

// Next/Back buttons
neo-btn-primary (next)
neo-elevated text-slate-600 (back)

// Progress bar container
neo-inset-sm rounded-full

// Progress bar fill
bg-gradient-to-r from-emerald-500 to-emerald-600
```

### Admin Pages (admin/**/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Sidebar
bg-gradient-to-br from-[#ececef] to-[#e8e8eb]

// Sidebar items
neo-elevated rounded-xl → neo-selected (active)

// Data table container
neo-elevated-lg rounded-2xl

// Table headers
bg-gradient-to-r from-[#ececef] to-[#e8e8eb]

// Action buttons
neo-elevated-sm rounded-lg

// Stats cards
neo-inset-sm rounded-xl

// Create/Add buttons
neo-btn-primary
```

### Organization Pages (organization/**/page.tsx)
```tsx
// Same pattern as admin pages
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Dashboard cards
neo-elevated rounded-3xl

// Forms
neo-inset inputs, neo-btn-primary submit

// Tables
neo-elevated-lg container
```

### Scheme Detail Page (scheme/[slug]/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// Hero section
neo-elevated-xl rounded-3xl

// Info sections
neo-elevated rounded-2xl

// Apply button
neo-btn-primary text-lg

// Eligibility badge
neo-inset-sm rounded-full

// Benefits list items
neo-elevated-sm rounded-xl

// Documents section
neo-elevated rounded-2xl
```

### Help Page (help/page.tsx)
```tsx
// Background
bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]

// FAQ cards
neo-elevated rounded-2xl

// Search bar
neo-inset rounded-2xl

// Category buttons
neo-elevated rounded-xl → neo-selected (active)

// Accordion headers
neo-elevated-sm rounded-t-xl (closed)
neo-inset-sm rounded-t-xl (open)
```

## Component Updates

### Shared Components to Update

#### Header.tsx
```tsx
<header className="bg-gradient-to-r from-[#ececef] to-[#e8e8eb] border-b border-black/5">
  // Logo container
  <div className="neo-elevated rounded-2xl">
  
  // Nav links
  <Link className="neo-elevated-sm rounded-xl hover:neo-inset-sm">
  
  // User menu button
  <button className="neo-elevated rounded-full">
</header>
```

#### Footer.tsx
```tsx
<footer className="bg-gradient-to-r from-[#ececef] to-[#e8e8eb] border-t border-black/5">
  // Container
  <div className="neo-elevated-lg rounded-3xl p-8">
  
  // Social icons
  <a className="neo-elevated-sm rounded-xl hover:neo-inset-sm">
</footer>
```

#### Card Components (SchemeCard, EligibleSchemeCard, etc.)
```tsx
<div className="neo-elevated rounded-3xl p-6 hover:neo-elevated-lg transition-all">
  // Icon container
  <div className="neo-inset-sm rounded-2xl p-3">
  
  // Badge
  <span className="neo-inset-sm rounded-full px-3 py-1 text-xs">
  
  // Button
  <button className="neo-btn-primary mt-4">
</div>
```

#### Form Components
```tsx
// Input
<input className="neo-inset rounded-2xl border-none text-slate-700 placeholder:text-slate-400 focus:neo-inset-lg" />

// Select
<select className="neo-inset rounded-2xl border-none text-slate-700">

// Textarea
<textarea className="neo-inset rounded-2xl border-none text-slate-700 placeholder:text-slate-400 resize-none">

// Checkbox container
<div className="neo-elevated-sm rounded-lg p-2">

// Label
<label className="text-slate-700 font-medium">
```

#### Modal/Dialog Components
```tsx
// Overlay
<div className="fixed inset-0 bg-black/30">

// Dialog content
<div className="neo-container max-w-md p-6">
  
  // Header
  <h2 className="text-xl font-bold text-slate-700 mb-4">
  
  // Body text
  <p className="text-slate-600 mb-6">
  
  // Button group
  <div className="flex gap-3">
    <button className="neo-elevated rounded-xl text-slate-600">Cancel</button>
    <button className="neo-btn-primary rounded-xl">Confirm</button>
  </div>
</div>
```

## Search & Replace Patterns

Use these regex patterns in VS Code for quick updates:

### 1. Replace bg-background/bg-card
```regex
Find: className="([^"]*)(bg-background|bg-card)([^"]*)"
Replace: className="$1bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]$3"
```

### 2. Replace neo-card with neo-elevated
```regex
Find: neo-card
Replace: neo-elevated rounded-3xl
```

### 3. Replace neo-pressed with neo-inset
```regex
Find: neo-pressed
Replace: neo-inset rounded-xl
```

### 4. Replace text-primary with text-emerald-600
```regex
Find: text-primary(?!")
Replace: text-emerald-600
```

### 5. Replace text-muted-foreground
```regex
Find: text-muted-foreground
Replace: text-slate-600
```

## Implementation Priority

1. ✅ Chat pages (completed)
2. ✅ Landing page (completed)
3. 🔄 Login page (next)
4. 🔄 Home page
5. 🔄 Schemes pages
6. 🔄 Profile pages
7. 🔄 Admin pages
8. 🔄 Organization pages
9. 🔄 Shared components
10. 🔄 Form components

## Testing Checklist

After implementing, test:
- [ ] All backgrounds are soft gray gradients
- [ ] All cards have raised 3D effect
- [ ] All inputs have pressed/inset effect
- [ ] Primary buttons are emerald green with 3D effect
- [ ] Hover states reduce shadow = slight pressing effect
- [ ] Active states have inset shadow
- [ ] Text is readable (slate-700 for headings, slate-600 for body)
- [ ] No harsh borders (only soft border-black/5 if needed)
- [ ] Transitions are smooth (0.3s ease)
- [ ] Dark mode still works (if applicable)

## Notes
- Always combine rounded corners: rounded-2xl or rounded-3xl
- Transition duration: 0.3s or transition-all
- Never use flat colors - always use gradients
- Match text colors to design system
- Test hover and active states on all interactive elements
- Ensure sufficient contrast for accessibility
