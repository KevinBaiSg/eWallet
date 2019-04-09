import { observable, computed } from 'mobx';

export default class InitializeStore {
  @observable
  finished = false;

  @observable
  buttonRequest_ProtectCall = false;

  @observable
  buttonRequest_ConfirmWord = false;

  @observable
  wordInputIsDisable = true;

  @observable
  pin_request_callback = null;

  @observable
  _word = '';

  @observable
  tryAgain = false;

  @computed
  get buttonRequest(): boolean {
    return this.buttonRequest_ProtectCall || this.buttonRequest_ConfirmWord;
  };

  @computed
  get word(): string {
    return this.wordInputIsDisable ? 'processing...' : this._word;
  }

  @computed
  get buttonText(): string {
    return this.tryAgain ? 'Try Again' : 'Continue';
  }
}
