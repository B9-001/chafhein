/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silences Turbopack's root-detection warning when a stray package-lock.json
  // exists in a parent directory outside this repo (e.g. a local dev machine
  // quirk) — pins the workspace root explicitly instead of guessing.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
