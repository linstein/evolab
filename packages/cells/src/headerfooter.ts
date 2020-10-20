/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { Widget } from '@lumino/widgets';

/**
 * The CSS class added to the cell header.
 */
const CELL_HEADER_CLASS = 'jp-CellHeader';

/**
 * The CSS class added to the cell footer.
 */
const CELL_FOOTER_CLASS = 'jp-CellFooter';

/**
 * The interface for a cell header.
 */
export interface ICellHeader extends Widget {}

/**
 * Default implementation of a cell header.
 */
//实现cell的header部分
export class CellHeader extends Widget implements ICellHeader {
  /**
   * Construct a new cell header.
   */
  constructor() {
    super();
    this.addClass(CELL_HEADER_CLASS);
    var a=document.createElement("text");
    var img=document.createElement("img");
    img.src="";
    Object.assign(this.node.style, {height:"20px",'display':"none"});
    Object.assign(a.style, {float:"right"});
    Object.assign(img.style, {float:"right", "border-radius":"70%", "height": "20px", "overflow":"hidden"});
    a.innerText="";
    this.node.appendChild(img);
    this.node.appendChild(a);
  }
}

/**
 * The interface for a cell footer.
 */
//实现cell的footer部分
export interface ICellFooter extends Widget {}

/**
 * Default implementation of a cell footer.
 */
export class CellFooter extends Widget implements ICellFooter {
  /**
   * Construct a new cell footer.
   */
  constructor() {
    super();
    this.addClass(CELL_FOOTER_CLASS);
  }
}
