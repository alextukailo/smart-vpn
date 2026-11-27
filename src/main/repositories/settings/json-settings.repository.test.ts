
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  rm,
} from 'node:fs/promises';

import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import {
  JsonSettingsRepository,
} from './json-settings.repository';

describe('JsonSettingsRepository', () => {
  let directory: string;
  let filePath: string;
  let repository: JsonSettingsRepository;

  beforeEach(async () => {
    directory = await mkdtemp(
      join(tmpdir(), 'smart-vpn-'),
    );

    filePath = join(
      directory,
      'settings.json',
    );

    repository = new JsonSettingsRepository(
      filePath,
    );
  });

  afterEach(async () => {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  });

  it('returns defaults when settings do not exist', async () => {
    await expect(
      repository.load(),
    ).resolves.toEqual(
      createDefaultSettings(),
    );
  });

  it('persists application settings', async () => {
    const settings = {
      ...createDefaultSettings(),
      primaryVpnId: 'test-vpn',
    };

    await repository.save(settings);

    const content = await readFile(
      filePath,
      'utf8',
    );

    expect(JSON.parse(content)).toEqual(settings);
  });

  it('loads previously persisted settings', async () => {
    const settings = {
      ...createDefaultSettings(),
      primaryVpnId: 'test-vpn',
    };

    await repository.save(settings);

    const newRepository =
      new JsonSettingsRepository(filePath);

    await expect(
      newRepository.load(),
    ).resolves.toEqual(settings);
  });

  it('replaces existing settings', async () => {
    await repository.save(
      createDefaultSettings(),
    );

    const updated = {
      ...createDefaultSettings(),
      primaryVpnId: 'another-vpn',
    };

    await repository.save(updated);

    await expect(
      repository.load(),
    ).resolves.toEqual(updated);
  });

  it('creates missing parent directories', async () => {
    const nestedRepository =
      new JsonSettingsRepository(
        join(
          directory,
          'nested',
          'settings.json',
        ),
      );

    const settings = createDefaultSettings();

    await nestedRepository.save(settings);

    await expect(
      nestedRepository.load(),
    ).resolves.toEqual(settings);
  });

  it('rejects corrupted JSON', async () => {
    await writeFile(
      filePath,
      '{invalid-json',
      'utf8',
    );

    await expect(
      repository.load(),
    ).rejects.toThrow(
      'Settings file contains invalid JSON',
    );
  });

  it('rejects unsupported settings format', async () => {
    await writeFile(
      filePath,
      JSON.stringify({
        version: 999,
      }),
      'utf8',
    );

    await expect(
      repository.load(),
    ).rejects.toThrow(
      'Settings file has an invalid or unsupported format',
    );
  });

  it('preserves corrupted settings for recovery', async () => {
    const content = '{invalid-json';

    await writeFile(
      filePath,
      content,
      'utf8',
    );

    await expect(
      repository.load(),
    ).rejects.toThrow();

    await expect(
      readFile(filePath, 'utf8'),
    ).resolves.toBe(content);
  });

  it('removes temporary files after saving', async () => {
    await repository.save(
      createDefaultSettings(),
    );

    await expect(
      readdir(directory),
    ).resolves.toEqual([
      'settings.json',
    ]);
  });
});
