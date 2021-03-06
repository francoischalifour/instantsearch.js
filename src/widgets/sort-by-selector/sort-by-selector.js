import React, { render } from 'preact-compat';
import cx from 'classnames';

import Selector from '../../components/Selector.js';
import connectSortBySelector from '../../connectors/sort-by-selector/connectSortBySelector.js';
import { bemHelper, getContainerNode } from '../../lib/utils.js';

const bem = bemHelper('ais-sort-by-selector');

const renderer = ({ containerNode, cssClasses, autoHideContainer }) => (
  { currentRefinement, options, refine, hasNoResults },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  const shouldAutoHideContainer = autoHideContainer && hasNoResults;

  render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentRefinement}
      options={options}
      setValue={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
    />,
    containerNode
  );
};

const usage = `Usage:
sortBySelector({
  container,
  indices,
  [cssClasses.{root,select,item}={}],
  [autoHideContainer=false]
})`;

/**
 * @typedef {Object} SortByWidgetCssClasses
 * @property {string|string[]} [root] CSS classes added to the outer `<div>`.
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [item] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} SortByIndexDefinition
 * @property {string} name The name of the index in Algolia.
 * @property {string} label The name of the index, for user usage.
 */

/**
 * @typedef {Object} SortByWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {SortByIndexDefinition[]} indices Array of objects defining the different indices to choose from.
 * @property {boolean} [autoHideContainer=false] Hide the container when no results match.
 * @property {SortByWidgetCssClasses} [cssClasses] CSS classes to be added.
 */

/**
 * Sort by selector is a widget used for letting the user choose between different
 * indices that contains the same data with a different order / ranking formula.
 *
 * For the users it is like they are selecting a new sort order.
 * @type {WidgetFactory}
 * @category sort
 * @param {SortByWidgetOptions} $0 Options for the SortBySelector widget
 * @return {Widget} Creates a new instance of the SortBySelector widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.sortBySelector({
 *     container: '#sort-by-container',
 *     indices: [
 *       {name: 'instant_search', label: 'Most relevant'},
 *       {name: 'instant_search_price_asc', label: 'Lowest price'},
 *       {name: 'instant_search_price_desc', label: 'Highest price'}
 *     ]
 *   })
 * );
 */
export default function sortBySelector(
  {
    container,
    indices,
    cssClasses: userCssClasses = {},
    autoHideContainer = false,
  } = {}
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    // We use the same class to avoid regression on existing website. It needs to be replaced
    // eventually by `bem('select')
    select: cx(bem(null), userCssClasses.select),
    item: cx(bem('item'), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
  });

  try {
    const makeWidget = connectSortBySelector(specializedRenderer);
    return makeWidget({ indices });
  } catch (e) {
    throw new Error(usage);
  }
}
