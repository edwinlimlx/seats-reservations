import _ from 'lodash';

export const test = () => {};

export const getUrlParams = (id) => {
  const o = _.chain(window.location.search)
    .replace('?', '')
    .split('&')
    .map(_.partial(_.split, _, '=', 2))
    .fromPairs()
    .value();
  return id ? o[id] : o;
};

export const upsert = (arr, key, newval) => {
  const match = _.find(arr, key);
  if (match) {
    const index = _.indexOf(arr, _.find(arr, key));
    arr.splice(index, 1, newval);
  } else {
    arr.push(newval);
  }
};
