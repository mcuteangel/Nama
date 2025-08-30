# Global Style Utilities

This module provides utility functions for applying consistent styling across the application.

## applyGlassEffect

Applies glassmorphism effects to elements with enhanced customization options.

### Usage

```typescript
import { applyGlassEffect } from '@/lib/global-style-utils';

// Using intensity
const glassClasses = applyGlassEffect(undefined, { intensity: 'medium' });

// Using variant
const glassClasses = applyGlassEffect(undefined, { variant: 'button' });

// With additional classes
const glassClasses = applyGlassEffect('custom-class', { variant: 'advanced' });
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| className | string | Additional CSS classes to merge |
| options | Object | Configuration options |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| intensity | 'light' \| 'medium' \| 'strong' | 'medium' | Glass effect intensity |
| variant | 'default' \| 'advanced' \| 'card' \| 'background' \| 'button' | 'default' | Predefined glass variants |

### Variants

- **default**: Basic glass effect with `glass` class
- **advanced**: Enhanced glass effect with `glass-advanced` class
- **card**: Strong glass effect with `glass-card` class
- **background**: Background glass effect with `glass-background` class
- **button**: Specialized button glass effect with enhanced hover states

### Examples

```typescript
// Basic glass effect
<div className={applyGlassEffect(undefined, { variant: 'advanced' })}>
  Glass content
</div>

// Glass button
<button className={applyGlassEffect('px-4 py-2', { variant: 'button' })}>
  Glass Button
</button>

// Custom glass card
<div className={applyGlassEffect('p-6 rounded-xl', { variant: 'card' })}>
  Glass Card
</div>
```