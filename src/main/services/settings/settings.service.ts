
import { randomUUID } from 'node:crypto';

import {
  type AppSettings,
  type CreateDomainRuleInput,
  type UpdateDomainRuleInput,
} from '../../../shared/types';

import { normalizeDomain } from '../../../shared/lib/domain';

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
          throw new Error('VPN connection not found');
        }

        if (!connection.enabled) {
          throw new Error('VPN connection is disabled');
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

  async addDomain(
    input: CreateDomainRuleInput,
  ): Promise<AppSettings> {
    return this.enqueue(async () => {
      const current = await this.loadSettings();

      const domain = this.getNormalizedDomain(
        input.domain,
      );

      this.ensureUniqueDomain(
        current,
        domain,
      );

      const next: AppSettings = {
        ...current,

        domains: [
          ...current.domains,
          {
            id: randomUUID(),
            domain,
            enabled: true,
            includeSubdomains: input.includeSubdomains,
          },
        ],
      };

      await this.persist(next);

      return structuredClone(next);
    });
  }

  async updateDomain(
    input: UpdateDomainRuleInput,
  ): Promise<AppSettings> {
    return this.enqueue(async () => {
      const current = await this.loadSettings();

      const existingRule = current.domains.find(
        (rule) => rule.id === input.id,
      );

      if (!existingRule) {
        throw new Error('Domain rule not found');
      }

      const domain = this.getNormalizedDomain(
        input.domain,
      );

      this.ensureUniqueDomain(
        current,
        domain,
        input.id,
      );

      const next: AppSettings = {
        ...current,

        domains: current.domains.map((rule) => (
          rule.id === input.id
            ? {
              ...rule,
              domain,
              enabled: input.enabled,
              includeSubdomains: input.includeSubdomains,
            }
            : rule
        )),
      };

      await this.persist(next);

      return structuredClone(next);
    });
  }

  async removeDomain(
    id: string,
  ): Promise<AppSettings> {
    return this.enqueue(async () => {
      const current = await this.loadSettings();

      const exists = current.domains.some(
        (rule) => rule.id === id,
      );

      if (!exists) {
        throw new Error('Domain rule not found');
      }

      const next: AppSettings = {
        ...current,

        domains: current.domains.filter(
          (rule) => rule.id !== id,
        ),
      };

      await this.persist(next);

      return structuredClone(next);
    });
  }

  private getNormalizedDomain(
    value: string,
  ): string {
    let domain: string | null | undefined;

    try {
      domain = normalizeDomain(value);
    } catch {
      throw new Error('Invalid domain or URL');
    }

    if (!domain) {
      throw new Error('Invalid domain or URL');
    }

    return domain;
  }

  private ensureUniqueDomain(
    settings: AppSettings,
    domain: string,
    excludedId?: string,
  ): void {
    const exists = settings.domains.some(
      (rule) =>
        rule.domain === domain &&
        rule.id !== excludedId,
    );

    if (exists) {
      throw new Error('This domain already exists');
    }
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
