import { ENUM_SEATS_CATEGORIES, ENUM_SEATS_ZONES, ENUM_SEATS_STATUS } from './enum';

export const DEFAULT_SEAT = {
  uid: null,
  row: null,
  col: null,
  category: ENUM_SEATS_CATEGORIES.NA,
  zone: ENUM_SEATS_ZONES.NA,
  status: ENUM_SEATS_STATUS.NA,
  isHandicap: false,
  pos: {},
  angle: 0,
};

export const DEFAULT_THEATER = {
  uid: null,
  country: null,
  location: null,
  image: '',
  dateCreated: null,
  dateModified: null,
  name: '',
  seats: [],
};
