# Swipe Job Cards Redesign - Specification

## 1. Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-start` | `#8B5CF6` (Violet 500) | Primary gradient start |
| `--gradient-mid` | `#6366F1` (Indigo 500) | Gradient middle |
| `--gradient-end` | `#3B82F6` (Blue 500) | Gradient end |
| `--bg-dark` | `#0A0A0F` | Main background |
| `--bg-card` | `rgba(255, 255, 255, 0.03)` | Card surface (glass) |
| `--bg-card-solid` | `#1A1A24` | Card solid fallback |
| `--text-primary` | `#FFFFFF` | Main text |
| `--text-secondary` | `#A1A1AA` (Zinc 400) | Secondary text |
| `--text-muted` | `#71717A` (Zinc 500) | Muted text |
| `--accent-green` | `#10B981` (Emerald 500) | Apply/Success |
| `--accent-red` | `#EF4444` (Red 500) | Reject |
| `--accent-yellow` | `#F59E0B` (Amber 500) | Save |
| `--accent-purple` | `#8B5CF6` | AI/Score accent |
| `--glow-color` | `rgba(139, 92, 246, 0.4)` | Card glow |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Job Title | Inter | 28px | 700 (Bold) |
| Company Name | Inter | 16px | 500 (Medium) |
| Location | Inter | 14px | 400 |
| Salary | Inter | 20px | 600 (Semibold) |
| Description | Inter | 15px | 400 |
| Tech Pills | Inter | 12px | 500 |
| Caption | Inter | 12px | 400 |
| Nav Labels | Inter | 11px | 500 |

**Font Family**: `Inter` (Google Fonts) - Same as Linear, Stripe

### Spacing System

| Token | Value |
|-------|-------|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--spacing-2xl` | 48px |

### Card Dimensions

- Width: `360px` (mobile), `400px` (tablet+)
- Height: `520px`
- Border radius: `28px`
- Padding: `24px`

### Shadows & Elevation

```css
/* Card shadow - layered for depth */
--shadow-card: 
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 0 0 1px rgba(255, 255, 255, 0.05),
  0 0 40px -10px var(--glow-color);

/* Glow effect behind card */
--shadow-glow: 0 0 80px -20px var(--glow-color);
```

### Glassmorphism

| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.05)` |
| Backdrop blur | `20px` |
| Border | `1px solid rgba(255, 255, 255, 0.1)` |

---

## 2. Component Specifications

### 2.1 Header Component

**Layout**: Fixed top, height: `64px`

```
┌─────────────────────────────────────────────┐
│  LOGO    │  🔥 Streak 5  │  💡 AI Insights  │
│  (left)  │  (center)    │  (right)         │
└─────────────────────────────────────────────┘
```

**Sections**:
- **Logo**: "JobSwipe" text, gradient (`background: linear-gradient(...)`)
- **Streak**: Fire emoji + number + "day streak" label
- **AI Insights**: Lightbulb icon + "92% match" or "Hot job" badge

**Background**: Transparent with subtle gradient fade at bottom

**Typography**:
- Logo: 18px, bold, gradient text
- Stats: 14px, medium, white
- Labels: 12px, regular, muted

### 2.2 Background & Glow Effect

**Base**:
- Solid color: `#0A0A0F` (near black)
- Subtle radial gradient from center-bottom: `rgba(139, 92, 246, 0.15)` to transparent

**Card Glow**:
- Position: Behind card, centered
- Size: 300px width, 200px height
- Blur: 80px
- Color: `rgba(139, 92, 246, 0.4)`
- Animation: Subtle pulse (opacity 0.3 to 0.5, 4s ease-in-out infinite)

### 2.3 Job Card Component

