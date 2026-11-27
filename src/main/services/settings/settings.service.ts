
import { type AppSettings } from '../../../shared/types';

import {
  isValidSettings,
} from '../../../shared/lib/settings';

import {
  type ISettingsRepository,
} from '../../repositories/settings';

import { type VpnService } from '../vpn';

export class SettingsService {
  private settings: AppSettings | null = null;

  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly repository: ISettingsRepository,
    private readonly vpnService: Pick<VpnService, 'list'>,
  ) {}

  async get(): Promise<AppSettings> {
    return this.enqueue(async () => {
      const settings = await this.loadSettings();

      return structuredClone(settings);
    });
  }

  async setPrimaryVpn(
    id: string | null,
  ): Promise<AppSettings> {
    return this.enqueue(async () => {
      const current = await this.loadSettings();

      if (id !== null) {
        const connections = await this.vpnService.list();

        const connection = connections.find(
          (item) => item.id === id,
        );

        if (!connection) {
          throw new Error(
            'VPN connection not found',
          );
        }

        if (!connection.enabled) {
          throw new Error(
            'VPN connection is disabled',
          );
        }
      }

      const next: AppSettings = {
        ...current,

        primaryVpnId: id,

        automation: {
          ...current.automation,
          enabled:
            id !== null &&
            id === current.primaryVpnId &&
            current.automation.enabled,
        },
      };

      await this.persist(next);

      return structuredClone(next);
    });
  }

  private async loadSettings(): Promise<AppSettings> {
    if (this.settings === null) {
      this.settings = await this.repository.load();
    }

    return this.settings;
  }

  private async persist(
    settings: AppSettings,
  ): Promise<void> {
    if (!isValidSettings(settings)) {
      throw new Error('Invalid application settings');
    }

    await this.repository.save(settings);

    this.settings = settings;
  }

  private enqueue<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    const result = this.queue.then(operation);

    this.queue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }
}
