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

import {MajorView} from './integration/major-view.js';

const expect = chai.expect;

const STATE_PROPAGATION_WAIT_TIME: number = 100;

const timePasses = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

suite('Broadway Integration Tests', () => {
  let view: MajorView;

  setup(() => {
    history.pushState(null, document.title, '?__primary_frame__');
    view = new MajorView();
  });

  teardown(async () => {
    await view.cleanup();
  });

  test('basically ok', () => {
    expect(view).to.be.ok;
  });

  test('minor view connects to controller and modifies state', async () => {
    await view.addMinorView();
  });

  test('multiple major and minor views', async () => {
    await Promise.all([view.addMinorView(), view.addMinorView()]);
  });

  test('initial state for connected view is only offered once', async () => {
    await view.controllerConnects;
    await timePasses(STATE_PROPAGATION_WAIT_TIME);

    expect(view.stateNotificationCount).to.be.equal(1);
  });

  test(
      'first view receives only one initial state and one updated state',
      async () => {
        await view.controllerConnects;
        expect(view.stateNotificationCount).to.be.equal(1);
        await Promise.all([view.addMinorView()]);
        expect(view.stateNotificationCount).to.be.equal(2);
        await timePasses(STATE_PROPAGATION_WAIT_TIME);

        expect(view.stateNotificationCount).to.be.equal(2);
      });

  test('channel communication basically works', async () => {
    await view.receivedPong;
  });
});
