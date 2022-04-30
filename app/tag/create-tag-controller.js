/* @ngInject */
export default class CreateTagController {
  constructor($route, $window, Repository, Tag, Manifest, AppMode) {
    this.imageId = $route.current.params.imageId;
    this.tagName = $route.current.params.tagName;
    this.repositoryUser = $route.current.params.repositoryUser;
    this.repositoryName = $route.current.params.repositoryName;
    this.$window = $window;
    this.Tag = Tag;
    this.Manifest = Manifest;

    this.master = {};

    Repository.query()
      .$promise.then((data) => {
        this.repositories = data.repos;
      });

    AppMode.query()
      .$promise.then((data) => {
        this.appMode = data;
      });

    this.tag = {
      repoUser: this.repositoryUser || '',
      repoName: this.repositoryName,
    };

    if (this.repositoryUser === null || this.repositoryUser === undefined) {
      this.repository = this.repositoryName;
    } else {
      this.repository = `${this.repositoryUser}/${this.repositoryName}`;
    }
  }

  selectRepo(repoStr) {
    if (repoStr.indexOf('/') === -1) {
      this.tag.repoUser = '';
      this.tag.repoName = repoStr;
    } else {
      [this.tag.repoUser, this.tag.repoNam] = repoStr.split('/');
    }
  }

  doCreateTag(newTag) {
    const tagStr = `${newTag.repoUser}/${newTag.repoName}:${newTag.tagName}`;

    this.Manifest.rawQuery({
      repository: this.repository,
      tagName: this.tagName,
    })
      .$promise.then((data) => {
        this.manifest = data;

        this.Tag.save(
          newTag,
          this.manifest,
          () => {
            // Redirect to new tag page
            this.$window.location.href = `tag/${this.tag.repoUser}/${this.tag.repoName}/${newTag.tagName}`;
          },
          (httpResponse) => {
            this.fail = `Failed to create newTag: ${tagStr} Response: ${httpResponse.statusText}`;
          },
        );
      });
  }

  createTag(newTag, forceOverwrite) {
    this.master = angular.copy(newTag);
    const tagStr = `${newTag.repoUser}/${newTag.repoName}:${newTag.tagName}`;
    this.Tag.exists(
      newTag,
      () => {
        if (!forceOverwrite) {
          this.fail = `Tag already exists: ${tagStr}`;
          return;
        }
        this.doCreateTag(newTag);
      },
      () => {
        this.doCreateTag(newTag);
      },
    );
  }

  isUnchanged(newTag) {
    return angular.equals(newTag, this.master);
  }
}