**Structure**:
```
┌─────────────────────────────────────────────┐
│  ┌──────┐  Company Name          🏷️ AI 92%  │
│  │ LOGO │  Location               └─────────┤
│  └──────┘                                    │
│─────────────────────────────────────────────│
│  Senior React Developer                     │
│                                              │
│  💰 $120k - $180k                            │
│  🏠 Remote • Full-time                      │
│─────────────────────────────────────────────│
│  [React] [TypeScript] [Next.js] [GraphQL]   │
│─────────────────────────────────────────────│
│  Join our platform team to build...         │
│  (truncated to 2 lines)                     │
│─────────────────────────────────────────────│
│  Why matches you:                            │
│  ✓ Your React + TypeScript stack            │
│  ✓ Remote-friendly                           │
│  ✓ $120k+ salary range                      │
│                                              │
│  [X]   [💾]   [🚀 Apply]                    │
└─────────────────────────────────────────────┘
```

**Detailed Specs**:

#### Header Section
- Company logo: 48x48px, rounded (12px), placeholder gradient if no logo
- Company name: 16px, medium, secondary text
- AI Match badge: Pill shape, gradient background, 92% text

#### Job Title
- Size: 28px
- Weight: 700
- Color: White
- Line height: 1.2
- Max 2 lines with ellipsis

#### Location
- Icon: MapPin (Lucide), 14px, muted color
- Text: 14px, regular, secondary
- Format: "San Francisco, CA" or "Remote"

#### Salary Section
- Icon: DollarSign (Lucide), 18px, accent-green
- Text: 20px, semibold, white
- Format: "$120k - $180k" (abbreviated)
- Background: `rgba(16, 185, 129, 0.1)` with `1px solid rgba(16, 185, 129, 0.2)`

#### Job Meta
- Remote badge: House icon + "Remote"
- Type badge: Briefcase icon + "Full-time"
- Both: Pill shape, small (12px), muted background

#### Tech Stack Pills
- Container: Horizontal scroll if overflow
- Pill style:
  - Background: `rgba(139, 92, 246, 0.15)` (purple tint)
  - Border: `1px solid rgba(139, 92, 246, 0.3)`
  - Text: 12px, medium, purple accent
  - Padding: 6px 12px
  - Border radius: 20px
  - Gap: 8px
- Category colors:
  - Frontend (React, Vue, etc.): Purple tint
  - Backend (Node, Python, etc.): Blue tint
  - Database: Green tint
  - Cloud/DevOps: Orange tint

#### Description
- Size: 15px
- Weight: 400
- Color: Secondary text
- Max 2 lines with ellipsis
- Line height: 1.5

#### "Why Matches You" Section
- Title: 12px, semibold, muted color, uppercase, letter-spacing 0.5px
- Items: 
  - Check icon (Lucide), 12px, accent-green
  - Text: 13px, regular, secondary
  - Max 3 items visible

#### Action Buttons (Bottom)
- Container: Flex, gap 16px, centered
- **Reject (X)**:
  - Size: 56px circle
  - Background: `rgba(239, 68, 68, 0.1)`
  - Border: `1px solid rgba(239, 68, 68, 0.2)`
  - Icon: X, 24px, red
  - Hover: scale 1.1, background opacity increase
- **Save**:
  - Size: 56px circle
  - Background: `rgba(245, 158, 11, 0.1)`
  - Border: `1px solid rgba(245, 158, 11, 0.2)`
  - Icon: Bookmark, 24px, amber
  - Hover: scale 1.1
- **Apply Instantly**:
  - Size: 56px circle
  - Background: Linear gradient (purple to blue)
  - Icon: Rocket, 24px, white
  - Hover: scale 1.1, glow increase

### 2.4 Swipe Indicators

**Visual feedback during drag**:
- Left drag (>50px): Red tint overlay, "NOPE" text appears left side
- Right drag (>50px): Green tint overlay, "LIKE" text appears right side
- Opacity: 0 at center, 0.3 at threshold
- Text: 24px, bold, respective color

**Card tilt on hover**:
- Max rotation: 3deg
- Follow mouse X position slightly
- Smooth transition: 0.2s

### 2.5 Bottom Navigation

**Layout**: Fixed bottom, floating, height: 72px + safe area

```
┌─────────────────────────────────────────────┐
│                                             │
│              (content area)                 │
│                                             │
├─────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │ 🏠   │  │ 🔍   │  │ 💾   │  │ 👤   │   │
│  │Feed  │  │Search│  │Saved │  │Profile│  │
│  └──────┘  └──────┘  └──────┘  └──────┘   │
└─────────────────────────────────────────────┘
```

