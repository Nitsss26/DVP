// Cloudflare Worker for Barkatullah University Credential Verification
// Clean implementation for real credentials data

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://educhain-auth-bridge.lovable.app',
    'https://vc-demo.educhain.xyz',
    'https://vc-demo.educhain.xyz/'
];

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get('Origin');

        // Check if origin is allowed
        const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

        // Set CORS headers based on allowed origins
        const corsHeaders = {
            'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : 'null',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle preflight OPTIONS request
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: corsHeaders,
            });
        }

        // Reject requests from unauthorized origins
        if (!isAllowedOrigin) {
            return new Response(JSON.stringify({
                error: 'Unauthorized domain',
                message: 'This API can only be accessed from authorized domains.'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const url = new URL(request.url);

        // GET /api/credentials/{enrollmentNumber}
        if (request.method === 'GET' && url.pathname.startsWith('/api/credentials/')) {
            const enrollmentNumber = url.pathname.split('/').pop();

            if (!enrollmentNumber) {
                return new Response(JSON.stringify({ error: 'Enrollment number is required' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            try {
                console.log('Looking up enrollment number:', enrollmentNumber);

                // Get credential from KV storage - try exact match first
                let credential = await env.CREDENTIALS_KV.get(enrollmentNumber, 'json');

                // If not found, try uppercase
                if (!credential) {
                    credential = await env.CREDENTIALS_KV.get(enrollmentNumber.toUpperCase(), 'json');
                }

                // If not found, try lowercase
                if (!credential) {
                    credential = await env.CREDENTIALS_KV.get(enrollmentNumber.toLowerCase(), 'json');
                }

                if (!credential) {
                    console.log('Credential not found for:', enrollmentNumber);
                    return new Response(JSON.stringify({
                        error: 'Credential not found',
                        enrollmentNumber: enrollmentNumber
                    }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                console.log('Found credential for:', enrollmentNumber);
                return new Response(JSON.stringify(credential), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            } catch (error) {
                console.error('Error fetching credential:', error);
                return new Response(JSON.stringify({
                    error: 'Internal server error',
                    message: error.message
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // GET /api/credentials (list all)
        if (request.method === 'GET' && url.pathname === '/api/credentials') {
            try {
                const list = await env.CREDENTIALS_KV.list();
                const credentials = [];

                for (const key of list.keys) {
                    const credential = await env.CREDENTIALS_KV.get(key.name, 'json');
                    if (credential) {
                        credentials.push(credential);
                    }
                }

                return new Response(JSON.stringify({
                    count: credentials.length,
                    credentials: credentials
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'Internal server error',
                    message: error.message
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // Default response - API info
        return new Response(JSON.stringify({
            message: 'Barkatullah University Credential Verification API',
            endpoints: [
                'GET /api/credentials/{enrollmentNumber}',
                'GET /api/credentials'
            ],
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    },
};