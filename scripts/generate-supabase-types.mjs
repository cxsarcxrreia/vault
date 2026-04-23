import { execSync } from "node:child_process";
import fs from "node:fs";

const command = "npx supabase gen types typescript --linked --schema public";
const output = execSync(command, {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
  shell: true
});

fs.writeFileSync("types/database.generated.ts", output, "utf8");
console.log("Generated types/database.generated.ts");
