import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: ["src/generated/**"] },
  ...nextVitals,
];

export default eslintConfig;
