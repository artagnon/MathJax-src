/*************************************************************
 *
 *  Copyright (c) 2017 The MathJax Consortium
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
 * @fileoverview  Implements the MmlMrow node
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {PropertyList} from '../Node.js';
import {MmlNode, AbstractMmlNode, TEXCLASS} from '../MmlNode.js';

/*****************************************************************/
/*
 *  Implements the MmlMrow node class (subclass of AbstractMmlNode)
 */

export class MmlMrow extends AbstractMmlNode {
    public static defaults: PropertyList = {
        ...AbstractMmlNode.defaults
    };

    /*
     * The index of the core child, when acting as an embellish mrow
     */
    protected _core: number = null;

    /*
     * @return {string}  The mrow kind
     */
    public get kind() {
        return 'mrow';
    }

    /*
     * An mrow is space-like if all its children are.
     *
     * @override
     */
    public get isSpacelike() {
        for (const child of this.childNodes) {
            if (!child.isSpacelike) {
                return false;
            }
        }
        return true;
    }

    /*
     * An mrow is embellished if it contains one embellished operator
     * and any number of space-like nodes
     *
     * @override
     */
    public get isEmbellished() {
        let embellished = false;
        let i = 0;
        for (const child of this.childNodes) {
            if (child) {
                if (child.isEmbellished) {
                    if (embellished) {
                        return false;
                    }
                    embellished = true;
                    this._core = i;
                } else if (!child.isSpacelike) {
                    return false;
                }
            }
        }
        return embellished;
    }

    /*
     * @override
     */
    public core(): MmlNode {
        if (!this.isEmbellished || this._core == null) {
            return this;
        }
        return this.childNodes[this._core];
    }

    /*
     * @override
     */
    public coreMO(): MmlNode {
        if (!this.isEmbellished || this._core == null) {
            return this;
        }
        return this.childNodes[this._core].coreMO();
    }

    /*
     * @return {number}  The number of non-spacelike child nodes
     */
    public nonSpaceLength() {
        let n = 0;
        for (const child of this.childNodes) {
            if (child && !child.isSpacelike) {
                n++;
            }
        }
        return n;
    }

    /*
     * @return {MmlNode}  The first non-space-like child node
     */
    public firstNonSpace() {
        for (const child of this.childNodes) {
            if (child && !child.isSpacelike) {
                return child;
            }
        }
        return null;
    }

    /*
     * @return {MmlNode}  The last non-space-like child node
     */
    public lastNonSpace() {
        let i = this.childNodes.length;
        while (--i >= 0) {
            let child = this.childNodes[i];
            if (child && !child.isSpacelike) {
                return child;
            }
        }
        return null;
    }

    /*
     * @override
     */
    public setTeXclass(prev: MmlNode) {
        if ((this.getProperty('open') != null || this.getProperty('close') != null) &&
            (!prev || prev.getProperty('fnOp') != null)) {
            //
            // <mrow> came from \left...\right
            //   so treat as subexpression (TeX class INNER).
            // Use prev = null for the initial element in the
            //   delimiters, since there is nothing previous to
            //   it in what would be the TeX math list.
            //
            this.getPrevClass(prev);
            prev = null;
            for (const child of this.childNodes) {
                prev = child.setTeXclass(prev);
            }
            if (this.texClass == null) {
                this.texClass = TEXCLASS.INNER;
            }
        } else {
            //
            //  Normal <mrow>, so treat as though mrow is not there
            //
            for (const child of this.childNodes) {
                prev = child.setTeXclass(prev);
            }
            if (this.childNodes[0]) {
                this.updateTeXclass(this.childNodes[0]);
            }
        }
        return prev;
    }
}


/*****************************************************************/
/*
 *  Implements the MmlInferredMrow node class (subclass of MmlMrow)
 */

export class MmlInferredMrow extends MmlMrow {
    public static defaults: PropertyList = MmlMrow.defaults;

    /*
     * @return {string}  The inferred-mrow kind
     */
    public get kind() {
        return 'inferredMrow';
    }

    /*
     * @return {boolean}  This is inferred
     */
    public get isInferred() {
        return true;
    }

    /*
     * @override
     */
    public get notParent() {
        return true;
    }

    /*
     * Show the child nodes in brackets
     */
    public toString() {
        return '[' + this.childNodes.join(',') + ']';
    }
}