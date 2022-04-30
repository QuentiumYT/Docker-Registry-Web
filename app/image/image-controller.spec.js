import image from '.';

describe('ImageController', () => {
  beforeEach(angular.mock.module(image));

  let $route;
  let $location;
  let $rootScope;

  beforeEach(inject((_$route_, _$location_, _$rootScope_) => {
    $route = _$route_;
    $location = _$location_;
    $rootScope = _$rootScope_;
  }));

  it('should register the controller as image', () => {
    $location.path('/image/88e37c7099fa');
    $rootScope.$digest();

    expect($route.current.controller).toBe('ImageController as image');
  });
});
