# 🎨 User Guide - EY Frontend Theme

## EY Colors

The theme uses the official EY Business School colors:

### Primary Colors
- **Dark Blue** : `bg-primary` / `text-primary` - #1A2557
- **Yellow/Gold** : `bg-secondary` / `text-secondary` - #E6A83D
- **Text** : `text-foreground` - #333539
- **Background** : `bg-background` - White

### State Colors
- **Success** : `bg-success` / `text-success` - EY Yellow
- **Warning** : `bg-warning` / `text-warning` - Orange
- **Error** : `bg-error` / `text-error` - Red

## 🎯 EY Utility Classes

### Buttons

```jsx
// Primary button (EY yellow)
<button className="btn-primary-ey">
  Call to Action
</button>

// Secondary button (EY blue)
<button className="btn-secondary-ey">
  Learn More
</button>

// Outline button
<button className="btn-outline-ey">
  Contact Us
</button>
```

### Cards

```jsx
// Simple card
<div className="card-ey">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Card with yellow accent
<div className="card-ey-accent">
  <h3>Featured Content</h3>
  <p>Important content</p>
</div>

// Card with blue background
<div className="card-ey-primary">
  <h3>Premium Card</h3>
  <p>White text on blue background</p>
</div>
```

### Badges

```jsx
// Yellow badge
<span className="badge-ey">New</span>

// Blue badge
<span className="badge-ey-primary">Premium</span>

// Outline badge
<span className="badge-ey-outline">In Progress</span>
```

### Navigation

```jsx
<nav className="nav-ey">
  <a href="/" className="nav-link-ey active">Home</a>
  <a href="/about" className="nav-link-ey">About</a>
  <a href="/contact" className="nav-link-ey">Contact</a>
</nav>
```

### Hero Section

```jsx
<section className="hero-ey">
  <div className="container-ey">
    <h1 className="hero-ey-title">
      Welcome to <span className="hero-ey-accent">EY</span>
    </h1>
    <p className="text-xl mt-6">
      Excellence and Innovation
    </p>
    <button className="btn-primary-ey mt-8">
      Discover
    </button>
  </div>
</section>
```

### Sections with Background

```jsx
// Section with dark blue background
<section className="section-ey-primary">
  <div className="container-ey">
    <h2>Title in white</h2>
    <p>Content on blue background</p>
  </div>
</section>

// Section with yellow background
<section className="section-ey-secondary">
  <div className="container-ey">
    <h2>Title in blue</h2>
    <p>Content on yellow background</p>
  </div>
</section>

// Section with light gray background
<section className="section-ey-light">
  <div className="container-ey">
    <h2>Standard title</h2>
    <p>Content on light background</p>
  </div>
</section>
```

### Inputs/Forms

```jsx
<form>
  <input
    type="text"
    className="input-ey"
    placeholder="Your name"
  />

  <input
    type="email"
    className="input-ey"
    placeholder="Your email"
  />

  <textarea
    className="textarea-ey"
    placeholder="Your message"
  />

  <select className="select-ey">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>

  <button type="submit" className="btn-primary-ey">
    Submit
  </button>
</form>
```

### Alerts/Notifications

```jsx
// Success alert
<div className="alert-success">
  <span>✓</span>
  <p>Operation successful!</p>
</div>

// Warning alert
<div className="alert-warning">
  <span>⚠</span>
  <p>Warning: please check your information</p>
</div>

// Error alert
<div className="alert-error">
  <span>✕</span>
  <p>An error occurred</p>
</div>

// Info alert
<div className="alert-info">
  <span>ℹ</span>
  <p>Important information</p>
</div>
```

### Grids

```jsx
// 3-column grid (responsive)
<div className="grid-ey">
  <div className="card-ey">Item 1</div>
  <div className="card-ey">Item 2</div>
  <div className="card-ey">Item 3</div>
</div>

// 2-column grid
<div className="grid-ey-2">
  <div className="card-ey">Item 1</div>
  <div className="card-ey">Item 2</div>
</div>

// 4-column grid
<div className="grid-ey-4">
  <div className="card-ey">Item 1</div>
  <div className="card-ey">Item 2</div>
  <div className="card-ey">Item 3</div>
  <div className="card-ey">Item 4</div>
</div>
```

### Dividers

```jsx
// Short divider (accent)
<div className="divider-ey"></div>

// Full-width divider
<div className="divider-ey-full"></div>

// Divider with gradient
<div className="divider-ey-gradient"></div>
```

### Containers

