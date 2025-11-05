#!/usr/bin/env python3
"""
Generate placeholder icons for GHClip Chrome extension
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL not available. Please install Pillow: pip install Pillow")
    print("Or manually create icon PNG files in the icons/ directory")
    exit(1)

import os

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Icon sizes needed for Chrome extension
sizes = [16, 32, 48, 128]

# Gradient colors (purple gradient)
color1 = (102, 126, 234)  # #667eea
color2 = (118, 75, 162)   # #764ba2

for size in sizes:
    # Create new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw gradient background circle
    margin = 2
    circle_size = size - margin * 2

    # Simple gradient by averaging colors
    avg_color = tuple((c1 + c2) // 2 for c1, c2 in zip(color1, color2))

    # Draw circle
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=avg_color,
        outline=None
    )

    # Draw link icon (simplified)
    if size >= 32:
        link_color = (255, 255, 255, 255)  # White
        link_width = max(2, size // 16)
        center = size // 2

        # Draw chain link symbol
        quarter = size // 4
        offset = size // 6

        # Left arc
        draw.arc(
            [quarter - offset, quarter, quarter + offset, center + offset],
            start=180,
            end=360,
            fill=link_color,
            width=link_width
        )

        # Right arc
        draw.arc(
            [center, quarter - offset, center + quarter, quarter + offset + quarter],
            start=0,
            end=180,
            fill=link_color,
            width=link_width
        )

    # Save icon
    filename = f'icons/icon{size}.png'
    img.save(filename, 'PNG')
    print(f'Generated {filename}')

print('\nAll icons generated successfully!')
print('Icons are placeholder images. You can replace them with custom designs.')
