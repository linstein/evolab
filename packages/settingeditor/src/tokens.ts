// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IWidgetTracker, MainAreaWidget } from '@evolab/apputils';

import { Token } from '@lumino/coreutils';

import { SettingEditor } from './settingeditor';

/* tslint:disable */
/**
 * The setting editor tracker token.
 */
export const ISettingEditorTracker = new Token<ISettingEditorTracker>(
  '@evolab/settingeditor:ISettingEditorTracker'
);
/* tslint:enable */

/**
 * A class that tracks the setting editor.
 */
export interface ISettingEditorTracker
  extends IWidgetTracker<MainAreaWidget<SettingEditor>> {}
