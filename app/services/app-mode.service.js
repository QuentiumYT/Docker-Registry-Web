/* @ngInject */
export default class AppModeService {
  constructor($resource) {
    const service = $resource('./app/app-mode.json', {}, {
      query: {
        method: 'GET',
        isArray: false,
        cache: false,
      },
    });
    return service;
  }
}
