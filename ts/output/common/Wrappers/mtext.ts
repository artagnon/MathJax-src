/*************************************************************
 *
 *  Copyright (c) 2019-2022 The MathJax Consortium
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
 * @fileoverview  Implements the CommonMtext wrapper mixin for the MmlMtext object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CommonWrapper, CommonWrapperClass, CommonWrapperConstructor} from '../Wrapper.js';
import {CommonWrapperFactory} from '../WrapperFactory.js';
import {CharOptions, VariantData, DelimiterData, FontData, FontDataClass} from '../FontData.js';
import {CommonOutputJax} from '../../common.js';

/*****************************************************************/
/**
 * The CommonMtext interface
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
export interface CommonMtext<
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
> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {}

/**
 * The CommonMtextClass interface
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
export interface CommonMtextClass<
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
> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {

  /**
   * The font-family, weight, and style to use for the variants when mtextInheritFont
   * is true or mtextFont is specified.  If not in this list, then the font's
   * getCssFont() is called.  When the font family is not specified, the inherited
   * or specified font is used.
   */
  INHERITFONTS: {[name: string]: [string, boolean, boolean]};

}

/*****************************************************************/
/**
 *  The CommonMtext wrapper mixin for the MmlMtext object
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
export function CommonMtextMixin<
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

  return class CommonMtextMixin extends Base
  implements CommonMtext<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {

    /**
     * @override
     */
    public static INHERITFONTS: {[name: string]: [string, boolean, boolean]} = {
      normal: ['', false, false],
      bold: ['', false, true],
      italic: ['', true, false],
      'bold-italic': ['', true, true]
    };

    /**
     * @override
     */
    protected getVariant() {
      const options = this.jax.options;
      const data = this.jax.math.outputData;
      //
      //  If the font is to be inherited from the surrounding text, check the mathvariant
      //  and see if it allows for inheritance. If so, set the variant appropriately,
      //  otherwise get the usual variant.
      //
      const merror = ((!!data.merrorFamily || !!options.merrorFont) && this.node.Parent.isKind('merror'));
      if (!!data.mtextFamily || !!options.mtextFont || merror) {
        const variant = this.node.attributes.get('mathvariant') as string;
        const font = (this.constructor as any).INHERITFONTS[variant] || this.jax.font.getCssFont(variant);
        const family = font[0] || (merror ? data.merrorFamily || options.merrorFont :
                                            data.mtextFamily || options.mtextFont);
        this.variant = this.explicitVariant(family, font[2] ? 'bold' : '', font[1] ? 'italic' : '');
        return;
      }
      super.getVariant();
    }

  } as any as B;

}
