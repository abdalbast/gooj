#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
LOG_DIR="$ROOT_DIR/.cursor/dev-logs/$STAMP"
CURSOR_LOG_ROOT="$HOME/Library/Application Support/Cursor/logs"
DIAGNOSTIC_ROOT="$HOME/Library/Logs/DiagnosticReports"

mkdir -p "$LOG_DIR/cursor-logs" "$LOG_DIR/diagnostic-reports"

latest_cursor_dir() {
  if [[ -d "$CURSOR_LOG_ROOT" ]]; then
    find "$CURSOR_LOG_ROOT" -mindepth 1 -maxdepth 1 -type d -print 2>/dev/null | sort | tail -n 1
  fi
}

LATEST_BEFORE="$(latest_cursor_dir || true)"

{
  echo "started_at_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "root_dir=$ROOT_DIR"
  echo "log_dir=$LOG_DIR"
  echo "node=$(node -v 2>/dev/null || echo unavailable)"
  echo "npm=$(npm -v 2>/dev/null || echo unavailable)"
  echo "latest_cursor_log_before=${LATEST_BEFORE:-none}"
} > "$LOG_DIR/metadata.txt"

cat > "$LOG_DIR/monitor.sh" <<'EOF'
#!/usr/bin/env bash

set -euo pipefail

LOG_DIR="$1"
DEV_PID="$2"
CURSOR_LOG_ROOT="$3"
DIAGNOSTIC_ROOT="$4"

latest_cursor_dir() {
  if [[ -d "$CURSOR_LOG_ROOT" ]]; then
    find "$CURSOR_LOG_ROOT" -mindepth 1 -maxdepth 1 -type d -print 2>/dev/null | sort | tail -n 1
  fi
}

while kill -0 "$DEV_PID" 2>/dev/null; do
  LATEST_CURSOR_DIR="$(latest_cursor_dir || true)"

  if [[ -n "${LATEST_CURSOR_DIR:-}" ]]; then
    {
      echo "snapshot_at_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
      echo "cursor_log_dir=$LATEST_CURSOR_DIR"
    } > "$LOG_DIR/cursor-logs/latest-dir.txt"

    while IFS= read -r file; do
      relative_path="${file#"$LATEST_CURSOR_DIR"/}"
      target_path="$LOG_DIR/cursor-logs/$relative_path"
      mkdir -p "$(dirname "$target_path")"
      tail -n 200 "$file" > "$target_path"
    done < <(find "$LATEST_CURSOR_DIR" -type f \( -name "*.log" -o -name "*.json" \) 2>/dev/null)
  fi

  if [[ -d "$DIAGNOSTIC_ROOT" ]]; then
    while IFS= read -r report; do
      cp -f "$report" "$LOG_DIR/diagnostic-reports/$(basename "$report")"
    done < <(find "$DIAGNOSTIC_ROOT" -maxdepth 1 -type f \( -name "Cursor*.crash" -o -name "Cursor*.ips" \) 2>/dev/null)
  fi

  sleep 5
done
EOF

chmod +x "$LOG_DIR/monitor.sh"

(
  DEV_PID="$(
    ROOT_DIR="$ROOT_DIR" LOG_DIR="$LOG_DIR" python3 - <<'PY'
import os
import subprocess

root_dir = os.environ["ROOT_DIR"]
log_dir = os.environ["LOG_DIR"]

with open(os.path.join(log_dir, "vite.stdout.log"), "ab", buffering=0) as stdout, open(
    os.path.join(log_dir, "vite.stderr.log"), "ab", buffering=0
) as stderr:
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=root_dir,
        stdin=subprocess.DEVNULL,
        stdout=stdout,
        stderr=stderr,
        start_new_session=True,
    )

print(process.pid)
PY
  )"
  echo "$DEV_PID" > "$LOG_DIR/dev.pid"

  MONITOR_PID="$(
    LOG_DIR="$LOG_DIR" DEV_PID="$DEV_PID" CURSOR_LOG_ROOT="$CURSOR_LOG_ROOT" DIAGNOSTIC_ROOT="$DIAGNOSTIC_ROOT" python3 - <<'PY'
import os
import subprocess

log_dir = os.environ["LOG_DIR"]
dev_pid = os.environ["DEV_PID"]
cursor_log_root = os.environ["CURSOR_LOG_ROOT"]
diagnostic_root = os.environ["DIAGNOSTIC_ROOT"]

with open(os.path.join(log_dir, "monitor.stdout.log"), "ab", buffering=0) as stdout, open(
    os.path.join(log_dir, "monitor.stderr.log"), "ab", buffering=0
) as stderr:
    process = subprocess.Popen(
        ["bash", os.path.join(log_dir, "monitor.sh"), log_dir, dev_pid, cursor_log_root, diagnostic_root],
        stdin=subprocess.DEVNULL,
        stdout=stdout,
        stderr=stderr,
        start_new_session=True,
    )

print(process.pid)
PY
  )"
  echo "$MONITOR_PID" > "$LOG_DIR/monitor.pid"

  {
    echo "dev_pid=$DEV_PID"
    echo "monitor_pid=$MONITOR_PID"
  } >> "$LOG_DIR/metadata.txt"
)

echo "$LOG_DIR"
