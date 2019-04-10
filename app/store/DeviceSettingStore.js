import { observable, computed } from 'mobx';

export default class DeviceSettingStore {
  @observable
  finished = false;

  @observable
  label = '';

  @observable
  buttonRequest_ProtectCall = false;

  @observable
  isEdited = false;

  @computed
  get buttonIsDisabled(): boolean {
    return false;
  }
}
