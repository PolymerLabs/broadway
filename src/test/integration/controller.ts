/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {Action} from '../../action.js';
import {Controller} from '../../controller.js';
import {TestAction} from './test-action.js';

export const URL = '/test/build/controller.js';

const testReducer = (state: any, action: Action) => {
  switch (action.type) {
    case TestAction.INCREMENT:
      return {...state, value: state.value + 1};
    case TestAction.DECREMENT:
      return {...state, value: state.value - 1};
    case TestAction.MINOR_VIEW_CONNECTED:
      return {...state, minorViewCount: state.minorViewCount + 1};
  }

  return state;
};


class TestController extends Controller {
  static get initialState() {
    return {value: 0, minorViewCount: 0};
  }

  constructor() {
    super();

    // Subscribe to actions and pass through state management system
    this.subscribe(action => {
      this.updateState(testReducer(this.state, action));
    });

    // Set initial state
    this.updateState(TestController.initialState);
  }
}

(self as any).testController = new TestController();
