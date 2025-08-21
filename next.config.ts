import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "better-sqlite3": false,
      mysql: false,
      mysql2: false,
      oracledb: false,
      "pg-query-stream": false,
      sqlite3: false,
      tedious: false,
    };
    return config;
  },
};

export default nextConfig;
