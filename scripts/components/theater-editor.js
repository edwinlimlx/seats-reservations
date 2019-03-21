import { fabric } from 'fabric';
import $ from 'jquery';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';
import { TweenMax } from 'gsap/TweenMax';

import * as fb from '../common/firebase';
import * as ENUMS from '../base/enum';
import * as utils from '../utils/utils';
import { DEFAULT_THEATER, DEFAULT_SEAT } from '../base/defaults';

// assets
import svgSeatPath from '../../assets/seat.svg';

const config = {
  isInit: false,
  id: 'modal--theater__canvas',
  grid: 50,
  canvasW: null,
  canvasH: 600,
};
const ASSETS = {
  seat: null,
};
const canvas = new fabric.Canvas(config.id);
let selectedUID = '';
let selectedTheater = null;

fabric.loadSVGFromURL(svgSeatPath, (objects) => {
  ASSETS.seat = new fabric.Group(objects);
  ASSETS.seat.scaleX = 0.1;
  ASSETS.seat.scaleY = 0.1;
});

const showDetails = (seatData) => {
  const template = _.template($('#template__theater-details').html());
  $('#modal--theater__seat-details').empty();
  $('#modal--theater__seat-details').html(template(seatData));

  TweenMax.fromTo($('#modal--theater__seat-details'), 0.3, { y: 32 }, { autoAlpha: 1, y: 0 });
};

const hideDetails = () => {
  TweenMax.to($('#modal--theater__seat-details'), 0.3, { autoAlpha: 0, y: 32 });
};

const addAssetSeat = (seatData) => {
  const x = seatData ? seatData.pos.x : config.canvasW * 0.5;
  const y = seatData ? seatData.pos.y : config.canvasH * 0.5;

  ASSETS.seat.clone((cloned) => {
    /* eslint-disable no-param-reassign */
    cloned.setPositionByOrigin(new fabric.Point(x, y));
    _.forEach(['tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb'], (corner) => {
      cloned.setControlVisible(corner, false);
    });
    cloned.angle = seatData ? seatData.angle : 0;
    cloned.on('moved', (e) => {
      // console.log('moved', e.target, e.target.getPointByOrigin());
      canvas.getActiveObject().data.pos = {
        x: e.target.getPointByOrigin().x,
        y: e.target.getPointByOrigin().y,
      };
    });
    cloned.on('rotated', (e) => {
      // console.log('rotated', e.target);
      canvas.getActiveObject().data.angle = e.target.angle;
    });
    cloned.data = {
      ...DEFAULT_SEAT,
      ...(seatData || {}),
      uid: seatData ? seatData.uid : uuidv1(),
    };
    canvas.add(cloned);
    /* eslint-enable no-param-reassign */
  });

  canvas.renderAll();
};

const addListeners = () => {
  config.isInit = true;
  $(document).on('click', '#modal--theater .btn-add', () => {
    addAssetSeat();
  });
  $(document).on('click', '#modal--theater .btn-remove', () => {
    console.log('btn-remove', canvas.getActiveObject());
    canvas.remove(canvas.getActiveObject());
  });
  $(document).on('click', '#modal--theater .btn-save', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const name = $('#modal--theater #name').val();
    const country = $('#modal--theater #country').val();
    const location = $('#modal--theater #location').val();
    if (_.isEmpty(name)) {
      // eslint-disable-next-line
      alert('Name cannot be empty');
      return false;
    }
    if (_.isEmpty(country)) {
      // eslint-disable-next-line
      alert('Country cannot be empty');
      return false;
    }
    if (_.isEmpty(location)) {
      // eslint-disable-next-line
      alert('Location cannot be empty');
      return false;
    }

    const hasSameName = _.filter(window.theaters, { name, location }).length;
    const theaterData = {
      ...DEFAULT_THEATER,
      uid: selectedUID || fb.getNewKey('/theaters'),
      country,
      location,
      name,
      seats: _.chain(canvas.getObjects())
        .filter(o => !_.isEmpty(o.data.pos))
        .map(o => o.data)
        .value(),
    };

    const countryName = Object.keys(ENUMS.ENUM_COUNTRIES)[country];
    const locationName = Object.keys(ENUMS[`ENUM_${countryName}_LOCATIONS`])[location];

    if (selectedTheater) {
      if (hasSameName >= 2) {
        // eslint-disable-next-line
        alert(`Duplicate name in ${locationName}/${countryName}`);
        return false;
      }
      fb.updateExisting(`/theaters/${selectedUID}`, theaterData);
      utils.upsert(window.theaters, { uid: selectedUID }, theaterData);
    } else {
      if (hasSameName >= 1) {
        // eslint-disable-next-line
        alert(`${locationName}/${countryName} already has a theater by the name of ${name}`);
        return false;
      }
      fb.pushNew('/theaters', theaterData);
      window.theaters.push(theaterData);
    }

    $('#modal--theater').modal('hide');
    return false;
  });
  canvas.on('selection:created', () => {
    console.log('selection:created', canvas.getActiveObject().data);
    showDetails(canvas.getActiveObject().data);
  });
  canvas.on('selection:updated', () => {
    console.log('selection:updated', canvas.getActiveObject().data);
    showDetails(canvas.getActiveObject().data);
  });
  canvas.on('selection:cleared', () => {
    console.log('selection:cleared');
    hideDetails();
  });

  $(document).on('change', '#modal--theater__details #country', (e) => {
    const val = $(e.target).val();
    $('#modal--theater__panel #location').html('<option value="0">NA</option>');
    const locations = ENUMS[`ENUM_${Object.keys(ENUMS.ENUM_COUNTRIES)[val]}_LOCATIONS`];
    if (!locations) {
      return;
    }

    _.forEach(Object.keys(locations), (key, index) => {
      if (!index) {
        return;
      }
      $('#modal--theater__panel #location').append(`<option value="${index}">${key}</option>`);
    });
  });

  $(document).on('change', '#modal--theater__seat-details input, #modal--theater__seat-details select', (e) => {
    const id = $(e.target).attr('id');
    const val = $(e.target).val();
    canvas.getActiveObject().data[id] = _.isNumber(Number(val)) ? Number(val) : val;
  });
  $(window).on('resize', () => {
    config.canvasW = $('#modal--theater  .flex-grow-1').width();
    canvas.setWidth(config.canvasW);
  });
};

export const show = (uid) => {
  selectedUID = uid;
  $('#modal--theater').modal('show');
};

export const init = () => {
  selectedTheater = _.find(window.theaters, { uid: selectedUID });
  if (selectedTheater) {
    $('#modal--theater__details #name').val(selectedTheater.name);
    $('#modal--theater__details #country').val(selectedTheater.country);
    setTimeout(() => {
      $('#modal--theater__details #country').trigger('change');
      $('#modal--theater__details #location').val(selectedTheater.location);
    }, 0);

    _.forEach(selectedTheater.seats, (seatData) => {
      addAssetSeat(seatData);
    });
  } else {
    $('#modal--theater__details #name').focus();
  }

  config.canvasW = $('#modal--theater .flex-grow-1').width();
  canvas.setWidth(config.canvasW);
  canvas.setHeight(config.canvasH);

  if (!config.isInit) {
    addListeners();
  }
};

$('#modal--theater').on('hidden.bs.modal', () => {
  $('#modal--theater__details #name').val('');
  $('#modal--theater__details #country').val(0);
  $('#modal--theater__details #location').val(0);
  hideDetails();
  canvas.clear();
});
$('#modal--theater').on('shown.bs.modal', () => {
  init();
});
