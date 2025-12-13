#!/bin/bash

echo "📁 Populating KV storage with credential data..."

# Get the namespace ID from wrangler.toml
NAMESPACE_ID=$(grep 'id = ' wrangler.toml | cut -d'"' -f2)

if [ -z "$NAMESPACE_ID" ]; then
    echo "❌ Could not find namespace ID in wrangler.toml"
    echo "Make sure you've run ./deploy.sh first"
    exit 1
fi

echo "Using namespace ID: $NAMESPACE_ID"
echo "Adding credentials to KV storage..."

# BU2021CS001
echo "Adding BU2021CS001..."
wrangler kv key put "BU2021CS001" '{
  "holderAddress": "0x1234567890123456789012345678901234567890",
  "credentialPayload": {
    "awardedDate": "2024-06-15",
    "validFrom": "2024-06-15", 
    "description": "Bachelor of Computer Science from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "John Doe",
      "achievement": {
        "name": "Bachelor of Computer Science",
        "description": "Undergraduate degree in Computer Science with specialization in Software Engineering"
      },
      "enrolment_number": "BU2021CS001"
    }
  }
}' --namespace-id "$NAMESPACE_ID"

# BU2021BA002
echo "Adding BU2021BA002..."
wrangler kv key put "BU2021BA002" '{
  "holderAddress": "0x2345678901234567890123456789012345678901",
  "credentialPayload": {
    "awardedDate": "2024-05-20",
    "validFrom": "2024-05-20",
    "description": "Bachelor of Business Administration from Barkatullah University, Bhopal, India", 
    "credentialSubject": {
      "name": "Jane Smith",
      "achievement": {
        "name": "Bachelor of Business Administration",
        "description": "Undergraduate degree in Business Administration with focus on Management"
      },
      "enrolment_number": "BU2021BA002"
    }
  }
}' --namespace-id "$NAMESPACE_ID"

# BU2022ME003
echo "Adding BU2022ME003..."
wrangler kv key put "BU2022ME003" '{
  "holderAddress": "0x3456789012345678901234567890123456789012",
  "credentialPayload": {
    "awardedDate": "2024-07-10",
    "validFrom": "2024-07-10",
    "description": "Master of Engineering from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Robert Johnson", 
      "achievement": {
        "name": "Master of Engineering",
        "description": "Postgraduate degree in Engineering with specialization in Civil Engineering"
      },
      "enrolment_number": "BU2022ME003"
    }
  }
}' --namespace-id "$NAMESPACE_ID"

# BU2021AR004
echo "Adding BU2021AR004..."
wrangler kv key put "BU2021AR004" '{
  "holderAddress": "0x4567890123456789012345678901234567890123",
  "credentialPayload": {
    "awardedDate": "2024-04-30",
    "validFrom": "2024-04-30",
    "description": "Bachelor of Arts from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Sarah Wilson",
      "achievement": {
        "name": "Bachelor of Arts", 
        "description": "Undergraduate degree in Arts with major in English Literature"
      },
      "enrolment_number": "BU2021AR004"
    }
  }
}' --namespace-id "$NAMESPACE_ID"

# BU2021SC005
echo "Adding BU2021SC005..."
wrangler kv key put "BU2021SC005" '{
  "holderAddress": "0x5678901234567890123456789012345678901234",
  "credentialPayload": {
    "awardedDate": "2024-08-15",
    "validFrom": "2024-08-15", 
    "description": "Bachelor of Science from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Michael Brown",
      "achievement": {
        "name": "Bachelor of Science",
        "description": "Undergraduate degree in Science with major in Physics"
      },
      "enrolment_number": "BU2021SC005"
    }
  }
}' --namespace-id "$NAMESPACE_ID"

echo "✅ All credentials added to KV storage!"
echo ""
echo "🧪 Test your API with:"
echo "curl https://barkatullah-credentials-api.YOUR_SUBDOMAIN.workers.dev/api/credentials/BU2021CS001"

# BU2021BA002
wrangler kv:key put "BU2021BA002" '{
  "holderAddress": "0x2345678901234567890123456789012345678901",
  "credentialPayload": {
    "awardedDate": "2024-05-20",
    "validFrom": "2024-05-20",
    "description": "Bachelor of Business Administration from Barkatullah University, Bhopal, India", 
    "credentialSubject": {
      "name": "Jane Smith",
      "achievement": {
        "name": "Bachelor of Business Administration",
        "description": "Undergraduate degree in Business Administration with focus on Management"
      },
      "enrolment_number": "BU2021BA002"
    }
  }
}' --namespace-id $(grep 'id = ' wrangler.toml | cut -d'"' -f2)

# BU2022ME003
wrangler kv:key put "BU2022ME003" '{
  "holderAddress": "0x3456789012345678901234567890123456789012",
  "credentialPayload": {
    "awardedDate": "2024-07-10",
    "validFrom": "2024-07-10",
    "description": "Master of Engineering from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Robert Johnson", 
      "achievement": {
        "name": "Master of Engineering",
        "description": "Postgraduate degree in Engineering with specialization in Civil Engineering"
      },
      "enrolment_number": "BU2022ME003"
    }
  }
}' --namespace-id $(grep 'id = ' wrangler.toml | cut -d'"' -f2)

# BU2021AR004
wrangler kv:key put "BU2021AR004" '{
  "holderAddress": "0x4567890123456789012345678901234567890123",
  "credentialPayload": {
    "awardedDate": "2024-04-30",
    "validFrom": "2024-04-30",
    "description": "Bachelor of Arts from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Sarah Wilson",
      "achievement": {
        "name": "Bachelor of Arts", 
        "description": "Undergraduate degree in Arts with major in English Literature"
      },
      "enrolment_number": "BU2021AR004"
    }
  }
}' --namespace-id $(grep 'id = ' wrangler.toml | cut -d'"' -f2)

# BU2021SC005
wrangler kv:key put "BU2021SC005" '{
  "holderAddress": "0x5678901234567890123456789012345678901234",
  "credentialPayload": {
    "awardedDate": "2024-08-15",
    "validFrom": "2024-08-15", 
    "description": "Bachelor of Science from Barkatullah University, Bhopal, India",
    "credentialSubject": {
      "name": "Michael Brown",
      "achievement": {
        "name": "Bachelor of Science",
        "description": "Undergraduate degree in Science with major in Physics"
      },
      "enrolment_number": "BU2021SC005"
    }
  }
}' --namespace-id $(grep 'id = ' wrangler.toml | cut -d'"' -f2)

echo "✅ All credentials added to KV storage!"
echo ""
echo "🧪 Test your API:"
echo "curl https://barkatullah-credentials-api.YOUR_SUBDOMAIN.workers.dev/api/credentials/BU2021CS001"