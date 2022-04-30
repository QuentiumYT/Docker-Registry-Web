import home from '.';

describe('HomeController', () => {
  beforeEach(angular.mock.module(home));

  let $httpBackend;
  let $route;
  let $location;
  let $rootScope;
  let controller;

  beforeEach(inject(($controller, _$httpBackend_, _$route_, _$location_, _$rootScope_) => {
    controller = $controller('HomeController');
    $httpBackend = _$httpBackend_;
    $route = _$route_;
    $location = _$location_;
    $rootScope = _$rootScope_;
  }));

  it('should attach an appMode to the scope', () => {
    const expectedAppMode = {
      browseOnly: true,
      repoDelete: false,
      defaultRepositoriesPerPage: 10,
      defaultTagsPerPage: 5,
    };

    $httpBackend.expectGET('./app/app-mode.json').respond(expectedAppMode);
    $httpBackend.flush();
    jasmine.addCustomEqualityTester(angular.equals);

    expect(controller.appMode).toEqual(expectedAppMode);
  });

  it('should register the controller as home', () => {
    $httpBackend.expectGET('./app/app-mode.json').respond({});
    $location.path('/home');
    $rootScope.$digest();

    expect($route.current.controller).toBe('HomeController as home');
  });
});
