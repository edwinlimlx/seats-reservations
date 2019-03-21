import 'bootstrap/dist/js/bootstrap.bundle';
import $ from 'jquery';
import _ from 'lodash';
import * as itemEditor from './scripts/components/theater-editor';
import * as fb from './scripts/common/firebase';

// styles
import './styles/index.scss';
import { DEFAULT_THEATER } from './scripts/base/defaults';
import { showPageLoader, hidePageLoader } from './scripts/base/common';

window.theaters = [];

const refreshTheaters = () => {
  showPageLoader();

  fb.refAsArray('/theaters').then((e) => {
    window.theaters = _.map(e, theater => ({ ...DEFAULT_THEATER, ...theater }));

    const template = _.template($('#template__card--theater').html());
    $('.theaters__cards').html(template({ classes: 'card--theater-add', uid: '' }));
    _.forEach(window.theaters, (item) => {
      $('.theaters__cards').append(template({ ...item, classes: '' }));
    });

    hidePageLoader();
  });
};

const addListeners = () => {
  $(document).on('click', '.card--theater', (e) => {
    itemEditor.show($(e.currentTarget).attr('data-uid') || null);
  });
  fb.on('/theaters', 'child_added', () => {
    refreshTheaters();
  });
  fb.on('/theaters', 'child_removed', () => {
    refreshTheaters();
  });
};

const init = async () => {
  addListeners();
  refreshTheaters();
};

init();
