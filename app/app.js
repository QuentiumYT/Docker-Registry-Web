import angular from 'angular';
import ngRoute from 'angular-route';
import ngFilter from 'angular-filter';
import ngSanitize from 'angular-sanitize';
import ngMoment from 'angular-moment';

import 'jquery';
import 'bootstrap/dist/js/bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

import routing from './app.config';

import services from './services';
import home from './home';
import image from './image';
import main from './main';
import repository from './repository';
import tag from './tag';

export default angular.module('docker-registry-frontend', [
  ngRoute,
  ngFilter,
  ngSanitize,
  ngMoment,

  services,
  home,
  image,
  main,
  repository,
  tag,
])
  .config(routing)
  .name;
