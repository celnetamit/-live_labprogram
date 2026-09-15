/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  async redirects() {
    return [
      // My Programs was removed: it only ever showed placeholder enrolments.
      // Old bookmarks land on the learner's labs instead of a 404.
      { source: "/dashboard/programs", destination: "/dashboard/labs", permanent: true },
    ];
  },
};

export default nextConfig;
