# PWA Icons

This directory needs PNG icon files for the PWA to work properly:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Quick Setup

### Option 1: Convert SVG to PNG (Recommended)
SVG icons are provided. Convert them to PNG:

```bash
# Using ImageMagick
convert icon-192.svg -resize 192x192 icon-192.png
convert icon-512.svg -resize 512x512 icon-512.png

# Using Inkscape
inkscape icon-192.svg --export-filename=icon-192.png --export-width=192 --export-height=192
inkscape icon-512.svg --export-filename=icon-512.png --export-width=512 --export-height=512
```

### Option 2: Online Conversion
1. Visit https://cloudconvert.com/svg-to-png
2. Upload `icon-192.svg` and `icon-512.svg`
3. Set dimensions and download as PNG

### Option 3: Create Custom Icons
Use any design tool (Figma, Photoshop, etc.) to create:
- 192x192px icon with your app logo
- 512x512px icon with your app logo
- Save as PNG files

## Icon Design Guidelines
- Use your brand colors (purple gradient: #7c3aed to #6366f1)
- Include a play icon or video-related symbol
- Ensure icons are clear and recognizable at small sizes
- Use transparent or solid background

## Testing
After adding PNG icons, test the PWA:
1. Build the app: `npm run build`
2. Serve the build folder
3. Open in Chrome and check "Add to Home Screen" option
4. Verify icons appear correctly

