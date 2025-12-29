#!/bin/bash

# Batch SVG to PNG Converter Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
WIDTH=1200
HEIGHT=630
DIRECTORY="${1:-assets}"
PATTERN="${2:-*.svg}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Batch SVG to PNG Converter${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo -e "${RED}Error: Directory not found: $DIRECTORY${NC}"
    exit 1
fi

# Find all SVG files
SVG_FILES=$(find "$DIRECTORY" -maxdepth 1 -name "$PATTERN" -type f)

if [ -z "$SVG_FILES" ]; then
    echo -e "${YELLOW}No SVG files found matching: $DIRECTORY/$PATTERN${NC}"
    exit 0
fi

# Count files
COUNT=$(echo "$SVG_FILES" | grep -c . || echo "0")

echo -e "${GREEN}Found $COUNT SVG file(s) to convert:${NC}"
echo ""

# Convert each file
SUCCESS=0
FAILED=0
INDEX=0

while IFS= read -r svg_file; do
    [ -f "$svg_file" ] || continue
    INDEX=$((INDEX + 1))

    filename=$(basename "$svg_file")
    png_file="${svg_file%.svg}.png"

    echo -ne "${BLUE}[$INDEX/$COUNT]${NC} Converting $filename... "

    if rsvg-convert -w "$WIDTH" -h "$HEIGHT" -f png -o "$png_file" "$svg_file" 2>/dev/null; then
        # Get file size
        file_size=$(ls -lh "$png_file" | awk '{print $5}')
        echo -e "${GREEN}✓${NC} ($file_size)"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗${NC}"
        FAILED=$((FAILED + 1))
    fi
done <<< "$SVG_FILES"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Conversion Summary:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Success: $SUCCESS${NC}"
echo -e "${RED}  ✗ Failed:  $FAILED${NC}"
echo -e "${BLUE}  Total:    $INDEX${NC}"
echo ""
