/*************************************************************
 *
 *  Copyright (c) 2017-2022 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * @fileoverview  Implements the CommonMsqrt wrapper for the MmlMsqrt object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CommonWrapper, CommonWrapperClass, CommonWrapperConstructor} from '../Wrapper.js';
import {CommonWrapperFactory} from '../WrapperFactory.js';
import {CharOptions, VariantData, DelimiterData, FontData, FontDataClass} from '../FontData.js';
import {CommonOutputJax} from '../../common.js';
import {CommonMo} from './mo.js';
import {MmlNode} from '../../../core/MmlTree/MmlNode.js';
import {BBox} from '../../../util/BBox.js';
import {DIRECTION} from '../FontData.js';

/*****************************************************************/
/**
 * The CommonMsqrt interface
 *
 * @template N   The DOM node type
 * @template T   The DOM text node type
 * @template D   The DOM document type
 * @template JX  The OutputJax type
 * @template WW  The Wrapper type
 * @template WF  The WrapperFactory type
 * @template WC  The WrapperClass type
 * @template CC  The CharOptions type
 * @template VV  The VariantData type
 * @template DD  The DelimiterData type
 * @template FD  The FontData type
 * @template FC  The FontDataClass type
 */
export interface CommonMsqrt<
  N, T, D,
  JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>,
  WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  CC extends CharOptions,
  VV extends VariantData<CC>,
  DD extends DelimiterData,
  FD extends FontData<CC, VV, DD>,
  FC extends FontDataClass<CC, VV, DD>
> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {

  /**
   * The index of the base of the root in childNodes
   */
  readonly base: number;

  /**
   * The index of the surd in childNodes
   */
  readonly surd: number;

  /**
   * The index of the root in childNodes (or null if none)
   */
  readonly root: number;

  /**
   * The requested height of the stretched surd character
   */
  surdH: number;

  /**
   * Combine the bounding box of the root (overridden in mroot)
   *
   * @param {BBox} bbox  The bounding box so far
   * @param {BBox} sbox  The bounding box of the surd
   * @param {number} H   The height of the root as a whole
   */
  combineRootBBox(bbox: BBox, sbox: BBox, H: number): void;

  /**
   * @param {BBox} sbox  The bounding box for the surd character
   * @return {number[]}  The p, q, and x values for the TeX layout computations
   */
  getPQ(sbox: BBox): number[];

  /**
   * @param {BBox} sbox  The bounding box of the surd
   * @param {number} H   The height of the root as a whole
   * @return {number[]}  The x offset of the surd, and the height, x offset, and scale of the root
   */
  getRootDimens(sbox: BBox, H: Number): number[];

}

/**
 * The CommonMsqrtClass interface
 *
 * @template N   The DOM node type
 * @template T   The DOM text node type
 * @template D   The DOM document type
 * @template JX  The OutputJax type
 * @template WW  The Wrapper type
 * @template WF  The WrapperFactory type
 * @template WC  The WrapperClass type
 * @template CC  The CharOptions type
 * @template VV  The VariantData type
 * @template DD  The DelimiterData type
 * @template FD  The FontData type
 * @template FC  The FontDataClass type
 */
export interface CommonMsqrtClass<
  N, T, D,
  JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>,
  WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  CC extends CharOptions,
  VV extends VariantData<CC>,
  DD extends DelimiterData,
  FD extends FontData<CC, VV, DD>,
  FC extends FontDataClass<CC, VV, DD>
> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {}

/*****************************************************************/
/**
 * The CommonMsqrt wrapper mixin for the MmlMsqrt object
 *
 * @template N   The DOM node type
 * @template T   The DOM text node type
 * @template D   The DOM document type
 * @template JX  The OutputJax type
 * @template WW  The Wrapper type
 * @template WF  The WrapperFactory type
 * @template WC  The WrapperClass type
 * @template CC  The CharOptions type
 * @template VV  The VariantData type
 * @template DD  The DelimiterData type
 * @template FD  The FontData type
 * @template FC  The FontDataClass type
 *
 * @template B   The mixin interface to create
 */
export function CommonMsqrtMixin<
  N, T, D,
  JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>,
  WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>,
  CC extends CharOptions,
  VV extends VariantData<CC>,
  DD extends DelimiterData,
  FD extends FontData<CC, VV, DD>,
  FC extends FontDataClass<CC, VV, DD>,
  B extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>
>(Base: CommonWrapperConstructor<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): B {

  return class CommonMsqrtMixin extends Base
  implements CommonMsqrt<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {

    /**
     * @override
     */
    get base(): number {
      return 0;
    }

    /**
     * @override
     */
    get surd(): number {
      return 1;
    }

    /**
     * @override
     */
    get root(): number {
      return null;
    }

    /**
     * @override
     */
    public surdH: number;

    /**
     * @override
     */
    public combineRootBBox(_bbox: BBox, _sbox: BBox, _H: number) {
    }

    /**
     * @override
     */
    public getPQ(sbox: BBox): [number, number] {
      const t = this.font.params.rule_thickness;
      const p = (this.node.attributes.get('displaystyle') ? this.font.params.x_height : t);
      const q = (sbox.h + sbox.d > this.surdH ?
                 ((sbox.h + sbox.d) - (this.surdH - 2 * t - p / 2)) / 2 :
                 t + p / 4);
      return [p, q];
    }

    /**
     * @override
     */
    public getRootDimens(_sbox: BBox, _H: number): [number, number, number, number] {
      return [0, 0, 0, 0];
    }

    /*************************************************************/

    /**
     * Add the surd character so we can display it later
     *
     * @override
     */
    constructor(factory: WF, node: MmlNode, parent: WW = null) {
      super(factory, node, parent);
      const surd = this.createMo('\u221A');
      surd.canStretch(DIRECTION.Vertical);
      const {h, d} = this.childNodes[this.base].getOuterBBox();
      const t = this.font.params.rule_thickness;
      const p = (this.node.attributes.get('displaystyle') ? this.font.params.x_height : t);
      this.surdH = h + d + 2 * t + p / 4;
      surd.getStretchedVariant([this.surdH - d, d], true);
    }

    /**
     * @override
     */
    public createMo(text: string): CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
      const node = super.createMo(text);
      this.childNodes.push(node as any as WW);
      return node;
    }

    /**
     * @override
     */
    public computeBBox(bbox: BBox, recompute: boolean = false) {
      const surdbox = this.childNodes[this.surd].getBBox();
      const basebox = new BBox(this.childNodes[this.base].getOuterBBox());
      const q = this.getPQ(surdbox)[1];
      const t = this.font.params.rule_thickness;
      const H = basebox.h + q + t;
      const [x] = this.getRootDimens(surdbox, H);
      bbox.h = H + t;
      this.combineRootBBox(bbox, surdbox, H);
      bbox.combine(surdbox, x, H - surdbox.h);
      bbox.combine(basebox, x + surdbox.w, 0);
      bbox.clean();
      this.setChildPWidths(recompute);
    }

  } as any as B;

}
