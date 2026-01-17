import doneAction from './done';
import planAction from './plan';
import ActionRegistry from './registry';
import uploadsSearchAction from './uploadsSearch';
import shoppingSearchAction from './shoppingSearch';

ActionRegistry.register(doneAction);
ActionRegistry.register(planAction);
ActionRegistry.register(uploadsSearchAction);
ActionRegistry.register(shoppingSearchAction);

export { ActionRegistry };
