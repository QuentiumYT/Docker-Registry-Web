import aboutTemplate from './about.html';
import errorTemplate from './404.html';

/* @ngInject */
export default ($locationProvider, $routeProvider, $resourceProvider) => {
  $locationProvider.html5Mode(true);

  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;

  $routeProvider
    .when('/about', {
      template: aboutTemplate,
    })
    .when('/404', {
      template: errorTemplate,
    })
    .otherwise({
      redirectTo: '/home',
    });
};
