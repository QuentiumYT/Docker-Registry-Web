/* @ngInject */
export default class TagService {
  constructor($resource) {
    const service = $resource('/v2/:repoUser/:repoName/tags/list', {}, {
      // Response example:
      // {"name":"kkleine/docker-registry-frontend","tags":["v2", "v1-deprecated"]}
      query: {
        method: 'GET',
        isArray: true,
        transformResponse(data) {
          const res = [];
          const resp = angular.fromJson(data);
          if (resp.tags) {
            Object.values(resp.tags).forEach((tag) => {
              res.push({
                name: tag,
                imageId: `ImageIDOf${tag}`,
                selected: false,
              });
            });
          }
          return res;
        },
      },
      exists: {
        url: '/v2/:repoUser/:repoName/manifests/:tagName',
        method: 'GET',
        transformResponse(data) {
          // data will be the image ID if successful or an error object.
          const json = angular.fromJson(data);
          const res = angular.isString(json);
          return res;
        },
      },
      // Usage: Tag.save({repoUser:'user', repoName: 'repo', tagName: 'name'}, imageId);
      save: {
        method: 'PUT',
        headers: {
          'content-type': 'application/vnd.docker.distribution.manifest.v2+json',
        },
        url: '/v2/:repoUser/:repoName/manifests/:tagName',
      },
    });
    return service;
  }
}
