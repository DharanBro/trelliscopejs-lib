import { createSelector } from 'reselect';
import { cogDataSelector, filterStateSelector, filterViewSelector,
  displayInfoSelector, pageNumSelector, nPerPageSelector } from '.';

export const cogFiltDistSelector = createSelector(
  cogDataSelector, filterStateSelector,
  filterViewSelector, displayInfoSelector,
  (cogData, filter, filterView, di) => {
    const result = {};
    if (cogData.iface && cogData.crossfilter && cogData.iface.type === 'JSON') {
      // for every active filter, calculate the conditional distribution
      const keys = filterView.active;
      for (let i = 0; i < keys.length; i++) {
        if (di.info.cogInfo[keys[i]].type === 'factor') {
          const orderValue = filter[keys[i]] && filter[keys[i]].orderValue ?
            filter[keys[i]].orderValue : 'ct,desc';

          let dist = [];
          // if sort order is count, use .top to get sorted
          // if it is by id (label), use .all to get that order
          if (cogData.groupRefs[keys[i]]) {
            if (orderValue.substr(0, 2) === 'ct') {
              // cogData.groupRefs[keys[i]].order(d => -d);
              dist = cogData.groupRefs[keys[i]].top(Infinity);
            } else {
              dist = cogData.groupRefs[keys[i]].all();
            }
          }

          // crossfilter groups return descending by count
          // but ascending by label
          // so we need to let the barchart know whether to invert
          // we could use Array.reverse but that could be slow
          const reverseRows = ['ct,asc', 'id,desc'].indexOf(orderValue) < 0;

          let maxVal = 0;
          for (let j = 0; j < dist.length; j++) {
            if (dist[j].value > maxVal) {
              maxVal = dist[j].value;
            }
          }

          // build an index of selected and not selected
          // would it be more efficient as a crossfilter group reducer?
          const selectedIdx = [];
          const notSelectedIdx = [];
          const filterVals = filter[keys[i]] && filter[keys[i]].value ?
            filter[keys[i]].value : [];
          let sumSelected = 0;
          for (let j = 0; j < dist.length; j++) {
            const val = filterVals.indexOf(dist[j].key);
            if (val < 0) {
              notSelectedIdx.push(j);
            } else {
              selectedIdx.push(j);
              sumSelected += dist[j].value;
            }
          }

          result[keys[i]] = {
            dist,
            max: maxVal,
            orderValue,
            reverseRows,
            totSelected: selectedIdx.length,
            sumSelected,
            idx: selectedIdx.concat(notSelectedIdx)
          };
        }
      }
    }
    return result;
  }
);

export const currentCogDataSelector = createSelector(
  cogDataSelector, pageNumSelector, nPerPageSelector,
  (cd, pnum, npp) => {
    let result = [];
    if (cd.dimensionRefs && cd.dimensionRefs.__sort) {
      result = cd.dimensionRefs.__sort.bottom(npp);
    }
    return result;
  }
);

export const filterCardinalitySelector = createSelector(
  cogDataSelector, filterStateSelector,
  (cd, filt) => (cd.allRef === undefined && filt ? 0 : cd.allRef.value())
);