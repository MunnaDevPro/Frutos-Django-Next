/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 0,
            static: 30, // must be >= 30 in Next.js 16
        },
        // Network IP ebong domain gulo ekhane allow kore deya holo
        allowedDevOrigins: [
            '10.17.90.71',
            '10.17.90.71:3000',
            'localhost:3000',
            '127.0.0.1:3000'
        ],
    },

    images: {
        unoptimized: true,
        remotePatterns: [{
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
}

export default nextConfig