// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IWidgetTracker } from '@evolab/apputils';

import { IDocumentWidget } from '@evolab/docregistry';

import { Token } from '@lumino/coreutils';

import { ImageViewer } from './widget';

/**
 * A class that tracks image widgets.
 */
export interface IImageTracker
  extends IWidgetTracker<IDocumentWidget<ImageViewer>> {}

/* tslint:disable */
/**
 * The image tracker token.
 */
export const IImageTracker = new Token<IImageTracker>(
  '@evolab/imageviewer:IImageTracker'
);
/* tslint:enable */
