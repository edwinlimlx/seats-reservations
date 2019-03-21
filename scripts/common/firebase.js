import * as firebase from 'firebase/app';
import 'firebase/database';
import _ from 'lodash';
import { firebaseConfig } from '../base/configs';

firebase.initializeApp(firebaseConfig);

/* PUBLIC */
export const getNewKey = (refKey) => {
  if (_.isEmpty(refKey)) {
    throw new Error('refKey undefined');
  }
  return firebase
    .database()
    .ref(refKey)
    .push().key;
};

export const pushNew = (refKey, updates) => firebase
  .database()
  .ref(`${refKey}/${getNewKey(refKey)}`)
  .set(updates)
  .then((error) => {
    if (error) {
      // eslint-disable-next-line
        alert(error);
      throw new Error(error);
    }
  });

export const updateExisting = (refKey, updates) => {
  if (_.isEmpty(refKey)) {
    throw new Error('refKey undefined');
  }
  console.log('updateExisting', refKey, updates);
  return firebase
    .database()
    .ref(refKey)
    .set(updates)
    .then((error) => {
      if (error) {
        // eslint-disable-next-line
        alert(error);
        throw new Error(error);
      }
    });
};

export const ref = refKey => firebase
  .database()
  .ref(refKey)
  .once('value')
  .then(snapshot => snapshot.val());

export const refAsArray = refKey => firebase
  .database()
  .ref(refKey)
  .once('value')
  .then(snapshot => _.transform(
    snapshot.val(),
    (arr, o, k) => {
      // eslint-disable-next-line
          o.uid = k;
      arr.push(o);
      return arr;
    },
    [],
  ));

export const on = (refKey, event, cb) => {
  firebase
    .database()
    .ref(refKey)
    .on(event, cb);
};
