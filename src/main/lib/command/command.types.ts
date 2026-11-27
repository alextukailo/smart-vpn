export interface CommandOptions {
  timeout?: number;
  maxBuffer?: number;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export interface ICommandExecutor {
  execute(
    executable: string,
    args: string[],
    options?: CommandOptions,
  ): Promise<CommandResult>;
}
