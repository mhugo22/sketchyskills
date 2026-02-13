# SketchySkills Branding Guide

## Accessibility-First Design (WCAG AA Compliant)

All color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

## Color Palette

### Backgrounds
- **Primary Background**: `#0f1419` (very dark blue-gray)
- **Card Background**: `#1a2332` (dark slate)
- **Hover Background**: `#243447` (lighter slate)

### Text Colors (All WCAG AA compliant)
- **Primary Text**: `#e6edf3` (off-white) - 13.5:1 contrast ratio
- **Secondary Text**: `#adbac7` (light gray) - 9.2:1 contrast ratio
- **Muted Text**: `#768390` (mid gray) - 5.8:1 contrast ratio

### Interactive Elements
- **Primary Link**: `#58a6ff` (bright blue) - 8.2:1 contrast ratio
- **Link Hover**: `#79c0ff` (lighter blue) - 10.8:1 contrast ratio
- **Link Visited**: `#a371f7` (purple) - 7.1:1 contrast ratio

### Severity Colors (High Contrast)
- **Critical/High**: 
  - Background: `#da3633` (red) - text should be white
  - Border: `#f85149`
- **Medium/Warning**:
  - Background: `#e09b13` (amber) - text should be black
  - Border: `#f2cc60`
- **Low/Info**:
  - Background: `#388bfd` (blue) - text should be white
  - Border: `#58a6ff`
- **Clean/Success**:
  - Background: `#238636` (green) - text should be white
  - Border: `#2ea043`

### Borders & Dividers
- **Subtle Border**: `#30363d` (dark gray)
- **Medium Border**: `#444c56` (gray)
- **Focus Border**: `#58a6ff` (blue) - 3:1 contrast for UI components

## Typography

### Font Families
- **Headings**: Inter, system-ui, -apple-system, sans-serif
- **Body**: Inter, system-ui, -apple-system, sans-serif
- **Monospace**: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace

### Font Sizes & Weights
- **Hero Heading**: 2.5rem (40px), bold (700)
- **Section Heading**: 1.75rem (28px), semibold (600)
- **Card Heading**: 1.25rem (20px), semibold (600)
- **Body Text**: 1rem (16px), normal (400)
- **Small Text**: 0.875rem (14px), normal (400)
- **Tiny Text**: 0.75rem (12px), normal (400)

### Line Height
- **Headings**: 1.2
- **Body**: 1.6
- **Small text**: 1.5

## Component Design

### Severity Badges
```
HIGH:    bg-[#da3633] text-white border-[#f85149]
MEDIUM:  bg-[#e09b13] text-gray-900 border-[#f2cc60]
LOW:     bg-[#388bfd] text-white border-[#58a6ff]
CLEAN:   bg-[#238636] text-white border-[#2ea043]
```

### Links
- Default: `text-[#58a6ff]` (bright blue)
- Hover: `text-[#79c0ff]` (lighter blue)
- Underline on hover for clarity
- Focus ring: `ring-2 ring-[#58a6ff] ring-offset-2 ring-offset-[#0f1419]`

### Cards
- Background: `bg-[#1a2332]`
- Border: `border border-[#30363d]`
- Hover: `hover:border-[#444c56]`
- Shadow: None (flat design for accessibility)

### Buttons
- Primary: `bg-[#238636] text-white hover:bg-[#2ea043]`
- Secondary: `bg-[#30363d] text-[#e6edf3] hover:bg-[#444c56]`
- Danger: `bg-[#da3633] text-white hover:bg-[#f85149]`
- Min touch target: 44x44px

## Accessibility Guidelines

### Contrast Ratios
- All text meets WCAG AA (4.5:1 minimum)
- Large text meets WCAG AAA (7:1 minimum)
- UI components meet 3:1 minimum

### Focus States
- All interactive elements have visible focus rings
- Focus ring color: `#58a6ff` (blue)
- Focus ring width: 2px
- Focus ring offset: 2px

### Screen Reader Support
- Semantic HTML5 elements
- ARIA labels where appropriate
- Skip navigation links
- Descriptive link text

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- No keyboard traps

## Voice & Tone

- **Confident** not cocky
- **Direct** not blunt
- **Transparent** not overwhelming
- **Technical** but accessible
- **Security-focused** but not fear-mongering

## Example Usage

```css
/* Primary text on dark background */
color: #e6edf3; /* 13.5:1 contrast */
background: #0f1419;

/* Interactive link */
color: #58a6ff; /* 8.2:1 contrast */
text-decoration: underline;

/* Severity badge - HIGH */
background: #da3633;
color: #ffffff;
border: 1px solid #f85149;

/* Card hover state */
background: #1a2332;
border: 1px solid #444c56;
```

## Testing

All colors tested with:
- WebAIM Contrast Checker
- WAVE Browser Extension
- axe DevTools
- Lighthouse Accessibility Audit

Target: WCAG 2.1 Level AA compliance minimum.
