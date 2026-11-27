
import {
  type VpnConnection,
  type VpnStatus,
} from '../../../../shared/types';

import {
  type ICommandExecutor,
} from '../../../lib/command';

import {
  type IVpnAdapter,
} from '../vpn-adapter.interface';

import {
  isValidVpnId,
  parseVpnList,
  parseVpnStatus,
} from './scutil.parser';

const SCUTIL_PATH = '/usr/sbin/scutil';

export class MacOSVpnAdapter implements IVpnAdapter {
  constructor(
    private readonly executor: ICommandExecutor,
  ) {}

  async list(): Promise<VpnConnection[]> {
    const { stdout } = await this.executor.execute(
      SCUTIL_PATH,
      ['--nc', 'list'],
    );

    return parseVpnList(stdout);
  }

  async getStatus(id: string): Promise<VpnStatus> {
    this.validateId(id);

    const { stdout } = await this.executor.execute(
      SCUTIL_PATH,
      ['--nc', 'status', id],
    );

    return parseVpnStatus(stdout);
  }

  async connect(id: string): Promise<void> {
    this.validateId(id);

    await this.executor.execute(
      SCUTIL_PATH,
      ['--nc', 'start', id],
    );
  }

  async disconnect(id: string): Promise<void> {
    this.validateId(id);

    await this.executor.execute(
      SCUTIL_PATH,
      ['--nc', 'stop', id],
    );
  }

  private validateId(id: string): void {
    if (!isValidVpnId(id)) {
      throw new Error('Invalid VPN connection identifier');
    }
  }
}
