// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IWidgetTracker } from '@evolab/apputils';

import { Token } from '@lumino/coreutils';

import { ConsolePanel } from './panel';

/* tslint:disable */
/**
 * The console tracker token.
 */
export const IConsoleTracker = new Token<IConsoleTracker>(
  '@evolab/console:IConsoleTracker'
);
/* tslint:enable */

/**
 * A class that tracks console widgets.
 */
export interface IConsoleTracker extends IWidgetTracker<ConsolePanel> {}
