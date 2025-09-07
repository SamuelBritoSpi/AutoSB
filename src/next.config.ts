
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclui módulos problemáticos do pacote do cliente
    if (!isServer) {
      config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;
      config.resolve.alias['handlebars'] = false;
    }

    return config;
  },
};

export default nextConfig;
