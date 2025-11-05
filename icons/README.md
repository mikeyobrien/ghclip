# GHClip Icons

This directory should contain the extension icons in PNG format.

## Required Files

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Generating Icons

You can use the provided `icon.svg` file to generate PNG icons:

### Using ImageMagick:
```bash
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 32x32 icon.svg icon32.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

### Using Inkscape:
```bash
inkscape icon.svg --export-png=icon16.png -w 16 -h 16
inkscape icon.svg --export-png=icon32.png -w 32 -h 32
inkscape icon.svg --export-png=icon48.png -w 48 -h 48
inkscape icon.svg --export-png=icon128.png -w 128 -h 128
```

### Online Converters:
- Use https://cloudconvert.com/svg-to-png
- Upload `icon.svg` and convert to each required size

## Temporary Placeholder

If you don't have icons yet, the extension will still work. Chrome will display a default extension icon.
