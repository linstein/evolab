import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@evolab/application';

import { INotebookTools, INotebookTracker } from '@evolab/notebook';

import { TagTool } from '@evolab/celltags';

/**
 * Initialization data for the celltags extension.
 */
const celltags: JupyterFrontEndPlugin<void> = {
  id: 'celltags',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    tools: INotebookTools,
    tracker: INotebookTracker
  ) => {
    const tool = new TagTool(tracker, app);
    tools.addItem({ tool: tool, rank: 1.6 });
  }
};

export default celltags;
