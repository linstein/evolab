/* -----------------------------------------------------------------------------
| Copyright (c) 2014-2017, Jupyter Development Team.
|
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { PageConfig, URLExt } from '@evolab/coreutils';
// @ts-ignore
__webpack_public_path__ = URLExt.join(PageConfig.getBaseUrl(), 'example/');

// This has to be done after webpack public path is set to load the
// fonts.
import '../style/index.css';

import { OutputArea, OutputAreaModel } from '@evolab/outputarea';

import {
  RenderMimeRegistry,
  standardRendererFactories as initialFactories
} from '@evolab/rendermime';

import { KernelManager } from '@evolab/services';

async function main() {
  const code = [
    'from IPython.display import HTML',
    'HTML("<h1>Hello, world!</h1>")'
  ].join('\n');
  const model = new OutputAreaModel();
  const rendermime = new RenderMimeRegistry({ initialFactories });
  const outputArea = new OutputArea({ model, rendermime });

  const kernelManager = new KernelManager();
  const kernel = await kernelManager.startNew();
  outputArea.future = kernel.requestExecute({ code });
  document.getElementById('outputarea').appendChild(outputArea.node);
  await outputArea.future.done;
  console.debug('Test complete!');
}

window.onload = main;