import { observable, computed } from 'mobx';

export default class DeviceSettingStore {
  @observable
  finished = false;

  @observable
  label = '';

  @observable
  buttonRequest_ProtectCall = false;

  @observable
  buttonRequest_WipeDevice = false;

  @observable
  reconnectRequest_WipeDevice = false;

  @observable
  PinMatrixRequestType_Current = false;

  @observable
  PinMatrixRequestType_NewFirst = false;

  @observable
  PinMatrixRequestType_NewSecond = false;

  @observable
  isEdited = false;

  @computed
  get buttonRequest(): boolean {
    return this.buttonRequest_ProtectCall || this.buttonRequest_WipeDevice;
  }

  @computed
  get buttonIsDisabled(): boolean {
    return false;
  }
}
