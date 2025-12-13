#!/bin/bash

# Bulk upload script for credentials to Cloudflare KV
# This script uploads all credentials from credentials-real.json to KV storage

CREDENTIALS_FILE="../src/credentials-real.json"
KV_BINDING="CREDENTIALS_KV"
BATCH_SIZE=10
DELAY_BETWEEN_BATCHES=2  # seconds

echo "🚀 Starting bulk upload of credentials..."
echo "📂 Reading from: $CREDENTIALS_FILE"

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "❌ Error: Credentials file not found at $CREDENTIALS_FILE"
    exit 1
fi

# Get total count
TOTAL_COUNT=$(jq '. | length' "$CREDENTIALS_FILE")
echo "📊 Total credentials to upload: $TOTAL_COUNT"

# Counter for progress tracking
UPLOADED=0
FAILED=0
BATCH_COUNT=0

# Process credentials in batches
for ((i = 0; i < TOTAL_COUNT; i += BATCH_SIZE)); do
    BATCH_COUNT=$((BATCH_COUNT + 1))
    echo ""
    echo "📦 Processing batch $BATCH_COUNT (items $((i + 1)) to $((i + BATCH_SIZE > TOTAL_COUNT ? TOTAL_COUNT : i + BATCH_SIZE)))..."
    
    # Process batch items
    for ((j = i; j < i + BATCH_SIZE && j < TOTAL_COUNT; j++)); do
        # Extract credential data
        CREDENTIAL=$(jq ".[$j]" "$CREDENTIALS_FILE")
        ENROLLMENT_NUMBER=$(echo "$CREDENTIAL" | jq -r '.credentialPayload.credentialSubject.enrolment_number')
        NAME=$(echo "$CREDENTIAL" | jq -r '.credentialPayload.credentialSubject.name')
        
        # Skip if enrollment number is null or empty
        if [ "$ENROLLMENT_NUMBER" = "null" ] || [ -z "$ENROLLMENT_NUMBER" ]; then
            echo "⚠️  Skipping item $((j + 1)) - no enrollment number"
            continue
        fi
        
        echo "📝 Uploading: $ENROLLMENT_NUMBER ($NAME)"
        
        # Upload to KV storage
        if wrangler kv key put "$ENROLLMENT_NUMBER" "$CREDENTIAL" --binding "$KV_BINDING" --remote 2>/dev/null; then
            echo "✅ Successfully uploaded: $ENROLLMENT_NUMBER"
            UPLOADED=$((UPLOADED + 1))
        else
            echo "❌ Failed to upload: $ENROLLMENT_NUMBER"
            FAILED=$((FAILED + 1))
        fi
        
        # Small delay between individual uploads
        sleep 0.2
    done
    
    # Progress report
    echo "📈 Progress: $UPLOADED uploaded, $FAILED failed out of $((UPLOADED + FAILED)) processed"
    
    # Delay between batches to avoid rate limiting
    if [ $((i + BATCH_SIZE)) -lt $TOTAL_COUNT ]; then
        echo "⏱️  Waiting ${DELAY_BETWEEN_BATCHES}s before next batch..."
        sleep $DELAY_BETWEEN_BATCHES
    fi
done

echo ""
echo "🎉 Bulk upload completed!"
echo "📊 Final results:"
echo "   ✅ Successfully uploaded: $UPLOADED"
echo "   ❌ Failed uploads: $FAILED"
echo "   📋 Total processed: $((UPLOADED + FAILED))"

# Verify a few random uploads
echo ""
echo "🔍 Verifying random uploads..."
VERIFICATION_COUNT=5
for ((i = 0; i < VERIFICATION_COUNT; i++)); do
    RANDOM_INDEX=$(shuf -i 0-$((TOTAL_COUNT - 1)) -n 1)
    ENROLLMENT_NUMBER=$(jq -r ".[$RANDOM_INDEX].credentialPayload.credentialSubject.enrolment_number" "$CREDENTIALS_FILE")
    
    if [ "$ENROLLMENT_NUMBER" != "null" ] && [ -n "$ENROLLMENT_NUMBER" ]; then
        echo "🔍 Checking: $ENROLLMENT_NUMBER"
        if wrangler kv key get "$ENROLLMENT_NUMBER" --binding "$KV_BINDING" --remote >/dev/null 2>&1; then
            echo "✅ Verified: $ENROLLMENT_NUMBER exists in KV"
        else
            echo "❌ Verification failed: $ENROLLMENT_NUMBER not found in KV"
        fi
    fi
done

echo ""
echo "🏁 Upload process complete!"