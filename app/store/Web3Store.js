import { observable, computed } from 'mobx';

export default class SendStore {
  @observable
  feeLevels = null;

  @observable
  selectedFee = null;

  @observable
  address = '';

  @observable
  addressErrors = null;

  @observable
  addressWarnings = null;

  @observable
  addressInfos = null;

  // for amount
  @observable
  amount = '';

  @observable
  amountErrors = null;

  @observable
  amountWarnings = null;

  @observable
  amountInfos = null;

  @observable
  isSetMax = false;

  //
  @observable
  isSending = false;

  // for qr scan
  @observable
  isQrScanning = false;

  @observable
  network = null;

  @observable
  buttonRequest_ConfirmOutput = false;

  @observable
  buttonRequest_SignTx = false;

  @computed
  get addressInputState(): string {
    let state = '';
    if (this.address && !this.addressErrors) {
      state = 'success';
    }
    if (this.addressWarnings && !this.addressErrors) {
      state = 'warning';
    }
    if (this.addressErrors) {
      state = 'error';
    }
    return state;
  };

  @computed
  get amountInputState(): string {
    let state = '';
    if (this.amountWarnings && !this.amountErrors) {
      state = 'warning';
    }
    if (this.amountErrors) {
      state = 'error';
    }
    return state;
  };

  @computed
  get addressMessage(): string {
    return this.addressErrors || this.addressWarnings || this.addressInfos;
  }

  @computed
  get amountMessage(): string {
    return this.amountErrors || this.amountWarnings || this.amountInfos;
  }

  @computed
  get selectedFeeLevel() {
    if (this.feeLevels === null || this.feeLevels.length === 0) {
      return null;
    }

    if (this.selectedFee === null) {
      this.selectedFee = this.feeLevels[0];
    }

    return this.selectedFee;
  }
}
