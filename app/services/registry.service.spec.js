import services from '.';

describe('registry.service', () => {
  let mockRepository;
  let $httpBackend;
  beforeEach(angular.mock.module(services));

  describe('GET catalog', () => {
    beforeEach(() => {
      angular.mock.inject(($injector) => {
        $httpBackend = $injector.get('$httpBackend');
        mockRepository = $injector.get('Repository');
      });
    });

    describe('when no last given', () => {
      it('should return repositories', inject(() => {
        $httpBackend.expectGET('/v2/_catalog?n=10&last=')
          .respond(200, {
            repositories: ['nginx'],
          });

        const result = mockRepository.query({
          n: 10,
        });
        $httpBackend.flush();

        expect(result).hasOwnProperty.call('repos');
        expect(result.repos.length).toEqual(1);
        expect(result.repos[0]).toEqual({
          username: 'nginx',
          name: 'nginx',
          selected: false,
        });
        expect(result.lastRepository).toBeUndefined();
      }));
    });

    describe('when last given', () => {
      it('should use last in query pram', inject(() => {
        $httpBackend.expectGET('/v2/_catalog?n=10&last=nginx')
          .respond({
            repositories: ['redis'],
          });

        const result = mockRepository.query({
          n: 10,
          last: 'nginx',
        });

        $httpBackend.flush();

        expect(result).hasOwnProperty.call('repos');
        expect(result.repos.length).toEqual(1);
        expect(result.repos[0]).toEqual({
          username: 'redis',
          name: 'redis',
          selected: false,
        });
        expect(result.lastRepository).toBeUndefined();
      }));
    });

    describe('when only the first page is fetched', () => {
      describe('and last parameter has namespace and repo name', () => {
        it('should return last properties', inject(() => {
          $httpBackend.expectGET('/v2/_catalog?n=10&last=')
            .respond({
              repositories: ['redis'],
            }, {
              link: '</v2/_catalog?last=namespace%2Frepository&n=10>; rel="next"',
            });

          const result = mockRepository.query({
            n: 10,
          });

          $httpBackend.flush();

          expect(result).hasOwnProperty.call('repos');
          expect(result.repos.length).toEqual(1);
          expect(result.repos[0]).toEqual({
            username: 'redis',
            name: 'redis',
            selected: false,
          });
          expect(result.lastRepository).toEqual('namespace/repository');
        }));
      });

      describe('and last parameter has only repo name', () => {
        it('should return last properties', inject(() => {
          $httpBackend.expectGET('/v2/_catalog?n=10&last=')
            .respond({
              repositories: ['redis'],
            }, {
              link: '</v2/_catalog?last=repository&n=10>; rel="next"',
            });

          const result = mockRepository.query({
            n: 10,
          });

          $httpBackend.flush();

          expect(result).hasOwnProperty.call('repos');
          expect(result.repos.length).toEqual(1);
          expect(result.repos[0]).toEqual({
            username: 'redis',
            name: 'redis',
            selected: false,
          });
          expect(result.lastRepository).toEqual('repository');
        }));
      });

      describe('and no next link is provided', () => {
        it('should return undefined last properties', inject(() => {
          $httpBackend.expectGET('/v2/_catalog?n=10&last=')
            .respond({
              repositories: ['redis'],
            }, {
              link: '</v2/_catalog?last=namespace%2Frepository&n=10>; rel="not-next"',
            });

          const result = mockRepository.query({
            n: 10,
          });

          $httpBackend.flush();

          expect(result).hasOwnProperty.call('repos');
          expect(result.repos.length).toEqual(1);
          expect(result.repos[0]).toEqual({
            username: 'redis',
            name: 'redis',
            selected: false,
          });
          expect(result.lastRepository).toBeUndefined();
        }));
      });

      describe('and next link malformed', () => {
        it('should return undefined last properties', inject(() => {
          $httpBackend.expectGET('/v2/_catalog?n=10&last=')
            .respond({
              repositories: ['redis'],
            }, {
              link: '/v2/_catalog?last=namespace%2Frepository&n=10; rel="next"',
            });

          const result = mockRepository.query({
            n: 10,
          });

          $httpBackend.flush();

          expect(result).hasOwnProperty.call('repos');
          expect(result.repos.length).toEqual(1);
          expect(result.repos[0]).toEqual({
            username: 'redis',
            name: 'redis',
            selected: false,
          });
          expect(result.lastRepository).toBeUndefined();
        }));
      });

      describe('and next link missing last parameter', () => {
        it('should return undefined last properties', inject(() => {
          $httpBackend.expectGET('/v2/_catalog?n=10&last=')
            .respond({
              repositories: ['redis'],
            }, {
              link: '/v2/_catalog?n=10; rel="next"',
            });

          const result = mockRepository.query({
            n: 10,
          });

          $httpBackend.flush();

          expect(result).hasOwnProperty.call('repos');
          expect(result.repos.length).toEqual(1);
          expect(result.repos[0]).toEqual({
            username: 'redis',
            name: 'redis',
            selected: false,
          });
          expect(result.lastRepository).toBeUndefined();
        }));
      });
    });
  });
});
