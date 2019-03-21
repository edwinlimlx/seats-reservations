import $ from 'jquery';

export const showPageLoader = () => {
  $('.page-loader').addClass('show');
};

export const hidePageLoader = () => {
  $('.page-loader').removeClass('show');
};
