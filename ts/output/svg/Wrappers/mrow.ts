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
 * @fileoverview  Implements the SvgMrow wrapper for the MmlMrow object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {SVG} from '../../svg.js';
import {SvgWrapper, SvgWrapperClass} from '../Wrapper.js';
import {SvgWrapperFactory} from '../WrapperFactory.js';
import {SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass} from '../FontData.js';
import {CommonMrow, CommonMrowClass, CommonMrowMixin,
        CommonInferredMrow, CommonInferredMrowClass, CommonInferredMrowMixin} from '../../common/Wrappers/mrow.js';
import {MmlMrow, MmlInferredMrow} from '../../../core/MmlTree/MmlNodes/mrow.js';
import {MmlNode} from '../../../core/MmlTree/MmlNode.js';

/*****************************************************************/
/**
 * The SvgMrow interface for the SVG Mrow wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgMrowNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonMrow<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {}

/**
 * The SvgMrowClass interface for the SVG Mrow wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgMrowClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonMrowClass<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {
  new(factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgMrowNTD<N, T, D>;
}


/*****************************************************************/

/**
 * The SvgMrow wrapper for the MmlMrow type
 */
export const SvgMrow = (function <N, T, D>(): SvgMrowClass<N, T, D> {

  const Base = CommonMrowMixin<
      N, T, D,
      SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
      SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass,
      SvgMrowClass<N, T, D>
    >(SvgWrapper);

  // Avoid message about base constructors not having the same type
  //   (they should both be SvgWrapper<N, T, D>, but are thought of as different by typescript)
  // @ts-ignore
  return class SvgMrow extends Base implements SvgMrowNTD<N, T, D> {

    /**
     * @override
     */
    public static kind = MmlMrow.prototype.kind;

    /**
     * @override
     */
    public toSVG(parent: N) {
      const svg = (this.node.isInferred ? (this.dom = parent) : this.standardSvgNode(parent));
      this.addChildren(svg);
      // FIXME:  handle line breaks
    }

  };

})<any, any, any>();

/*****************************************************************/
/*****************************************************************/

/**
 * The SvgInferredMrow interface for the SVG InferredMrow wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgInferredMrowNTD<N, T, D> extends SvgMrowNTD<N, T, D>, CommonInferredMrow<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {}

/**
 * The SvgInferredMrowClass interface for the SVG InferredMrow wrapper
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export interface SvgInferredMrowClass<N, T, D> extends SvgMrowClass<N, T, D>, CommonInferredMrowClass<
  N, T, D,
  SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
  SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass
> {
  new(factory: SvgWrapper<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgInferredMrowNTD<N, T, D>;
}


/*****************************************************************/

/**
 * The SvgInferredMrow wrapper for the MmlInferredMrow class
 */
export const SvgInferredMrow = (function <N, T, D>(): SvgInferredMrowClass<N, T, D> {

  const Base = CommonInferredMrowMixin<
      N, T, D,
      SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>,
      SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass,
      SvgInferredMrowClass<N, T, D>
    >(SvgMrow);

  // Avoid message about base constructors not having the same type
  //   (they should both be SvgWrapper<N, T, D>, but are thought of as different by typescript)
  // @ts-ignore
  return class SvgInferredMrowNTD extends Base implements SvgInferredMrow<N, T, D> {

    /**
     * The inferred-mrow wrapper
     */
    public static kind = MmlInferredMrow.prototype.kind;

  };

})<any, any, any>();
