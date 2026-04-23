import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(fullPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const env = { ...loadEnv(".env.local"), ...process.env };
const required = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

let missing = false;

for (const key of required) {
  const present = Boolean(env[key] && !env[key].startsWith("your-"));
  console.log(`${key}: ${present ? "present" : "missing"}`);
  missing = missing || !present;
}

if (missing) {
  process.exitCode = 1;
  throw new Error("Missing required Supabase environment variables.");
}

const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
console.log(`SUPABASE_HOST: ${url.host}`);
console.log(`SUPABASE_PROJECT_REF: ${url.host.split(".")[0]}`);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

const { data, error } = await supabase.from("project_templates").select("id,name").limit(1);

if (error) {
  console.log(`PROJECT_TEMPLATES_QUERY: failed code=${error.code ?? "none"} message=${error.message}`);
  process.exitCode = 2;
} else {
  console.log(`PROJECT_TEMPLATES_QUERY: ok rows=${data.length}`);
}
