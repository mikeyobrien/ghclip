#!/bin/bash
# Create simple placeholder icons using base64 encoded minimal PNGs

# Minimal 1x1 purple PNG (base64)
# These are tiny placeholder images - replace with real icons for production

echo "Creating placeholder icons..."

# Create a simple colored square for each size
for size in 16 32 48 128; do
  # Create a simple PPM file and convert to PNG if available
  if command -v pnmtopng &> /dev/null; then
    echo "P3 $size $size 255" > temp.ppm
    for ((i=0; i<size*size; i++)); do
      echo "102 126 234" >> temp.ppm
    done
    pnmtopng temp.ppm > icon${size}.png
    rm temp.ppm
  else
    echo "Placeholder icon${size}.png needed - please generate manually"
  fi
done

echo "Done! Replace these placeholder icons with proper ones."
