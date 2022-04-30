/* @ngInject */
export default class AppVersionService {
  constructor($resource) {
    const service = $resource('./app/app-version.json', {}, {
      query: {
        method: 'GET',
        isArray: false,
      },
    });
    return service;
  }
}
