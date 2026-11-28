
import {
  type BrowserMonitoringState,
} from '../../../shared/types';

import {
  createDefaultSettings,
} from '../../../shared/lib/settings';

import { type BrowserService } from '../browser';
import { type SettingsService } from '../settings';

const DEFAULT_INTERVAL =
  createDefaultSettings().automation.pollingIntervalSeconds;

export class BrowserMonitoringService {
  private timer: ReturnType<typeof setTimeout> | null = null;

  private generation = 0;

  private inFlight = false;

  private active = false;

  private state: BrowserMonitoringState = {
    status: 'stopped',
    snapshot: null,
    error: null,
    pollingIntervalSeconds: DEFAULT_INTERVAL,
  };

  constructor(
    private readonly browserService: Pick<BrowserService, 'scan'>,
    private readonly settingsService: Pick<SettingsService, 'get'>,
  ) {}

  getState(): BrowserMonitoringState {
    return structuredClone(this.state);
  }

  start(): BrowserMonitoringState {
    if (this.active) {
      return this.getState();
    }

    this.active = true;
    this.generation += 1;

    this.state = {
      ...this.state,
      status: 'starting',
      snapshot: null,
      error: null,
    };

    if (!this.inFlight) {
      this.schedule(0);
    }

    return this.getState();
  }

  stop(): BrowserMonitoringState {
    this.active = false;
    this.generation += 1;

    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.state = {
      ...this.state,
      status: 'stopped',
      snapshot: null,
      error: null,
    };

    return this.getState();
  }

  private schedule(delayMs: number): void {
    if (!this.active || this.timer !== null) {
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = null;

      void this.tick();
    }, delayMs);
  }

  private async tick(): Promise<void> {
    if (!this.active || this.inFlight) {
      return;
    }

    const generation = this.generation;

    this.inFlight = true;

    try {
      const settings = await this.settingsService.get();

      if (!this.isCurrentGeneration(generation)) {
        return;
      }

      this.state = {
        ...this.state,
        pollingIntervalSeconds:
          settings.automation.pollingIntervalSeconds,
      };

      const snapshot = await this.browserService.scan();

      if (!this.isCurrentGeneration(generation)) {
        return;
      }

      this.state = {
        ...this.state,
        status: 'running',
        snapshot,
        error: null,
      };
    } catch {
      if (!this.isCurrentGeneration(generation)) {
        return;
      }

      this.state = {
        ...this.state,
        status: 'error',
        snapshot: null,
        error: 'Browser monitoring failed. Check Chrome and macOS Automation permissions.',
      };
    } finally {
      this.inFlight = false;

      if (this.active) {
        const delayMs = generation === this.generation
          ? this.state.pollingIntervalSeconds * 1_000
          : 0;

        this.schedule(delayMs);
      }
    }
  }

  private isCurrentGeneration(
    generation: number,
  ): boolean {
    return (
      this.active &&
      this.generation === generation
    );
  }
}
