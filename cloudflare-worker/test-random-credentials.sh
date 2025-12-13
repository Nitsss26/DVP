#!/bin/bash

# Simple test script to verify random credentials
echo "🧪 Testing 20 random credentials from uploaded data..."
echo ""

# Array of enrollment numbers from your list
enrollments=(
    "r250522330030" "r250522330004" "r225350280048" "r250522330028" "r250522330022"
    "p191851710027" "p200301710011" "r181330300021" "r171610300011" "r1214359"
    "r648146" "r181460300156" "r190072380007" "r98066" "b38208"
    "r944982" "r201910300005" "r113769" "r14117227" "r221670300245"
)

success_count=0
fail_count=0

echo "Testing ${#enrollments[@]} credentials..."
echo ""

for i in "${!enrollments[@]}"; do
    enrollment="${enrollments[$i]}"
    printf "Test %2d/20: %-15s → " $((i+1)) "$enrollment"
    
    # Make API call and extract name
    response=$(curl -s "https://barkatullah-credentials-api.lachlanwebb123.workers.dev/api/credentials/$enrollment" 2>/dev/null)
    name=$(echo "$response" | jq -r '.credentialPayload.credentialSubject.name // "ERROR"' 2>/dev/null)
    
    if [[ "$name" != "ERROR" && "$name" != "null" && -n "$name" ]]; then
        echo "✅ $name"
        ((success_count++))
    else
        echo "❌ FAILED"
        ((fail_count++))
    fi
done

echo ""
echo "📊 RESULTS:"
echo "✅ Successful: $success_count"
echo "❌ Failed: $fail_count" 
echo "📈 Success Rate: $((success_count * 100 / ${#enrollments[@]}))%"

if [ $success_count -eq ${#enrollments[@]} ]; then
    echo "🎉 All tests passed! Upload was successful."
else
    echo "⚠️  Some tests failed. Check the failed enrollment numbers."
fi