import { spawn, type SpawnOptions } from 'node:child_process';
import path from 'node:path';
import type { UnixProcessSpec } from './process-spec';

const ALLOWED_EXECUTABLES = new Set<string>(['/bin/echo']);

function validateExecutablePath(executable: string): string {
  const normalized = path.normalize(executable);

  if (!path.isAbsolute(normalized)) {
    throw new Error(`Unix process execution rejected: executable must be an absolute path (${executable})`);
  }

  if (!ALLOWED_EXECUTABLES.has(normalized)) {
    throw new Error(`Unix process execution rejected: executable is not allowlisted (${normalized})`);
  }

  return normalized;
}

export interface ProcessExecution {
  pid: number;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  duration: number;
}

export async function executeUnixProcess(
  spec: UnixProcessSpec,
): Promise<ProcessExecution> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let settled = false;

    const finish = (result: ProcessExecution) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const executable = validateExecutablePath(spec.executable);

    const proc = spawn(executable, spec.argv.slice(1), {
      cwd: spec.cwd,
      env: spec.environ,
      stdio: [
        spec.stdio.stdin === 'inherit' ? 'inherit' : 'pipe',
        spec.stdio.stdout === 'inherit' ? 'inherit' : 'pipe',
        spec.stdio.stderr === 'inherit' ? 'inherit' : 'pipe',
      ],
    } satisfies SpawnOptions);

    let stdout = '';
    let stderr = '';
    let timeoutHandle: NodeJS.Timeout | undefined;

    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(new Error(`Unix process execution failed: ${error.message}`));
      }
    });

    proc.on('exit', (code, signal) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);

      finish({
        pid: proc.pid ?? -1,
        exitCode: code,
        signal,
        stdout,
        stderr,
        duration: Date.now() - startTime,
      });
    });

    if (spec.resources.timeout !== undefined && spec.resources.timeout > 0) {
      timeoutHandle = setTimeout(() => {
        proc.kill('SIGTERM');
      }, spec.resources.timeout * 1000);
    }
  });
}
