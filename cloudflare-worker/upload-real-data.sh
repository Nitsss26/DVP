#!/bin/bash

echo "🚀 Uploading real credentials data to Cloudflare KV..."

# Check if the credentials file exists
if [ ! -f "../src/credentials-real.json" ]; then
    echo "❌ credentials-real.json file not found!"
    exit 1
fi

echo "📊 Analyzing credentials file..."
TOTAL_CREDENTIALS=$(jq length ../src/credentials-real.json)
echo "Found $TOTAL_CREDENTIALS credentials to upload"

echo "🔄 Starting upload process..."

# Counter for progress tracking
counter=0

# Read JSON and upload each credential
jq -c '.[]' ../src/credentials-real.json | while read -r credential; do
    # Extract enrollment number for the key
    enrolment_number=$(echo "$credential" | jq -r '.credentialPayload.credentialSubject.enrolment_number')
    
    if [ "$enrolment_number" != "null" ] && [ "$enrolment_number" != "" ]; then
        echo "📤 Uploading credential for enrollment: $enrolment_number"
        
        # Upload to KV with remote flag
        echo "$credential" | wrangler kv key put "$enrolment_number" --binding CREDENTIALS_KV --remote --stdin
        
        # Increment counter
        ((counter++))
        
        # Show progress every 10 uploads
        if [ $((counter % 10)) -eq 0 ]; then
            echo "✅ Uploaded $counter/$TOTAL_CREDENTIALS credentials..."
        fi
        
        # Small delay to avoid rate limits
        sleep 0.1
    else
        echo "⚠️  Skipping credential with invalid enrollment number"
    fi
done

echo "🎉 Upload completed! Uploaded $counter credentials to Cloudflare KV."
echo ""
echo "🧪 Test your API with a real enrollment number:"
echo "curl https://barkatullah-credentials-api.lachlanwebb123.workers.dev/api/credentials/r250212330015"