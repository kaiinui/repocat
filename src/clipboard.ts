import { spawn } from "node:child_process";

export async function copyToPasteboard(text: string) {
  const proc = spawn("pbcopy")
  proc.stdin.write(text, "utf8")
  await new Promise(r => proc.stdin.end(r))
}
