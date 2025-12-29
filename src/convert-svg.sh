#!/bin/bash

# SVG to PNG Converter Script
# Uses rsvg-convert (librsvg) for fast SVG conversion

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
WIDTH=1200
HEIGHT=630
FORMAT=png

# Parse arguments
INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ -z "$INPUT_FILE" ]; then
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 <input.svg> [output.png]"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 assets/cover-modern.svg"
    echo "  $0 assets/test.svg output.png"
    echo ""
    echo -e "${BLUE}With custom size:${NC}"
    echo "  WIDTH=1920 HEIGHT=1080 $0 assets/test.svg"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit 1
fi

# Check if input is SVG
if [[ ! "$INPUT_FILE" =~ \.svg$ ]]; then
    echo "Error: Input file must be an SVG file"
    exit 1
fi

# Determine output file
if [ -z "$OUTPUT_FILE" ]; then
    OUTPUT_FILE="${INPUT_FILE%.svg}.$FORMAT"
fi

echo -e "${BLUE}Converting:${NC} $INPUT_FILE"
echo -e "${BLUE}To:${NC} $OUTPUT_FILE"
echo -e "${BLUE}Size:${NC} ${WIDTH}x${HEIGHT}"
echo ""

# Convert using rsvg-convert
rsvg-convert -w "$WIDTH" -h "$HEIGHT" -f "$FORMAT" -o "$OUTPUT_FILE" "$INPUT_FILE"

if [ $? -eq 0 ]; then
    # Get file size
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Success!${NC} Output: $OUTPUT_FILE (${FILE_SIZE})"
else
    echo -e "${RED}✗ Failed to convert${NC}"
    exit 1
fi
