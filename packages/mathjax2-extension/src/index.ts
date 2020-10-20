/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { JupyterFrontEndPlugin } from '@evolab/application';

import { PageConfig } from '@evolab/coreutils';

import { ILatexTypesetter } from '@evolab/rendermime';

import { MathJaxTypesetter } from '@evolab/mathjax2';

/**
 * The MathJax latexTypesetter plugin.
 */
const plugin: JupyterFrontEndPlugin<ILatexTypesetter> = {
  id: '@evolab/mathjax2-extension:plugin',
  autoStart: true,
  provides: ILatexTypesetter,
  activate: () => {
    const url = PageConfig.getOption('fullMathjaxUrl');
    const config = PageConfig.getOption('mathjaxConfig');

    if (!url) {
      const message =
        `${plugin.id} uses 'mathJaxUrl' and 'mathjaxConfig' in PageConfig ` +
        `to operate but 'mathJaxUrl' was not found.`;

      throw new Error(message);
    }

    return new MathJaxTypesetter({ url, config });
  }
};

/**
 * Export the plugin as default.
 */
export default plugin;
