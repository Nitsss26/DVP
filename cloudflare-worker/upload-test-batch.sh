#!/bin/bash

echo "🚀 Uploading a batch of real credentials to test..."

cd /Users/lachlanwebb/educhain-auth-bridge/cloudflare-worker

# Upload first 5 credentials one by one for testing
for i in {0..4}; do
    echo "📤 Processing credential $((i+1))/5..."
    
    # Extract enrollment number
    enrolment_number=$(jq -r ".[$i].credentialPayload.credentialSubject.enrolment_number" ../src/credentials-real.json)
    
    if [ "$enrolment_number" != "null" ] && [ "$enrolment_number" != "" ]; then
        echo "   Enrollment: $enrolment_number"
        
        # Extract and save credential to temp file
        jq ".[$i]" ../src/credentials-real.json > "temp_cred_$i.json"
        
        # Upload to KV
        wrangler kv key put "$enrolment_number" --binding CREDENTIALS_KV --remote --path "temp_cred_$i.json"
        
        # Clean up temp file
        rm "temp_cred_$i.json"
        
        echo "   ✅ Uploaded: $enrolment_number"
        sleep 1
    else
        echo "   ⚠️  Skipping invalid enrollment number"
    fi
done

echo "🎉 Test batch complete!"
echo ""
echo "🧪 Test the API:"
echo "curl https://barkatullah-credentials-api.lachlanwebb123.workers.dev/api/credentials/r250212330015"