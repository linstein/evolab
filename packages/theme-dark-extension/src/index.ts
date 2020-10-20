// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@evolab/application';

import { IThemeManager } from '@evolab/apputils';

/**
 * A plugin for the Jupyter Dark Theme.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@evolab/theme-dark-extension:plugin',
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    const style = '@evolab/theme-dark-extension/index.css';

    manager.register({
      name: 'JupyterLab Dark',
      isLight: false,
      themeScrollbars: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