**Glassmorphism styling**:
- Background: `rgba(26, 26, 36, 0.8)`
- Backdrop blur: 20px
- Border top: `1px solid rgba(255, 255, 255, 0.08)`
- Border radius: 24px (top corners only)
- Margin: 16px horizontal, 8px bottom + safe area
- Shadow: `0 -4px 20px rgba(0, 0, 0, 0.3)`

**Tab item**:
- Icon: 24px
- Label: 11px, medium
- Active: Primary gradient text, icon has glow
- Inactive: Muted text, no glow
- Animation: 0.2s ease for color transition

**Tabs**:
1. Feed (Home icon) - active by default on swipe screen
2. Search (Search icon)
3. Saved (Bookmark icon)
4. Profile (User icon)

---

## 3. Animation Specifications

### 3.1 Swipe Physics

**Spring Configuration**:
```typescript
{
  stiffness: 400,  // Higher = more snap
  damping: 30,    // Lower = more bounce
  mass: 0.8        // Slightly lighter feel
}
```

**Rotation Mapping**:
- Range: -200px to 200px drag
- Output: -15deg to 15deg rotation
- Formula: `x.get() * (15 / 200)`

**Opacity Curve**:
- Center (0): 1.0
- Edges (±300px): 0.6
- Formula: `1 - (Math.abs(x.get()) / 500)`

**Exit Animation**:
- Trigger: x position > 150px (right) or < -150px (left)
- Duration: 300ms
- Movement: 500px in swipe direction
- Rotation: ±30deg
- Scale: 0.9
- Easing: ease-out

### 3.2 Microinteractions

**Button Hover**:
- Scale: 1.05 → 1.1
- Duration: 150ms
- Easing: ease-out

**Card Hover (desktop)**:
- Scale: 1.02
- Rotation: ±3deg based on mouse X
- Duration: 200ms
- Shadow: Increase glow intensity

**Tab Switch**:
- Duration: 200ms
- Underline slide animation
- Icon color transition

**Score Counter**:
- Count up animation from 0 to 92%
- Duration: 800ms
- Easing: ease-out
- Uses Framer Motion `animate`

**Glow Pulse**:
- Opacity: 0.3 → 0.5 → 0.3
- Duration: 4s
- Easing: ease-in-out
- Infinite loop

### 3.3 Card Stack Visualization

**Behind cards**:
- Show 2 cards behind current
- Scale: 0.95 (2nd), 0.90 (3rd)
- Y offset: 8px (2nd), 16px (3rd)
- Opacity: 0.7 (2nd), 0.4 (3rd)
- No interaction (non-draggable)

---

## 4. State Management

### Swipe States
```typescript
type SwipeState = 
  | 'idle'       // Card waiting for interaction
  | 'dragging'   // User actively dragging
  | 'exiting'    // Card animating out
  | 'entering';  // New card animating in
```

### Card Stack
```typescript
interface CardStack {
  current: Job;
  next: Job;
  nextNext: Job; // For preview
}
```

### Navigation State
```typescript
type TabId = 'feed' | 'search' | 'saved' | 'profile';
```

---

## 5. Data Types (Extensions)

Add to existing Job type:
```typescript
interface Job {
  // ... existing fields
  matchScore?: number;        // 0-100 AI match percentage
  matchReasons?: string[];    // Array of match explanations
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'principal';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  benefits?: string[];
}
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Card Size | Adjustments |
|------------|-------|-----------|-------------|
| Mobile | < 640px | 340px x 480px | Full width - 20px margin |
| Tablet | 640-1024px | 380px x 520px | Centered |
| Desktop | > 1024px | 400px x 560px | Centered, larger glow |

---

## 7. Fallbacks

### Glassmorphism (Safari < 14)
- Remove backdrop-filter
- Use solid background: `rgba(26, 26, 36, 0.95)`

### Reduced Motion
- Disable all animations
- Instant transitions
- Respect `prefers-reduced-motion`

### Dark Mode Only
- This design is dark-theme optimized
- Light mode not in scope for this change