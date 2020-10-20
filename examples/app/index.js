// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig } from '@evolab/coreutils';
// eslint-disable-next-line
__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';

// This must be after the public path is set.
// This cannot be extracted because the public path is dynamic.
require('./build/imports.css');

window.addEventListener('load', async function() {
  const JupyterLab = require('@evolab/application').JupyterLab;

  const mods = [
    require('@evolab/application-extension'),
    require('@evolab/apputils-extension'),
    require('@evolab/codemirror-extension'),
    require('@evolab/completer-extension'),
    require('@evolab/console-extension'),
    require('@evolab/csvviewer-extension'),
    require('@evolab/docmanager-extension'),
    require('@evolab/fileeditor-extension'),
    require('@evolab/filebrowser-extension'),
    require('@evolab/help-extension'),
    require('@evolab/imageviewer-extension'),
    require('@evolab/inspector-extension'),
    require('@evolab/launcher-extension'),
    require('@evolab/mainmenu-extension'),
    require('@evolab/markdownviewer-extension'),
    require('@evolab/mathjax2-extension'),
    require('@evolab/notebook-extension'),
    require('@evolab/rendermime-extension'),
    require('@evolab/running-extension'),
    require('@evolab/settingeditor-extension'),
    require('@evolab/shortcuts-extension'),
    require('@evolab/statusbar-extension'),
    require('@evolab/tabmanager-extension'),
    require('@evolab/terminal-extension'),
    require('@evolab/theme-dark-extension'),
    require('@evolab/theme-light-extension'),
    require('@evolab/tooltip-extension'),
    require('@evolab/ui-components-extension')
  ];
  const lab = new JupyterLab();
  lab.registerPluginModules(mods);
  /* eslint-disable no-console */
  console.log('Starting app');
  await lab.start();
  console.log('App started, waiting for restore');
  await lab.restored;
  console.log('Example started!');
});
