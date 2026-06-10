import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import console from "node:console";

const fallbackJavaHome = "/Applications/Android Studio.app/Contents/jbr/Contents/Home";
const javaHome =
  process.env.JAVA_HOME && existsSync(join(process.env.JAVA_HOME, "bin", "java"))
    ? process.env.JAVA_HOME
    : existsSync(join(fallbackJavaHome, "bin", "java"))
      ? fallbackJavaHome
      : undefined;

if (!javaHome) {
  console.error(
    "Firebase RTDB rules tests require Java. Set JAVA_HOME or install a JRE before running pnpm test:firebase-rules."
  );
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  PATH: `${join(javaHome, "bin")}${delimiter}${process.env.PATH ?? ""}`,
  FIREBASE_CLI_UPDATE_NOTIFIER: "false"
};

const child = spawn(
  "pnpm",
  [
    "exec",
    "firebase",
    "emulators:exec",
    "--only",
    "database",
    "--project",
    "jp2-rules-test",
    "pnpm exec vitest run tools/firebase/database.rules.test.ts"
  ],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Firebase RTDB rules tests terminated by ${signal}.`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
