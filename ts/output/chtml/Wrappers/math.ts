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
 * @fileoverview  Implements the ChtmlMath wrapper for the MmlMath object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CHTML} from '../../chtml.js';
import {ChtmlWrapper, ChtmlWrapperClass} from '../Wrapper.js';
import {ChtmlWrapperFactory} from '../WrapperFactory.js';
import {ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData,
        ChtmlFontData, ChtmlFontDataClass} from '../FontData.js';
import {CommonMath, CommonMathClass, CommonMathMixin} from '../../common/Wrappers/math.js';
import {MmlNode} from '../../../core/MmlTree/MmlNode.js';
import {MmlMath} from '../../../core/MmlTree/MmlNodes/math.js';
import {StyleList} from '../../../util/StyleList.js';
import {BBox} from '../../../util/BBox.js';

/*****************************************************************/
/**
 * The ChtmlMath interface for the CHTML Math wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface ChtmlMathNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonMath<
  N, T, D,
  CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>,
  ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass
> {}

/**
 * The ChtmlMathClass interface for the CHTML Math wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface ChtmlMathClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonMathClass<
  N, T, D,
  CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>,
  ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass
> {
  new(factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlMathNTD<N, T, D>;
}


/*****************************************************************/

/**
 * The ChtmlMath wrapper class for the MmlMath class
 */
export const ChtmlMath = (function <N, T, D>(): ChtmlMathClass<N, T, D> {

  const Base = CommonMathMixin<
      N, T, D,
      CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>,
      ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass,
      ChtmlMathClass<N, T, D>
    >(ChtmlWrapper);

  // Avoid message about base constructors not having the same type
  //   (they should both be ChtmlWrapper<N, T, D>, but are thought of as different by typescript)
  // @ts-ignore
  return class ChtmlMath extends Base implements ChtmlMathNTD<N, T, D> {

    /**
     * @override
     */
    public static kind = MmlMath.prototype.kind;

    /**
     * @override
     */
    public static styles: StyleList = {
      'mjx-math': {
        'line-height': 0,
        'text-align': 'left',
        'text-indent': 0,
        'font-style': 'normal',
        'font-weight': 'normal',
        'font-size': '100%',
        'font-size-adjust': 'none',
        'letter-spacing': 'normal',
        'word-wrap': 'normal',
        'word-spacing': 'normal',
        'white-space': 'nowrap',
        'direction': 'ltr',
        'padding': '1px 0'
      },
      'mjx-container[jax="CHTML"][display="true"]': {
        display: 'block',
        'text-align': 'center',
        margin: '1em 0'
      },
      'mjx-container[jax="CHTML"][display="true"][width="full"]': {
        display: 'flex'
      },
      'mjx-container[jax="CHTML"][display="true"] mjx-math': {
        padding: 0
      },
      'mjx-container[jax="CHTML"][justify="left"]': {
        'text-align': 'left'
      },
      'mjx-container[jax="CHTML"][justify="right"]': {
        'text-align': 'right'
      }
    };

    /**
     *  Handle displayed equations (set min-width, and so on).
     */
    protected handleDisplay(parent: N) {
      const adaptor = this.adaptor;
      const [align, shift] = this.getAlignShift();
      if (align !== 'center') {
        adaptor.setAttribute(parent, 'justify', align);
      }
      if (this.bbox.pwidth === BBox.fullWidth) {
        adaptor.setAttribute(parent, 'width', 'full');
        if (this.jax.table) {
          let {L, w, R} = this.jax.table.getOuterBBox();
          if (align === 'right') {
            R = Math.max(R || -shift, -shift);
          } else if (align === 'left') {
            L = Math.max(L || shift, shift);
          } else if (align === 'center') {
            w += 2 * Math.abs(shift);
          }
          const W = this.em(Math.max(0, L + w + R));
          adaptor.setStyle(parent, 'min-width', W);
          adaptor.setStyle(this.jax.table.dom, 'min-width', W);
        }
      } else {
        this.setIndent(this.dom, align, shift);
      }
    }

    /**
     * Handle in-line expressions
     */
    protected handleInline(parent: N) {
      //
      // Transfer right margin to container (for things like $x\hskip -2em y$)
      //
      const adaptor = this.adaptor;
      const margin = adaptor.getStyle(this.dom, 'margin-right');
      if (margin) {
        adaptor.setStyle(this.dom, 'margin-right', '');
        adaptor.setStyle(parent, 'margin-right', margin);
        adaptor.setStyle(parent, 'width', '0');
      }
    }

    /***********************************************************/

    /**
     * @override
     */
    public toCHTML(parent: N) {
      super.toCHTML(parent);
      const chtml = this.dom;
      const adaptor = this.adaptor;
      const display = (this.node.attributes.get('display') === 'block');
      if (display) {
        adaptor.setAttribute(chtml, 'display', 'true');
        adaptor.setAttribute(parent, 'display', 'true');
        this.handleDisplay(parent);
      } else {
        this.handleInline(parent);
      }
      adaptor.addClass(chtml, 'MJX-TEX');
    }

    /**
     * @override
     */
    public setChildPWidths(recompute: boolean, w: number = null, clear: boolean = true) {
      return (this.parent ? super.setChildPWidths(recompute, w, clear) : false);
    }

  };

})<any, any, any>();
