import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "public/**"]
  },
  ...nextVitals
]);

export default eslintConfig;
