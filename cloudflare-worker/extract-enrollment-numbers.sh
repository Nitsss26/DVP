#!/bin/bash

# Extract all enrollment numbers from credentials-real.json
# This script creates a list of all enrollment numbers for the registry page

INPUT_FILE="../src/credentials-real.json"
OUTPUT_FILE="enrollment-numbers.json"
JS_OUTPUT_FILE="../src/data/enrollmentNumbers.js"

echo "📋 Extracting enrollment numbers from $INPUT_FILE..."

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: $INPUT_FILE not found!"
    exit 1
fi

# Extract enrollment numbers using jq
echo "🔍 Processing credentials data..."
ENROLLMENT_NUMBERS=$(jq -r '.[].credentialPayload.credentialSubject.enrolment_number' "$INPUT_FILE" | sort -u)

# Count total numbers
TOTAL_COUNT=$(echo "$ENROLLMENT_NUMBERS" | wc -l)
echo "✅ Found $TOTAL_COUNT unique enrollment numbers"

# Create JSON array
echo "📝 Creating JSON file..."
echo "$ENROLLMENT_NUMBERS" | jq -R . | jq -s . > "$OUTPUT_FILE"

# Create JavaScript module for React app
echo "🚀 Creating JavaScript module for React app..."
mkdir -p "../src/data"

cat > "$JS_OUTPUT_FILE" << 'EOF'
// Auto-generated enrollment numbers from credentials-real.json
// This file contains all unique enrollment numbers for the student registry

export const enrollmentNumbers = [
EOF

# Add enrollment numbers to JS file
echo "$ENROLLMENT_NUMBERS" | while read -r number; do
    echo "  \"$number\"," >> "$JS_OUTPUT_FILE"
done

# Close the array
cat >> "$JS_OUTPUT_FILE" << 'EOF'
];

export const totalCount = ENROLLMENT_NUMBERS.length;

export default enrollmentNumbers;
EOF

# Fix the totalCount reference
sed -i '' 's/ENROLLMENT_NUMBERS.length/'"$TOTAL_COUNT"'/g' "$JS_OUTPUT_FILE" 2>/dev/null || \
sed -i 's/ENROLLMENT_NUMBERS.length/'"$TOTAL_COUNT"'/g' "$JS_OUTPUT_FILE"

echo ""
echo "🎉 Extraction completed!"
echo "📊 Results:"
echo "   • Total enrollment numbers: $TOTAL_COUNT"
echo "   • JSON output: $OUTPUT_FILE"
echo "   • JavaScript module: $JS_OUTPUT_FILE"
echo ""
echo "📋 Sample enrollment numbers:"
echo "$ENROLLMENT_NUMBERS" | head -5
echo "   ..."
echo ""

# Create a summary file with student details
echo "📚 Creating detailed student registry..."
DETAILED_OUTPUT="../src/data/studentRegistry.js"

cat > "$DETAILED_OUTPUT" << 'EOF'
// Auto-generated student registry from credentials-real.json
// This file contains detailed student information for the registry page

export const students = [
EOF

# Extract detailed student information
jq -r '.[] | @json' "$INPUT_FILE" | while read -r line; do
    ENROLLMENT=$(echo "$line" | jq -r '.credentialPayload.credentialSubject.enrolment_number')
    NAME=$(echo "$line" | jq -r '.credentialPayload.credentialSubject.name')
    DEGREE=$(echo "$line" | jq -r '.credentialPayload.credentialSubject.achievement.name')
    
    cat >> "$DETAILED_OUTPUT" << EOF
  {
    enrollmentNumber: "$ENROLLMENT",
    name: "$NAME",
    degree: "$DEGREE"
  },
EOF
done

# Close the array and add exports
cat >> "$DETAILED_OUTPUT" << 'EOF'
];

export const totalStudents = students.length;

export default students;
EOF

echo "✅ Detailed student registry created: $DETAILED_OUTPUT"
echo ""
echo "🎯 Next steps:"
echo "   1. The registry page can now import from '../data/studentRegistry.js'"
echo "   2. All $TOTAL_COUNT students will be available for search and display"
echo "   3. Real student names and degrees are included"