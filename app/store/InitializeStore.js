import { observable, computed } from 'mobx';

export default class InitializeStore {
  @observable
  finished = false;

  @observable
  buttonRequest_ProtectCall = false;

  @observable
  buttonRequest_ConfirmWord = false;

  @computed
  get buttonRequest(): boolean {
    return this.buttonRequest_ProtectCall || this.buttonRequest_ConfirmWord;
  };
}
