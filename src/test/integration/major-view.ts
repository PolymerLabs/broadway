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
import {dismissMessageBusClient} from '../../message-bus/client.js';
import {Subscription} from '../../subscription.js';

import {URL} from './controller.js';

export class MajorView {
  adapter: Adapter;
  controllerConnects: Promise<any>;
  minorViewIframes: HTMLIFrameElement[];

  constructor() {
    this.adapter = new Adapter(URL);
    this.controllerConnects = new Promise((resolve) => {
      this.adapter.subscribe(state => {
        resolve(state);
      });
    });
    this.minorViewIframes = [];
  }

  async addMinorView() {
    return await new Promise(resolve => {
      const subscription: Subscription = this.adapter.subscribe(state => {
        const count = state && state.minorViewCount ? state.minorViewCount : 0;
        if (count === targetCount) {
          resolve();
          subscription.unsubscribe();
        }
      });

      const iframe = document.createElement('iframe');
      iframe.src = './integration/frame.html';
      document.body.appendChild(iframe);
      this.minorViewIframes.push(iframe);
      const targetCount = this.minorViewIframes.length;
    });
  }

  async cleanup() {
    this.minorViewIframes.forEach(iframe => {
      iframe.src = 'about:blank';
      document.body.removeChild(iframe);
    });
    this.minorViewIframes = [];

    await dismissMessageBusClient(URL);
  }
}
