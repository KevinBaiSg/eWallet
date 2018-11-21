import { observable, action } from 'mobx';

export default class AppState {
  @observable
  counter = 0;

  @action
  increment() {
    this.counter = this.counter + 1;
  }
}
