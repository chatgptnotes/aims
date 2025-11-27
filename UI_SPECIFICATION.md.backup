# UI Specification Document
## Health & Wellness Tech Platform - Neuro360

**Version:** 1.0
**Last Updated:** November 2025
**Target Audience:** Health-conscious individuals seeking wellness solutions
**Platform:** Web (Desktop, Tablet, Mobile)

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Colour Palette](#colour-palette)
3. [Typography](#typography)
4. [Layout & Grid System](#layout--grid-system)
5. [Component Library](#component-library)
6. [Page Sections](#page-sections)
7. [Interactions & Animations](#interactions--animations)
8. [Imagery & Illustration Style](#imagery--illustration-style)
9. [Accessibility Guidelines](#accessibility-guidelines)
10. [Localization Considerations](#localization-considerations)

---

## Design Philosophy

**Core Principles:**
- **Clean & Minimal:** Abundant white space, clear hierarchy, uncluttered layouts
- **Trust & Credibility:** Medical-grade professionalism with approachable warmth
- **Clarity First:** Easy-to-understand information architecture
- **Action-Oriented:** Clear CTAs guiding users through their journey
- **Responsive & Accessible:** Mobile-first approach, WCAG 2.1 AA compliant

**Visual Mood:**
Calm, scientific, trustworthy, modern, empowering

---

## Colour Palette

### Primary Colours
```
Primary Blue (Main Brand):    #0066CC (Tech Blue)
Primary Dark:                 #004A99 (Darker Blue for depth)
Primary Light:                #3385D6 (Lighter shade for hover states)
```

### Secondary Colours
```
Teal Accent:                  #00BFA5 (Wellness/Growth indicator)
Teal Light:                   #33CCBB (Lighter teal for backgrounds)
Success Green:                #22C55E (Positive states, achievements)
```

### Neutral Palette
```
Neutral 900 (Text Primary):   #1A1A1A
Neutral 700 (Text Secondary): #4A4A4A
Neutral 500 (Text Tertiary):  #737373
Neutral 300 (Borders):        #D1D5DB
Neutral 100 (Backgrounds):    #F3F4F6
Neutral 50 (Light BG):        #F9FAFB
White:                        #FFFFFF
```

### Accent Colours
```
Warning Orange:               #F59E0B (Attention indicators)
Error Red:                    #EF4444 (Error states)
Info Blue:                    #3B82F6 (Information highlights)
```

### Gradient Options
```
Hero Overlay:                 linear-gradient(135deg, rgba(0, 102, 204, 0.85) 0%, rgba(0, 191, 165, 0.75) 100%)
Card Hover:                   linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)
```

---

## Typography

### Font Families
```css
Primary Font (Headings & UI): 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Secondary Font (Body):        'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Accent Font (Optional):       'Poppins', sans-serif (for special headings)
```

### Type Scale

**Desktop:**
```
H1 (Hero):           56px / 3.5rem, Font-weight: 700, Line-height: 1.1, Letter-spacing: -0.02em
H2 (Section):        40px / 2.5rem, Font-weight: 700, Line-height: 1.2, Letter-spacing: -0.01em
H3 (Subsection):     32px / 2rem,   Font-weight: 600, Line-height: 1.3
H4 (Card Title):     24px / 1.5rem, Font-weight: 600, Line-height: 1.4
H5 (Small Heading):  20px / 1.25rem, Font-weight: 600, Line-height: 1.4
H6 (Label):          16px / 1rem,   Font-weight: 600, Line-height: 1.5

Body Large:          18px / 1.125rem, Font-weight: 400, Line-height: 1.6
Body Regular:        16px / 1rem,     Font-weight: 400, Line-height: 1.6
Body Small:          14px / 0.875rem, Font-weight: 400, Line-height: 1.5
Caption:             12px / 0.75rem,  Font-weight: 400, Line-height: 1.4
```

**Mobile:**
```
H1 (Hero):           40px / 2.5rem,  Font-weight: 700, Line-height: 1.1
H2 (Section):        32px / 2rem,    Font-weight: 700, Line-height: 1.2
H3 (Subsection):     24px / 1.5rem,  Font-weight: 600, Line-height: 1.3
H4 (Card Title):     20px / 1.25rem, Font-weight: 600, Line-height: 1.4
(Other sizes remain consistent)
```

---

## Layout & Grid System

### Container Widths
```
Max Container Width:   1280px (for main content)
Wide Container:        1440px (for full-width sections with contained content)
Narrow Container:      960px (for reading-focused content like testimonials)
```

### Breakpoints
```css
Mobile:        320px - 767px   (Mobile-first base)
Tablet:        768px - 1023px  (iPad, tablets)
Desktop:       1024px - 1439px (Standard desktop)
Wide Desktop:  1440px+         (Large screens)
```

### Grid System
- **12-column grid** for flexible layouts
- **Gutter:** 24px (desktop), 16px (tablet), 12px (mobile)
- **Column gap:** 24px (desktop), 16px (mobile)

### Spacing Scale (Based on 8px baseline)
```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
3xl:  64px
4xl:  96px
5xl:  128px
```

### Section Padding
```
Desktop:  py-5xl (128px vertical)
Tablet:   py-4xl (96px vertical)
Mobile:   py-3xl (64px vertical)
```

---

## Component Library

### 1. Navigation Bar

**Desktop Layout:**
- Fixed/Sticky position on scroll
- Height: 80px
- Background: White with subtle shadow on scroll
- Logo: Left-aligned, max height 40px
- Navigation Links: Center or right-aligned, 16px font, 600 weight
- CTA Button: Primary button style (see below)

**Mobile Layout:**
- Hamburger menu (right-aligned)
- Slide-in drawer navigation
- Full-screen overlay with large touch targets (min 44px)

**States:**
```
Default:     Text #1A1A1A, Background transparent
Hover:       Text #0066CC, underline animation
Active:      Text #0066CC, bold weight
Scroll:      Background #FFFFFF, shadow-md
```

---

### 2. CTA Button

**Primary Button (Main Actions):**
```css
Background:     #0066CC
Text:           #FFFFFF, 16px, 600 weight
Padding:        16px 32px
Border-radius:  8px
Box-shadow:     0 2px 8px rgba(0, 102, 204, 0.2)

Hover:          Background #004A99, transform: translateY(-2px), shadow-lg
Active:         Background #004A99, transform: translateY(0)
Disabled:       Background #D1D5DB, Text #737373, no shadow
```

**Secondary Button (Alternative Actions):**
```css
Background:     Transparent
Border:         2px solid #0066CC
Text:           #0066CC, 16px, 600 weight
Padding:        14px 30px (to account for border)
Border-radius:  8px

Hover:          Background #0066CC, Text #FFFFFF
Active:         Background #004A99, Border #004A99, Text #FFFFFF
```

**Button Sizes:**
- **Large:** 18px text, 18px 40px padding (Hero CTAs)
- **Medium:** 16px text, 16px 32px padding (Default)
- **Small:** 14px text, 12px 24px padding (Cards, inline actions)

---

### 3. Card Component

**Default Card:**
```css
Background:     #FFFFFF
Border:         1px solid #E5E7EB
Border-radius:  12px
Padding:        32px
Box-shadow:     0 1px 3px rgba(0, 0, 0, 0.05)

Hover:          Border #0066CC, shadow-lg, transform: translateY(-4px)
Transition:     all 0.3s ease-in-out
```

**Card Anatomy:**
- Icon/Image area: 64x64px (top, centered or left)
- Title: H4 typography, 24px
- Description: Body Regular, 16px, max 2-3 lines
- CTA (optional): Small button or text link

**Card Grid Layouts:**
- 4 columns on desktop (3 for wider cards)
- 2 columns on tablet
- 1 column on mobile
- Gap: 24px

---

### 4. Testimonial Component

**Layout:**
```
Avatar:         56px circular image (left or top)
Name:           16px, 600 weight, #1A1A1A
Location:       14px, 400 weight, #737373
Rating:         5 gold stars (★★★★★), #F59E0B
Quote:          18px, 400 weight, #4A4A4A, italic
Quote marks:    Decorative oversized quote icon in background
```

**Container:**
```css
Background:     #F9FAFB
Border-left:    4px solid #00BFA5
Padding:        32px
Border-radius:  8px
Max-width:      600px
```

**Carousel Controls (if used):**
- Dots: Bottom-centered, 8px circles, #D1D5DB inactive, #0066CC active
- Arrows: Optional side arrows, subtle hover effect

---

### 5. Icon System

**Style:** Line icons (2px stroke) or simplified filled icons
**Size Scale:**
- Small: 20px
- Medium: 32px
- Large: 48px
- Extra Large: 64px (for feature cards)

**Colour Usage:**
- Default: #4A4A4A
- Active/Hover: #0066CC
- Background circle (optional): #F3F4F6 with icon centered

**Suggested Icon Library:** Heroicons, Feather Icons, or custom SVG icons

---

### 6. Expert Profile Card

**Layout:**
```
Image:          240px x 240px (square or circular), grayscale with colour on hover
Name:           H4 (24px), 600 weight, centered or left-aligned
Title:          16px, 400 weight, #0066CC (role/specialty)
Bio:            14px, 400 weight, #4A4A4A, max 3 lines
```

**Grid:**
- 3 columns on desktop
- 2 columns on tablet
- 1 column on mobile

**Interaction:**
- Hover: Image transitions to colour, slight scale (1.05x)
- Optional: Modal or expand for full bio

---

### 7. Input Fields (Newsletter, Forms)

**Text Input:**
```css
Height:         48px
Border:         1px solid #D1D5DB
Border-radius:  8px
Padding:        12px 16px
Font:           16px, 400 weight
Placeholder:    #9CA3AF

Focus:          Border #0066CC, shadow: 0 0 0 3px rgba(0, 102, 204, 0.1)
Error:          Border #EF4444, helper text in red
Success:        Border #22C55E
```

**Labels:**
- 14px, 600 weight, #1A1A1A, margin-bottom: 8px

---

## Page Sections

### Section 1: Hero Banner

**Layout:**
- Full-width background image or video
- Overlay: Gradient (from design palette) at 75-85% opacity
- Content: Centered or left-aligned container (max 800px width)

**Content Structure:**
```
1. Eyebrow/Pre-heading (optional):  14px, uppercase, letter-spacing 0.1em, #00BFA5
2. Main Headline (H1):              "Transform Your Mind, Optimize Your Life"
3. Sub-headline:                    Body Large (18px), max 2 lines
4. Social Proof Line:               Small text (14px) with icon, e.g., "Trusted by 25,000+ members"
5. CTA Buttons:                     Primary + Secondary (side-by-side or stacked on mobile)
```

**Height:**
- Desktop: 600-700px (or 80vh)
- Mobile: 500-600px (or 70vh)

**Background Image:**
- High-quality photo showing: calm person using device, brain/wellness imagery, or abstract tech pattern
- Ensure focal point doesn't interfere with text (use image positioning)

---

### Section 2: Four-Step Process

**Section Heading:**
- H2: "How It Works" or "Your Journey to Wellness"
- Centered, margin-bottom: 64px

**Step Layout:**
- Horizontal timeline (desktop) or vertical stack (mobile)
- Each step includes:
  - Step Number: Large circular badge (64px) with gradient background
  - Icon: 48px, centered in badge or above
  - Title: H4 (24px), e.g., "1. Understand Your Needs"
  - Description: Body Regular (16px), 2-3 lines

**Desktop Layout:**
- 4 equal columns with connecting line/arrow between steps
- Line colour: #E5E7EB, 2px dashed or solid

**Mobile Layout:**
- Vertical stack with left-aligned numbers and descriptions
- Connecting line on left side

**Step Content Examples:**
```
Step 1: Understand Your Needs
"Complete our quick assessment to identify your wellness goals"

Step 2: Connect with a Coach
"Get matched with a certified expert who understands your journey"

Step 3: Train with Our Platform
"Use our guided program and track your progress in real-time"

Step 4: Live Your Best Life
"Experience lasting improvements in focus, calm, and performance"
```

---

### Section 3: Goals / Use-Cases

**Section Heading:**
- H2: "What We Help With" or "Your Wellness Goals"
- Subheading: Body Large (18px), optional

**Card Grid:**
- 4-6 cards in responsive grid
- Each card includes:
  - Icon: 64px, themed to use-case (e.g., brain, heart, sleep)
  - Title: H4 (24px), e.g., "Attention & Focus"
  - Short Description: Body Small (14px), 1-2 lines
  - CTA: Small button "Get Started" or "Learn More"

**Use-Case Examples:**
```
1. Attention & Focus Difficulties
2. Anxiety & Stress Management
3. Sleep Quality Improvement
4. Peak Performance Optimization
5. Emotional Regulation
6. Cognitive Health & Aging
```

**Card Styling:**
- Use standard card component
- Consider accent colour top-border (4px) unique to each use-case
- Hover: Icon animates (e.g., bounce, scale)

---

### Section 4: Testimonials / Social Proof

**Section Heading:**
- H2: "What Our Members Say" or "Real Stories, Real Results"
- Centered

**Layout Options:**

**Option A: Carousel**
- 1 testimonial visible at a time (large, centered)
- Dots or arrows for navigation
- Auto-play with pause on hover

**Option B: Grid**
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Show 6-9 testimonials in grid
- Use testimonial component design

**Enhanced Elements:**
- Star rating: 5/5 stars in gold (#F59E0B)
- Optional: Video thumbnail with play button
- Optional: Company/clinic logos for B2B credibility
- Optional: "Verified" badge for authenticity

**Testimonial Content Structure:**
```
Rating:    ★★★★★
Quote:     "This platform changed my life. I can finally focus at work and feel calm at home."
Name:      Sarah Johnson
Location:  Mumbai, India
Image:     Professional headshot (optional)
Video:     Thumbnail with play icon (optional)
```

---

### Section 5: What's in the Package

**Section Heading:**
- H2: "Everything You Need to Succeed" or "What's Included"

**Layout:**
- Two-column layout (desktop): Image on left, feature list on right (or vice versa)
- Mobile: Stacked

**Feature List:**
- Each item includes:
  - Icon: 32px checkmark or custom icon in teal (#00BFA5)
  - Title: H5 (20px), bold
  - Description: Body Regular (16px), 1-2 lines

**Package Features Examples:**
```
✓ Professional Assessment
  Comprehensive brain mapping and wellness evaluation

✓ Certified Expert Coaching
  1-on-1 sessions with licensed practitioners

✓ Advanced Technology Platform
  Neurofeedback device or wellness tracking tools

✓ Progress Dashboard
  Real-time tracking and personalized insights

✓ Community Support
  Access to member community and resources

✓ Ongoing Updates
  Regular content, exercises, and program enhancements
```

**Visual Element:**
- Product shot: Device, app interface mockup, or service visualization
- Use high-quality photography or 3D rendering
- Consider: Floating cards showing dashboard UI elements

---

### Section 6: Provider / Expert Section

**Section Heading:**
- H2: "Meet Our Expert Team" or "Our Certified Practitioners"
- Optional subheading explaining credentials

**Grid Layout:**
- 3-4 columns on desktop
- 2 columns on tablet
- 1 column on mobile
- Use Expert Profile Card component

**Profile Content:**
```
Image:        Professional headshot, 240x240px
Name:         Dr. Priya Sharma
Title:        Clinical Psychologist & Neurofeedback Specialist
Credentials:  Ph.D., 10+ years experience
Bio:          "Specialized in cognitive performance and anxiety management..."
```

**Optional Enhancements:**
- Credential badges (certifications, affiliations)
- "Book a session" button on hover
- Social links (LinkedIn, professional site)

**Credibility Elements:**
- Display total team size: "Join our network of 100+ certified experts"
- Show diversity in specializations
- Include international credentials if applicable

---

### Section 7: Footer

**Layout Structure:**

**Top Section (4 columns on desktop, stack on mobile):**
```
Column 1: Brand & Description
- Logo
- Short tagline (1-2 sentences)
- Social media icons (32px, hover effect)

Column 2: Quick Links
- Home
- How It Works
- For Individuals
- For Clinics
- Pricing

Column 3: Resources
- Blog
- Research & Studies
- FAQs
- Help Center
- Contact Us

Column 4: Newsletter Signup
- Heading: "Stay Updated"
- Email input + Submit button
- Privacy note (small text)
```

**Bottom Section:**
```
Left:  Copyright © 2025 Neuro360. All rights reserved.
Right: Legal Links (Privacy Policy | Terms of Service | Cookie Settings)
```

**Styling:**
```css
Background:     #1A1A1A (dark) or #F3F4F6 (light alternative)
Text:           #FFFFFF (if dark) or #4A4A4A (if light)
Padding:        64px top/bottom (desktop), 48px (mobile)
Link Hover:     #00BFA5 or #0066CC
```

---

## Interactions & Animations

### Hover Effects

**Buttons:**
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
hover: transform: translateY(-2px), box-shadow: 0 10px 20px rgba(0, 102, 204, 0.25)
```

**Cards:**
```css
transition: all 0.3s ease-in-out;
hover: transform: translateY(-4px), border-color: #0066CC, box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1)
```

**Links:**
```css
transition: color 0.2s ease;
hover: color: #0066CC, text-decoration: underline
```

### Scroll Animations

**Fade-In on Scroll:**
- Elements fade in with slight upward movement (20px) as they enter viewport
- Use Intersection Observer API
- Stagger animation for multiple elements (50ms delay between items)

**Parallax Effect:**
- Hero background image moves at 0.5x scroll speed (subtle)
- Optional: Floating elements in hero with slight parallax

### Micro-Interactions

**Step Numbers:**
- Pulse animation on hover
- Connecting line draws in on page load (CSS animation)

**Icons:**
- Bounce or scale (1.1x) on card hover
- Rotate or wiggle for attention-grabbing elements

**Form Inputs:**
- Label slides up on focus
- Checkmark animation on successful validation

### Page Load Animations

**Hero Section:**
```
1. Background image fades in (0.6s)
2. Headline slides up and fades in (0.4s, delay 0.2s)
3. Sub-headline fades in (0.4s, delay 0.4s)
4. Buttons scale in (0.3s, delay 0.6s)
```

**Navigation:**
- Slides down from top on page load (0.4s)
- Logo fades in first, then menu items from left to right

### Loading States

**Buttons:**
- Spinner icon replaces text
- Disabled state while processing

**Forms:**
- Input shimmer effect during validation
- Success/error message slide-in

**Images:**
- Low-quality placeholder (LQIP) or skeleton screen while loading
- Fade-in once loaded

---

## Imagery & Illustration Style

### Photography Guidelines

**Style:**
- Natural, bright, warm-toned
- Real people (not overly posed stock photos)
- Diversity in age, gender, ethnicity
- Focus on emotions: calm, confident, focused, happy

**Subjects:**
- People using devices in comfortable settings (home, clinic)
- Close-ups of hands, brain activity visualizations
- Calm environments (nature, minimal interiors)
- Healthcare professionals in approachable settings

**Treatment:**
- Optional: Subtle colour grading (slightly desaturated or teal/blue tint)
- High contrast for readability of overlaid text
- Avoid cluttered backgrounds

### Illustration Style (Optional)

**Type:**
- Flat illustration or line-art style
- Abstract representations: brain networks, neural pathways, wellness journey
- Icons with consistent stroke weight (2px)

**Colour Usage:**
- Primary brand colours with neutral accents
- Use gradient overlays sparingly for modern feel

**Use Cases:**
- Process steps icons
- Goal/use-case cards
- Empty states, error pages
- Loading animations

### Image Specifications

**Formats:**
- WebP (primary) with JPEG/PNG fallback
- SVG for icons and logos

**Optimization:**
- Compress all images (target: <200KB for hero, <50KB for thumbnails)
- Use responsive images (srcset) for different screen sizes
- Lazy-load images below the fold

**Aspect Ratios:**
```
Hero Banner:        16:9 (or 21:9 for ultra-wide)
Expert Photos:      1:1 (square) or 4:5 (portrait)
Testimonial Video:  16:9
Card Images:        4:3 or 16:9
```

---

## Accessibility Guidelines

### Colour Contrast
- **WCAG 2.1 AA Compliance:**
  - Text (normal): Minimum 4.5:1 contrast ratio
  - Text (large, 18px+): Minimum 3:1 contrast ratio
  - UI components: Minimum 3:1 contrast ratio

**Tested Combinations:**
```
✓ #1A1A1A on #FFFFFF (16.7:1) - Excellent
✓ #0066CC on #FFFFFF (4.6:1) - Pass
✓ #FFFFFF on #0066CC (4.6:1) - Pass
✗ #737373 on #FFFFFF (4.3:1) - Use for large text only
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus states: 2px solid outline in #0066CC, 3px offset
- Tab order follows logical reading flow
- Skip-to-content link for screen readers

### Screen Reader Support
- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`)
- ARIA labels for icon-only buttons
- Alt text for all images (descriptive, concise)
- Form labels properly associated with inputs
- Heading hierarchy (H1 → H2 → H3, no skipping)

### Interactive Elements
- Minimum touch target size: 44x44px (iOS/Android guideline)
- Sufficient spacing between clickable elements (at least 8px)
- Visible focus indicators
- No content on hover only (must be keyboard accessible)

### Motion & Animation
- Respect `prefers-reduced-motion` media query
- Provide option to disable animations
- No auto-playing video with sound
- Carousel must have pause button

### Forms
- Clear error messages next to relevant fields
- Real-time validation feedback
- Success confirmation messages
- Required fields clearly marked

---

## Localization Considerations (India)

### Cultural Nuance

**Colour Psychology:**
- Blue and green are well-received for healthcare/tech
- Gold accents can symbolize excellence and trust
- Avoid excessive red (can be alarming in health contexts)

**Imagery:**
- Include diverse representation of Indian demographics
- Consider regional diversity (North, South, East, West)
- Family-oriented imagery may resonate (multi-generational wellness)
- Professional settings: Indian office environments, homes

### Language & Typography

**English Language (Primary):**
- Use International English spelling (e.g., "programme" vs "program" - choose consistency)
- Avoid idioms or slang that may not translate well
- Use clear, simple language (healthcare should be accessible)

**Hindi Support (Optional):**
- If adding Hindi, ensure font supports Devanagari script
- Use proper Unicode encoding
- Right-to-left is not needed (Hindi is left-to-right)
- Consider regional languages (Tamil, Bengali, Marathi) for future

### Content Adaptations

**Pricing:**
- Display in INR (₹) with clear pricing
- Consider installment plans (EMI) common in India
- Show government/insurance acceptance if applicable

**Social Proof:**
- Highlight Indian testimonials and locations
- Include recognizable Indian cities (Mumbai, Delhi, Bangalore, etc.)
- Show partnerships with Indian healthcare institutions

**Contact & Support:**
- India phone number format: +91-XXXXX-XXXXX
- Business hours in IST timezone
- WhatsApp support option (very popular in India)

### Technical Considerations

**Performance:**
- Optimize for 3G/4G networks (India has variable speeds)
- Minimize page weight, lazy-load aggressively
- Consider offline-first PWA approach

**Payment Integration:**
- Support popular Indian payment gateways: Razorpay, Paytm, UPI
- Show UPI payment option prominently
- Accept major Indian credit/debit cards

---

## Technical Implementation Notes

### Framework Recommendations
- **React** + Next.js (for SSR/SSG, SEO benefits)
- **Tailwind CSS** (for rapid styling, matches spacing/colour system)
- **Framer Motion** (for animations)
- **Headless UI** (for accessible components)

### Performance Targets
```
Lighthouse Score:
- Performance:   90+
- Accessibility: 95+
- Best Practices: 90+
- SEO:           95+

Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay):        < 100ms
- CLS (Cumulative Layout Shift):  < 0.1
```

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile: iOS Safari 12+, Chrome Android 80+

### Responsive Images
```html
<picture>
  <source srcset="hero-desktop.webp" media="(min-width: 1024px)" type="image/webp">
  <source srcset="hero-tablet.webp" media="(min-width: 768px)" type="image/webp">
  <source srcset="hero-mobile.webp" type="image/webp">
  <img src="hero-fallback.jpg" alt="Calm person using wellness device" loading="lazy">
</picture>
```

---

## Design Assets Checklist

### Required Deliverables from Design Team

- [ ] Figma/Sketch/Adobe XD mockups (Desktop, Tablet, Mobile)
- [ ] Component library in design tool
- [ ] Exported SVG icons (all states: default, hover, active)
- [ ] Logo files (SVG, PNG @ 1x, 2x, 3x)
- [ ] Brand colour swatches (hex, RGB, CMYK)
- [ ] Typography specimens with scale
- [ ] Sample imagery (hero, expert photos, testimonials)
- [ ] Animation specifications (Lottie files or video references)
- [ ] Style guide PDF (summary document)

### Developer Handoff

- [ ] Design tokens JSON (colours, spacing, typography)
- [ ] Component specifications (HTML structure, CSS classes)
- [ ] Interaction documentation (hover states, transitions)
- [ ] Responsive breakpoint specifications
- [ ] Accessibility audit report
- [ ] Browser testing results
- [ ] Performance budget guidelines

---

## Appendix: Example Content

### Hero Section Copy
```
Headline: "Rewire Your Mind for Peak Performance"
Sub-headline: "Science-backed neurofeedback training to enhance focus, reduce stress, and unlock your potential."
Social Proof: "Trusted by 25,000+ members and 2,500 healthcare professionals worldwide"
CTA Primary: "Start Your Journey"
CTA Secondary: "See How It Works"
```

### Four Steps
```
Step 1: Discover
Understand your unique brain patterns through our comprehensive assessment

Step 2: Connect
Get paired with a certified coach who specializes in your wellness goals

Step 3: Train
Use our guided neurofeedback platform with personalized training sessions

Step 4: Thrive
Experience measurable improvements in focus, calm, sleep, and performance
```

### Goals/Use-Cases
```
1. Sharpen Focus & Attention
   Overcome distractions and boost productivity

2. Reduce Anxiety & Stress
   Find calm and balance in daily life

3. Improve Sleep Quality
   Fall asleep faster and wake refreshed

4. Enhance Peak Performance
   Optimize mental clarity for sports, work, or study

5. Manage ADHD Naturally
   Drug-free support for attention challenges

6. Support Healthy Aging
   Maintain cognitive health and mental sharpness
```

### Testimonial Examples
```
"After 12 weeks, my anxiety has reduced by 70%. I finally feel in control."
— Ananya Desai, Bangalore

"As a CEO, I need to perform at my best. This program gave me the edge."
— Rajesh Kumar, Mumbai

"My son's ADHD symptoms have improved dramatically. We're so grateful."
— Meera Patel, Pune
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2025 | Initial UI specification document | Design Team |

---

## Contact & Questions

For questions about this specification or implementation details, please contact:
- **Design Lead:** [design@neuro360.com]
- **Frontend Lead:** [dev@neuro360.com]
- **Project Manager:** [pm@neuro360.com]

---

**End of Document**
