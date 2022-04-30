import angular from 'angular';
import ngRoute from 'angular-route';

import routing from './tag.routes';
import TagController from './tag-controller';
import CreateTagController from './create-tag-controller';
import DeleteTagController from './delete-tag-controller';
import tagListDirective from './tag-list-directive';

import services from '../services';

export default angular.module('app.features.tag', [ngRoute, tagListDirective, services])
  .config(routing)
  .controller('TagController', TagController)
  .controller('CreateTagController', CreateTagController)
  .controller('DeleteTagController', DeleteTagController)
  .name;
