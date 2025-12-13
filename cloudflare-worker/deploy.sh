#!/bin/bash

echo "🚀 Setting up Barkatullah University Credentials API on Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Logging into Cloudflare..."
wrangler login

# Create KV namespace
echo "📦 Creating KV namespace..."
NAMESPACE_OUTPUT=$(wrangler kv namespace create "CREDENTIALS_KV" 2>&1)
NAMESPACE_ID=$(echo "$NAMESPACE_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$NAMESPACE_ID" ]; then
    echo "❌ Failed to create KV namespace"
    echo "Output: $NAMESPACE_OUTPUT"
    exit 1
fi

echo "✅ KV namespace created with ID: $NAMESPACE_ID"

# Update wrangler.toml with the namespace ID
sed -i.bak "s/YOUR_KV_NAMESPACE_ID/$NAMESPACE_ID/g" wrangler.toml
rm wrangler.toml.bak

echo "📝 Updated wrangler.toml with namespace ID"

# Deploy the worker
echo "🚀 Deploying worker..."
wrangler deploy

echo "✅ Worker deployed successfully!"
echo ""
echo "🔗 Your API endpoints will be available at:"
echo "   https://barkatullah-credentials-api.YOUR_SUBDOMAIN.workers.dev/api/credentials/{enrollmentNumber}"
echo ""
echo "Next steps:"
echo "1. Note down your worker URL from the deployment output above"
echo "2. Run './populate-kv.sh' to add credential data"
echo "3. Update your React app to use the new API"