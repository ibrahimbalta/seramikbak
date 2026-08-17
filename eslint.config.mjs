import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  {
    ignores: ["**/node_modules/**", ".next/**", "out/**", "build/**", "public/**", "scripts/**"]
  },
  ...nextVitals
]);

export default eslintConfig;
