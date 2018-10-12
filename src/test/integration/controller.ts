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
