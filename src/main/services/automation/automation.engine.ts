
import {
  type AppSettings,
  type AutomationState,
  type BrowserMonitoringState,
} from '../../../shared/types';

import { type SettingsService } from '../settings';
import { type VpnService } from '../vpn';

export class AutomationEngine {
  private state: AutomationState = {
    status: 'disabled',
    ownership: 'none',
    primaryVpnId: null,
    ownedVpnId: null,
    matchedDomainCount: 0,
    error: null,
    updatedAt: null,
  };

  private pendingEvaluation:
    Promise<AutomationState> | null = null;

  private suspendedVpnId: string | null = null;

  private generation = 0;

  constructor(
    private readonly settingsService: Pick<SettingsService, 'get'>,
    private readonly vpnService: Pick<VpnService, 'list' | 'connect' | 'getStatus'>,
  ) {}

  getState(): AutomationState {
    return structuredClone(this.state);
  }

  evaluate(
    monitoring: BrowserMonitoringState,
  ): Promise<AutomationState> {
    if (this.pendingEvaluation !== null) {
      return this.pendingEvaluation;
    }

    const generation = this.generation;

    this.pendingEvaluation = this.performEvaluation(
      structuredClone(monitoring),
      generation,
    ).finally(() => {
      this.pendingEvaluation = null;
    });

    return this.pendingEvaluation;
  }

  reset(): AutomationState {
    this.generation += 1;

    this.suspendedVpnId = null;

    this.state = {
      status: 'disabled',
      ownership: 'none',
      primaryVpnId: null,
      ownedVpnId: null,
      matchedDomainCount: 0,
      error: null,
      updatedAt: new Date().toISOString(),
    };

    return this.getState();
  }

  suspend(vpnId: string): AutomationState {
    this.generation += 1;

    this.suspendedVpnId = vpnId;

    this.updateState({
      status: 'suspended',
      ownership: 'none',
      ownedVpnId: null,
      error: null,
    });

    return this.getState();
  }

  private async performEvaluation(
    monitoring: BrowserMonitoringState,
    generation: number,
  ): Promise<AutomationState> {
    try {
      const settings = await this.settingsService.get();

      if (!this.isCurrentGeneration(generation)) {
        return this.getState();
      }

      const primaryVpnId = settings.primaryVpnId;

      if (this.state.primaryVpnId !== primaryVpnId) {
        this.releaseOwnership();

        this.suspendedVpnId = null;
      }

      this.updateState({
        primaryVpnId,
        error: null,
      });

      if (!settings.automation.enabled) {
        this.releaseOwnership();

        this.updateState({
          status: 'disabled',
          matchedDomainCount: 0,
        });

        return this.getState();
      }

      if (primaryVpnId === null) {
        this.releaseOwnership();

        this.updateState({
          status: 'waiting-for-vpn',
          matchedDomainCount: 0,
        });

        return this.getState();
      }

      if (
        monitoring.status !== 'running' ||
        monitoring.snapshot === null
      ) {
        this.updateState({
          status: 'suspended',
          matchedDomainCount: 0,
        });

        return this.getState();
      }

      const matchedDomainCount =
        monitoring.snapshot.matchedDomains.length;

      this.updateState({
        matchedDomainCount,
      });

      if (matchedDomainCount === 0) {
        this.suspendedVpnId = null;
      }

      const connections = await this.vpnService.list();

      if (!this.isCurrentGeneration(generation)) {
        return this.getState();
      }

      const primaryConnection = connections.find(
        (connection) => connection.id === primaryVpnId,
      );

      if (
        !primaryConnection ||
        !primaryConnection.enabled
      ) {
        this.releaseOwnership();

        this.updateState({
          status: 'waiting-for-vpn',
        });

        return this.getState();
      }

      const currentStatus = await this.vpnService.getStatus(
        primaryVpnId,
      );

      if (!this.isCurrentGeneration(generation)) {
        return this.getState();
      }

      if (currentStatus === 'connected') {
        const owned =
          this.state.ownedVpnId === primaryVpnId;

        this.updateState({
          status: 'connected',
          ownership: owned ? 'automation' : 'external',
        });

        return this.getState();
      }

      if (
        currentStatus === 'disconnected' &&
        this.state.ownedVpnId === primaryVpnId
      ) {
        this.releaseOwnership();

        if (matchedDomainCount > 0) {
          this.suspendedVpnId = primaryVpnId;
        }
      }

      if (matchedDomainCount === 0) {
        this.releaseOwnership();

        this.updateState({
          status: 'idle',
        });

        return this.getState();
      }

      if (this.suspendedVpnId === primaryVpnId) {
        this.updateState({
          status: 'suspended',
        });

        return this.getState();
      }

      if (currentStatus !== 'disconnected') {
        this.updateState({
          status: 'blocked',
          error: `Primary VPN status: ${currentStatus}`,
        });

        return this.getState();
      }

      this.releaseOwnership();

      const conflictingConnection = connections.find(
        (connection) =>
          connection.id !== primaryVpnId &&
          connection.status !== 'disconnected',
      );

      if (conflictingConnection) {
        this.updateState({
          status: 'blocked',
          error: `Another VPN is active or unavailable: ${conflictingConnection.name}`,
        });

        return this.getState();
      }

      const latestSettings = await this.settingsService.get();

      if (!this.isCurrentGeneration(generation)) {
        return this.getState();
      }

      if (!this.isConfigurationCurrent(settings, latestSettings)) {
        this.updateState({
          status: 'suspended',
        });

        return this.getState();
      }

      this.updateState({
        status: 'connecting',
      });

      const result = await this.vpnService.connect(
        primaryVpnId,
      );

      if (!this.isCurrentGeneration(generation)) {
        return this.getState();
      }

      if (result.status !== 'connected') {
        throw new Error('VPN connection was not confirmed');
      }

      this.updateState({
        status: 'connected',

        ownership: result.changed
          ? 'automation'
          : 'external',

        ownedVpnId: result.changed
          ? primaryVpnId
          : null,

        error: null,
      });
    } catch {
      if (this.isCurrentGeneration(generation)) {
        this.updateState({
          status: 'error',
          error: 'Automatic VPN activation failed.',
        });
      }
    }

    return this.getState();
  }

  private isConfigurationCurrent(
    previous: AppSettings,
    current: AppSettings,
  ): boolean {
    return (
      current.automation.enabled &&
      previous.primaryVpnId === current.primaryVpnId &&
      JSON.stringify(previous.domains) ===
        JSON.stringify(current.domains)
    );
  }

  private isCurrentGeneration(
    generation: number,
  ): boolean {
    return this.generation === generation;
  }

  private releaseOwnership(): void {
    this.updateState({
      ownership: 'none',
      ownedVpnId: null,
    });
  }

  private updateState(
    state: Partial<AutomationState>,
  ): void {
    this.state = {
      ...this.state,
      ...state,
      updatedAt: new Date().toISOString(),
    };
  }
}
