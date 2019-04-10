import { observable, computed } from 'mobx';

export default class DeviceSettingStore {
  @observable
  finished = false;

  @computed
  get buttonIsDisabled(): boolean {
    return false;
  }
}