```jsx
// Standard container
<div className="container-ey">
  Standard content
</div>

// Narrow container (for text)
<div className="container-ey-narrow">
  Article or text content
</div>

// Wide container
<div className="container-ey-wide">
  Extended content
</div>
```

### Hover Effects

```jsx
// Lift on hover
<div className="card-ey hover-lift">
  Lifts on hover
</div>

// Scale on hover
<div className="card-ey hover-scale">
  Scales on hover
</div>

// Glow effect
<button className="btn-primary-ey hover-glow">
  Glowing effect
</button>
```

### Animations

```jsx
// Fade in + slide up
<div className="animate-fade-in-up">
  Appears with slide
</div>

// Fade in + scale
<div className="animate-fade-in-scale">
  Appears with zoom
</div>

// Stagger (children with delay)
<div className="stagger-children">
  <div>Element 1</div>
  <div>Element 2</div>
  <div>Element 3</div>
</div>
```

### Text with Gradient

```jsx
<h1 className="text-gradient-ey">
  Title with blue/yellow gradient
</h1>
```

### EY Shadows

```jsx
// Simple shadow
<div className="shadow-ey">Card with shadow</div>

// Large shadow
<div className="shadow-ey-lg">Card with large shadow</div>

// Blue shadow
<div className="shadow-ey-primary">EY blue shadow</div>

// Yellow shadow
<div className="shadow-ey-secondary">EY yellow shadow</div>
```

### Footer

```jsx
<footer className="footer-ey">
  <div className="container-ey">
    <div className="grid-ey">
      <div>
        <h4>About</h4>
        <p>Description</p>
      </div>
      <div>
        <h4>Links</h4>
        <nav>
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
        </nav>
      </div>
    </div>
  </div>
</footer>
```

## 🎨 Composition Examples

### Complete Homepage

```jsx
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-ey">
        <div className="container-ey text-center">
          <h1 className="hero-ey-title">
            Excellence <span className="hero-ey-accent">Business</span>
          </h1>
          <p className="text-xl mt-6 opacity-90">
            Excellence training for tomorrow's leaders
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <button className="btn-primary-ey">
              Our Programs
            </button>
            <button className="btn-outline-ey">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-ey">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Strengths
          </h2>
          <div className="grid-ey stagger-children">
            <div className="card-ey-accent text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                High-level training
              </p>
            </div>
            <div className="card-ey-accent text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">International</h3>
              <p className="text-muted-foreground">
                Global network
              </p>
            </div>
            <div className="card-ey-accent text-center">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2">Career</h3>
              <p className="text-muted-foreground">
                Guaranteed opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-ey-primary">
        <div className="container-ey text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to join EY?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discover our programs and apply now
          </p>
          <button className="btn-primary-ey hover-glow">
            Apply Now
          </button>
        </div>
      </section>
    </>
  )
}
```

### Contact Page

```jsx
export default function ContactPage() {
  return (
    <div className="py-20">
      <div className="container-ey-narrow">
        <h1 className="text-5xl font-bold text-center mb-4">
          Contact Us
        </h1>
        <div className="divider-ey mx-auto"></div>

        <div className="card-ey mt-12">
          <form className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Name</label>
              <input
                type="text"
                className="input-ey"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Email</label>
              <input
                type="email"
                className="input-ey"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Subject</label>
              <select className="select-ey">
                <option>Admissions</option>
                <option>Programs</option>
                <option>Partnerships</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Message</label>
              <textarea
                className="textarea-ey"
                placeholder="Your message..."
              />
            </div>

            <button type="submit" className="btn-primary-ey w-full">
              Send Message
            </button>
          </form>
        </div>

        <div className="alert-info mt-8">
          <span>ℹ</span>
          <p>
            We typically respond within 24-48 business hours.
          </p>
        </div>
      </div>
    </div>
  )
}
```

## 🌗 Dark Mode

The theme automatically supports dark mode via `data-theme="dark"` on the HTML element.

Colors automatically adapt:
- Background: Very dark blue
- Text: White
- Primary: Yellow (for contrast)
- Cards: Slightly lighter blue

## 📱 Responsive

All components are responsive by default with these breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Best Practices

1. **Use EY classes** rather than direct Tailwind for consistency
2. **Test in light AND dark mode**
3. **Prefer subtle animations** (hover-lift, hover-scale)
4. **Use appropriate containers** (narrow for text, standard for layout)
5. **Respect color hierarchy**: Yellow for actions, Blue for structure

## 🚀 Going Further

Consult these files:
- `globals.css`: Color variables
- `ey-theme.css`: Complete utility classes

Customize by modifying the OKLCH variables in `globals.css`!
