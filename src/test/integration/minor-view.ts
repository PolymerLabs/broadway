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
