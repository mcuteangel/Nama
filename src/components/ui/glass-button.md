# GlassButton Component

The GlassButton is a modern UI component that implements a glassmorphism effect for buttons in the Nama Contacts application.

## Usage

```jsx
import { GlassButton } from '@/components/ui/glass-button';
import { Plus } from 'lucide-react';

// Basic usage
<GlassButton onClick={handleClick}>
  Click me
</GlassButton>

// With icon
<GlassButton size="lg">
  <Plus className="w-5 h-5 mr-2" />
  Add Contact
</GlassButton>
```

## Props

The GlassButton component accepts all standard HTML button attributes as well as the following custom props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'glass' | Button variant style |
| size | 'default' \| 'sm' \| 'lg' \| 'xl' \| 'icon' | 'default' | Button size |
| effect | 'none' \| 'ripple' \| 'lift' \| 'glow' \| 'scale' \| 'pulse' | 'lift' | Hover effect |
| asChild | boolean | false | Render as child element |

## Styling

The GlassButton uses the enhanced glassmorphism effect defined in the global CSS:

- `glass-advanced` class for the base glass effect
- `border border-white/20` for the subtle border
- `hover:bg-white/10` for the hover state
- `dark:hover:bg-white/5` for the dark mode hover state

## Examples

### Primary Glass Button
```jsx
<GlassButton size="lg" className="w-full">
  Primary Action
</GlassButton>
```

### Icon Glass Button
```jsx
<GlassButton>
  <Plus className="w-4 h-4 mr-2" />
  Add New
</GlassButton>
```

### Disabled Glass Button
```jsx
<GlassButton disabled>
  Disabled Action
</GlassButton>
```