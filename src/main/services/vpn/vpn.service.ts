
import { setTimeout as delay } from 'node:timers/promises';

import {
  type VpnConnection,
  type VpnStatus,
  type VpnOperationResult,
} from '../../../shared/types';

import {
  type IVpnAdapter,
} from '../../adapters/vpn';

interface VpnServiceOptions {
  connectionTimeout: number;
  disconnectionTimeout: number;
  pollingInterval: number;
}

const DEFAULT_OPTIONS: VpnServiceOptions = {
  connectionTimeout: 30_000,
  disconnectionTimeout: 15_000,
  pollingInterval: 500,
};

export class VpnService {
  private readonly options: VpnServiceOptions;

  private operationInProgress = false;

  constructor(
    private readonly adapter: IVpnAdapter,
    options: Partial<VpnServiceOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  async list(): Promise<VpnConnection[]> {
    return this.adapter.list();
  }

  async getStatus(id: string): Promise<VpnStatus> {
    await this.getConnection(id);

    return this.adapter.getStatus(id);
  }

  async connect(id: string): Promise<VpnOperationResult> {
    return this.runOperation(async () => {
      const connections = await this.adapter.list();

      const connection = connections.find(
        (item) => item.id === id,
      );

      if (!connection) {
        throw new Error('VPN connection not found');
      }

      if (!connection.enabled) {
        throw new Error('VPN connection is disabled');
      }

      const status = await this.adapter.getStatus(id);

      if (status === 'connected') {
        return {
          id,
          status,
          changed: false,
        };
      }

      if (status !== 'disconnected') {
        throw new Error(
          `Cannot connect VPN with status: ${status}`,
        );
      }

      const conflictingConnection = connections.find(
        (item) =>
          item.id !== id &&
          item.status !== 'disconnected',
      );

      if (conflictingConnection) {
        throw new Error(
          `Another VPN is active or unavailable: ${conflictingConnection.name}`,
        );
      }

      await this.adapter.connect(id);

      await this.waitForStatus(
        id,
        'connected',
        this.options.connectionTimeout,
      );

      return {
        id,
        status: 'connected',
        changed: true,
      };
    });
  }

  async disconnect(id: string): Promise<VpnOperationResult> {
    return this.runOperation(async () => {
      await this.getConnection(id);

      const status = await this.adapter.getStatus(id);

      if (status === 'disconnected') {
        return {
          id,
          status,
          changed: false,
        };
      }

      if (
        status !== 'connected' &&
        status !== 'connecting'
      ) {
        throw new Error(
          `Cannot disconnect VPN with status: ${status}`,
        );
      }

      await this.adapter.disconnect(id);

      await this.waitForStatus(
        id,
        'disconnected',
        this.options.disconnectionTimeout,
      );

      return {
        id,
        status: 'disconnected',
        changed: true,
      };
    });
  }

  private async getConnection(
    id: string,
  ): Promise<VpnConnection> {
    const connections = await this.adapter.list();

    const connection = connections.find(
      (item) => item.id === id,
    );

    if (!connection) {
      throw new Error('VPN connection not found');
    }

    return connection;
  }

  private async waitForStatus(
    id: string,
    expectedStatus: VpnStatus,
    timeout: number,
  ): Promise<void> {
    const deadline = performance.now() + timeout;

    while (performance.now() < deadline) {
      const status = await this.adapter.getStatus(id);

      if (status === expectedStatus) {
        return;
      }

      const remainingTime = deadline - performance.now();

      if (remainingTime <= 0) {
        break;
      }

      await delay(
        Math.min(
          this.options.pollingInterval,
          remainingTime,
        ),
      );
    }

    throw new Error(
      `VPN operation timed out. Expected status: ${expectedStatus}`,
    );
  }

  private async runOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    if (this.operationInProgress) {
      throw new Error(
        'Another VPN operation is already in progress',
      );
    }

    this.operationInProgress = true;

    try {
      return await operation();
    } finally {
      this.operationInProgress = false;
    }
  }
}
