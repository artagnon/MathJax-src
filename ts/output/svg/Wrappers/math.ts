/*************************************************************
 *
 *  Copyright (c) 2018-2022 The MathJax Consortium
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
 * @fileoverview  Implements the SvgMath wrapper for the MmlMath object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {SVG} from '../../svg.js';
import {SvgWrapper, SvgWrapperClass} from '../Wrapper.js';
import {SvgWrapperFactory} from '../WrapperFactory.js';
import {SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass} from '../FontData.js';
import {CommonMath, CommonMathClass, CommonMathMixin} from '../../common/Wrappers/math.js';
import {MmlNode} from '../../../core/MmlTree/MmlNode.js';
import {MmlMath} from '../../../core/MmlTree/MmlNodes/math.js';
import {StyleList} from '../../../util/StyleList.js';
import {BBox} from '../../../util/BBox.js';

/*****************************************************************/
/**
 * The Svgmath interface for the SVG math wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgMathNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMath<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {}

/**
 * The SvgmathClass interface for the SVG math wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgMathClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMathClass<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {
  new(factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMathNTD<N, T, D>;
}


/*****************************************************************/

/**
 * The SvgMath wrapper for the MmlMath class
 */
export const SvgMath = (function <N, T, D>(): SvgMathClass<N, T, D> {

  const Base = CommonMathMixin<
      N, T, D,
      SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
      SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass,
      SvgMathClass<N, T, D>
    >(SvgWrapper);

  // Avoid message about base constructors not having the same type
  //   (they should both be SvgWrapper<N, T, D>, but are thought of as different by typescript)
  // @ts-ignore
  return class SvgMath extends Base extends SvgMathNTD<N, T, D> {

    /**
     * @override
     */
    public static kind = MmlMath.prototype.kind;

    /**
     * @overreide
     */
    public static styles: StyleList = {
      'mjx-container[jax="SVG"][display="true"]': {
        display: 'block',
        'text-align': 'center',
        margin: '1em 0'
      },
      'mjx-container[jax="SVG"][display="true"][width="full"]': {
        display: 'flex'
      },
      'mjx-container[jax="SVG"][justify="left"]': {
        'text-align': 'left'
      },
      'mjx-container[jax="SVG"][justify="right"]': {
        'text-align': 'right'
      }
    };

    /************************************************************/

    /**
     * Set the justification, and get the minwidth and shift needed
     * for the displayed equation.
     */
    protected handleDisplay() {
      const [align, shift] = this.getAlignShift();
      if (align !== 'center') {
        this.adaptor.setAttribute(this.jax.container, 'justify', align);
      }
      if (this.bbox.pwidth === BBox.fullWidth) {
        this.adaptor.setAttribute(this.jax.container, 'width', 'full');
        if (this.jax.table) {
          let {L, w, R} = this.jax.table.getOuterBBox();
          if (align === 'right') {
            R = Math.max(R || -shift, -shift);
          } else if (align === 'left') {
            L = Math.max(L || shift, shift);
          } else if (align === 'center') {
            w += 2 * Math.abs(shift);
          }
          this.jax.minwidth = Math.max(0, L + w + R);
        }
      } else {
        this.jax.shift = shift;
      }
    }

    /**
     * Handle adding speech to the top-level node, if any.
     */
    protected handleSpeech() {
      const adaptor = this.adaptor;
      const attributes = this.node.attributes;
      const speech = (attributes.get('aria-label') || attributes.get('data-semantic-speech')) as string;
      if (speech) {
        const id = this.getTitleID();
        const label = this.svg('title', {id}, [this.text(speech)]);
        adaptor.insert(label, adaptor.firstChild(this.dom));
        adaptor.setAttribute(this.dom, 'aria-labeledby', id);
        adaptor.removeAttribute(this.dom, 'aria-label');
        for (const child of this.childNodes[0].childNodes) {
          adaptor.setAttribute(child.dom, 'aria-hidden', 'true');
        }
      }
    }

    /**
     * @return {string}  A unique ID to use for aria-labeledby title elements
     */
    protected getTitleID(): string {
      return 'mjx-svg-title-' + String(this.jax.options.titleID++);
    }

    /************************************************************/

    /**
     * @override
     */
    public toSVG(parent: N) {
      super.toSVG(parent);
      const adaptor = this.adaptor;
      const display = (this.node.attributes.get('display') === 'block');
      if (display) {
        adaptor.setAttribute(this.jax.container, 'display', 'true');
        this.handleDisplay();
      }
      if (this.jax.document.options.internalSpeechTitles) {
        this.handleSpeech();
      }
    }

    /**
     * @override
     */
    public setChildPWidths(recompute: boolean, w: number = null, _clear: boolean = true) {
      return super.setChildPWidths(recompute,
                                   this.parent ? w : this.metrics.containerWidth / this.jax.pxPerEm,
                                   false);
    }

  };

})<any, any, any>();
