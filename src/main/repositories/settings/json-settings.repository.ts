
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  rm,
} from 'node:fs/promises';

import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

import { type AppSettings } from '../../../shared/types';

import {
  createDefaultSettings,
  isValidSettings,
} from '../../../shared/lib/settings';

import {
  type ISettingsRepository,
} from './settings-repository.interface';

const isFileNotFound = (
  error: unknown,
): boolean => {
  return (
    error instanceof Error &&
    'code' in error &&
    error.code === 'ENOENT'
  );
};

export class JsonSettingsRepository implements ISettingsRepository {
  constructor(
    private readonly filePath: string,
  ) {}

  async load(): Promise<AppSettings> {
    let content: string;

    try {
      content = await readFile(
        this.filePath,
        'utf8',
      );
    } catch (error) {
      if (isFileNotFound(error)) {
        return createDefaultSettings();
      }

      throw error;
    }

    let settings: unknown;

    try {
      settings = JSON.parse(content);
    } catch {
      throw new Error(
        'Settings file contains invalid JSON',
      );
    }

    if (!isValidSettings(settings)) {
      throw new Error(
        'Settings file has an invalid or unsupported format',
      );
    }

    return settings;
  }

  async save(settings: AppSettings): Promise<void> {
    if (!isValidSettings(settings)) {
      throw new Error('Invalid application settings');
    }

    const directory = dirname(this.filePath);

    await mkdir(directory, {
      recursive: true,
    });

    const temporaryPath =
      `${this.filePath}.${randomUUID()}.tmp`;

    const content = JSON.stringify(
      settings,
      null,
      2,
    );

    try {
      await writeFile(
        temporaryPath,
        content,
        {
          encoding: 'utf8',
          mode: 0o600,
          flag: 'wx',
        },
      );

      await rename(
        temporaryPath,
        this.filePath,
      );
    } finally {
      await rm(temporaryPath, {
        force: true,
      });
    }
  }
}
