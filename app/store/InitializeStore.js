import { observable, computed } from 'mobx';

export default class InitializeStore {
  @observable
  feeLevels = 'null';

  @computed
  get addressInputState(): string {
    return this.feeLevels;
  };
}
