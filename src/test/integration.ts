import {MajorView} from './integration/major-view.js';

const expect = chai.expect;

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
});
