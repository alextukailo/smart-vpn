
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  type ICommandExecutor,
  type CommandOptions,
  type CommandResult,
} from './command.types';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_MAX_BUFFER = 1024 * 1024;

export class CommandExecutor implements ICommandExecutor {
  async execute(
    executable: string,
    args: string[],
    options: CommandOptions = {},
  ): Promise<CommandResult> {
    const result = await execFileAsync(
      executable,
      args,
      {
        encoding: 'utf8',
        timeout: options.timeout ?? DEFAULT_TIMEOUT,
        maxBuffer: options.maxBuffer ?? DEFAULT_MAX_BUFFER,
        windowsHide: true,
        shell: false,
      },
    );

    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    };
  }
}
