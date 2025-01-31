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
 * @fileoverview  The generic visitor class for trees
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {Factory, FactoryNode, FactoryNodeClass} from './Factory.js';

/*****************************************************************/

/**
 * Visitor nodes can have childNodes that are traversed by the visitor
 *
 * @template N   The node type being traversed
 */
export interface VisitorNode<N extends VisitorNode<N>> extends FactoryNode {
  childNodes?: N[];
}

/**
 * The type for the functions associated with each node class
 *
 * @template N   The node type being traversed
 */
export type VisitorFunction<N extends VisitorNode<N>> =
  (visitor: Factory<N, FactoryNodeClass<N>>, node: N, ...args: any[]) => any;


/*****************************************************************/

/**
 * The Visitor interface
 *
 * @template N   The node type being traversed
 */
export interface Visitor<N extends VisitorNode<N>> {

  /**
   * Visit the tree rooted at the given node (passing along any needed parameters)
   *
   * @param {N} tree      The node that is the root of the tree
   * @param {any[]} args  The arguments to pass to the visitNode functions
   * @return {any}        Whatever the visitNode function returns for the root tree node
   */
  visitTree(tree: N, ...args: any[]): any;

  /**
   * Visit a node by calling the visitor function for the given type of node
   *  (passing along any needed parameters)
   *
   * @param {N} node      The node to visit
   * @param {any[]} args  The arguments to pass to the visitor function for this node
   * @return {any}        Whatever the visitor function returns for this node
   */
  visitNode(node: N, ...args: any[]): any;

  /**
   * The default visitor function for when no node-specific function is defined
   *
   * @param {N} node      The node to visit
   * @param {any[]} args  The arguments to pass to the visitor function for this node
   * @return {any}        Whatever the visitor function returns for this node
   */
  visitDefault(node: N, ...args: any[]): any;

  /**
   * Define a visitor function for a given node kind
   *
   * @param {string} kind              The node kind for which the handler is being defined
   * @param {VisitorFunction} handler  The function to call to handle nodes of this kind
   */
  setNodeHandler(kind: string, handler: VisitorFunction<N>): void;

  /**
   * Remove the visitor function for a given node kind
   *
   * @param {string} kind  The node kind whose visitor function is to be removed
   */
  removeNodeHandler(kind: string): void;

  /**
   * The various visitor functions implemented by the subclasses, and any data they need
   */
  [property: string]: any;
}


/*****************************************************************/
/**
 *  Implements the generic Visitor object
 *
 * @template N   The node type being traversed
 * @template C   The node class for N (the constructor rather than instance of the class)
 */
export abstract class AbstractVisitor<N extends VisitorNode<N>> implements Visitor<N> {
  /**
   * Holds the mapping from node kinds to visitor funcitons
   */
  protected nodeHandlers: Map<string, VisitorFunction<N>> = new Map();

  /**
   *  Visitor functions are named "visitKindNode" where "Kind" is replaced by
   *    the node kind; e.g., visitTextNode for kind = text.
   *
   *  @param {string} kind  The node kind whose method name is needed
   *  @return {string}  The name of the visitor method for the given node kind
   */
  protected static methodName(kind: string): string {
    return 'visit' + (kind.charAt(0).toUpperCase() + kind.substr(1)).replace(/[^a-z0-9_]/ig, '_') + 'Node';
  }

  /**
   * Create the node handler map by looking for methods with the correct names
   *   based on the node kinds available from the factory.
   *
   * @constructor
   * @param {NodeFactory} factory  The node factory for the kinds of nodes this visitor handles
   */
  constructor(factory: Factory<N, FactoryNodeClass<N>>) {
    for (const kind of factory.getKinds()) {
      let method = (this as Visitor<N>)[AbstractVisitor.methodName(kind)] as VisitorFunction<N>;
      if (method) {
        this.nodeHandlers.set(kind, method);
      }
    }
  }

  /**
   * @override
   */
  public visitTree(tree: N, ...args: any[]) {
    return this.visitNode(tree, ...args);
  }

  /**
   * @override
   */
  public visitNode(node: N, ...args: any[]) {
    let handler = this.nodeHandlers.get(node.kind) || this.visitDefault;
    return handler.call(this, node, ...args);
  }

  /**
   * @override
   */
  public visitDefault(node: N, ...args: any[]) {
    if ('childNodes' in node) {
      for (const child of node.childNodes) {
        this.visitNode(child, ...args);
      }
    }
  }

  /**
   * @override
   */
  public setNodeHandler(kind: string, handler: VisitorFunction<N>) {
    this.nodeHandlers.set(kind, handler);
  }

  /**
   * @override
   */
  public removeNodeHandler(kind: string) {
    this.nodeHandlers.delete(kind);
  }

}
