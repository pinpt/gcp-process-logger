#!/usr/bin/env node

const arg = require("arg");
const spawn = require("child_process").spawn;
const { Logging } = require("@google-cloud/logging");

// usage: process-logger [logname] --label x=b -- cmd [args]

const args = process.argv.slice(2);
const index = args.findIndex((arg) => arg === "--");
const opts = args.slice(0, index);
const cmd = args.slice(index + 1);

const _args = arg(
  {
    "--label": [String], // --label <string> or --label=<string>
    "--project-id": String,
    "--no-print-command": Boolean,
  },
  { argv: opts }
);
const _ = _args._;
if (_.length === 0) {
  console.error("missing log name argument");
  process.exit(1);
}

const labels = {};
(_args["--label"] || []).forEach((line) => {
  const tok = line.split("=");
  labels[tok[0].trim()] = (tok[1] || "").trim();
});

const logging = new Logging({ projectId: _args["--project-id"] || undefined });

const logger = logging.log(_[0]);

const info = {
  severity: "INFO",
  labels,
  resource: {
    type: "global",
  },
};

const error = {
  severity: "ERROR",
  labels,
  resource: {
    type: "global",
  },
};

let tasks = [];
const attachLogger = (metadata, stream) => {
  stream.on("data", async (buf) => {
    const str = buf.toString();
    const entries = [];
    str
      .trim()
      .split("\n")
      .forEach((line) => {
        const entry = logger.entry(metadata, line);
        entries.push(entry);
        process.stdout.write(line);
        process.stdout.write("\n");
      });
    const p = logger.write(entries);
    tasks.push(p);
    await p;
    tasks = tasks.filter((t) => t !== p);
  });
};

if (!_args["--no-print-command"]) {
  const msg = `→  \\033[0;32mRunning \\033[0;33m${cmd.join(" ")}\\033[0m\n`;
  const s = spawn("printf", [msg]);
  attachLogger(info, s.stdout);
}

const p = spawn(cmd[0], cmd.slice(1), {
  stdin: process.stdin,
  env: { ...process.env, CI: "1" },
});
p.on("exit", async (exitCode) => {
  await Promise.all(tasks);
  process.exit(exitCode);
});
attachLogger(info, p.stdout);
attachLogger(error, p.stderr);
