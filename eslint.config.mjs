import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextVitals, ...nextTypescript];

eslintConfig.push({
  rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
});

export default eslintConfig;
