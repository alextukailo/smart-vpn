import { type AppSettings } from '../../../shared/types';

export interface ISettingsRepository {
  load(): Promise<AppSettings>;

  save(settings: AppSettings): Promise<void>;
}
