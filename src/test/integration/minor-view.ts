import {Adapter} from '../../adapter.js';
import {URL} from './controller.js';
import {TestAction} from './test-action.js';

export class MinorView {
  adapter: Adapter;
  controllerConnects: Promise<any>;

  constructor() {
    this.adapter = new Adapter(URL);
    this.controllerConnects = new Promise((resolve) => {
      this.adapter.subscribe(state => {
        resolve(state);
      });
    });

    this.controllerConnects.then(() => {
      this.adapter.dispatch({type: TestAction.MINOR_VIEW_CONNECTED});
    });
  }
}
