// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@evolab/application';

import { ILabIconManager } from '@evolab/ui-components';

/**
 * Placeholder for future extension that will provide an icon manager class
 * to assist with overriding/replacing particular sets of icons
 */
const labiconManager: JupyterFrontEndPlugin<ILabIconManager> = {
  id: '@evolab/ui-components-extension:labicon-manager',
  provides: ILabIconManager,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    return Object.create(null);
  }
};

export default labiconManager;
