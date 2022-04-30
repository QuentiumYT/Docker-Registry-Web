function maxTagsPerPage(numOfPages, tagsPerPage) {
  return parseInt(Math.ceil(parseFloat(numOfPages) / parseFloat(tagsPerPage)), 10);
}

function compare(a, b) {
  const at = new Date(a.details.created);
  const bt = new Date(b.details.created);

  return at.getTime() - bt.getTime();
}

/* @ngInject */
export default class TagController {
  constructor($scope, $route, $location, $uibModal, Manifest, Tag, AppMode, filterFilter, Blob, RegistryHost) {
    this.$route = $route;
    this.$location = $location;
    this.$uibModal = $uibModal;
    this.filterFilter = filterFilter;
    this.registryHost = RegistryHost.query();

    this.searchName = $route.current.params.searchName;
    this.repositoryUser = $route.current.params.repositoryUser;
    this.repositoryName = $route.current.params.repositoryName;

    // sort tags
    this.orderByCreated = true;

    if (this.repositoryUser === null || this.repositoryUser === undefined) {
      this.repository = this.repositoryName;
    } else {
      this.repository = `${this.repositoryUser}/${this.repositoryName}`;
    }
    this.tagName = $route.current.params.tagName;
    AppMode.query((result) => {
      this.appMode = result;
      this.tagsPerPage = $route.current.params.tagsPerPage || this.appMode.defaultTagsPerPage;
      this.tagsCurrentPage = $route.current.params.tagsCurrentPage;
      if (this.tagsPerPage === 'all') {
        this.tagsPerPage = null;
      }
    });

    // Fetch tags
    Tag.query({
      repoUser: this.repositoryUser,
      repoName: this.repositoryName,
    }).$promise.then((result) => {
      this.tags = result;

      // Determine the number of pages
      this.tagsMaxPage = maxTagsPerPage(result.length, this.tagsPerPage);

      // Compute the right current page number
      if (this.tagsCurrentPage) {
        this.tagsCurrentPage = parseInt(this.tagsCurrentPage, 10);
        if (this.tagsCurrentPage > this.tagsMaxPage || this.tagsCurrentPage < 1) {
          this.tagsCurrentPage = 1;
        }
      } else {
        this.tagsCurrentPage = 1;
      }

      // Select wanted tags
      let idxShift = 0;
      // Copy collection for rendering in a smart-table
      this.displayedTags = [].concat(this.tags);

      // Get tags per page
      if (this.tagsPerPage) {
        this.tagsPerPage = parseInt(this.tagsPerPage, 10);
        idxShift = (this.tagsCurrentPage - 1) * this.tagsPerPage;
        this.displayedTags = this.displayedTags.slice(idxShift, (this.tagsCurrentPage) * this.tagsPerPage);
      }

      this.$route.data = {
        tagsCurrentPage: this.tagsCurrentPage,
        tagsPerPage: this.tagsPerPage,
        tagsMaxPage: this.tagsMaxPage,
      };

      // Fetch wanted manifests
      this.displayedTags.forEach((displayedTag) => {
        if (Object.prototype.hasOwnProperty.call(displayedTag, 'name')) {
          Manifest.query({
            repository: this.repository,
            tagName: displayedTag.name,
          })
            .$promise.then((data) => {
              const tag = displayedTag;
              tag.details = angular.copy(data);
              return !data.isSchemaV2
                ? undefined
                : Blob.query({
                  repository: this.repository,
                  digest: `sha256:${data.id}`,
                })
                  .$promise.then((config) => {
                    const labels = config.container_config && config.container_config.Labels;
                    tag.details.created = config.created;
                    tag.details.docker_version = config.docker_version;
                    tag.details.os = config.os;
                    tag.details.architecture = config.architecture;
                    tag.details.labels = labels;
                    tag.details.dockerfile = config.dockerfile;
                    tag.details.layers = config.dockerfile.length;
                  });
            });
        }
      });

      $scope.$watch(() => this.displayedTags.filter((t) => t.selected), (nv) => {
        this.selectedTags = nv.map((tag) => `${this.repository}:${tag.name}`);
      }, true);
    });

    // selected tags
    this.selectedTags = [];
  }

  // helper method to get selected tags
  selectedTags() {
    return this.filterFilter(this.displayedTags, {
      selected: true,
    });
  }

  copyTag() {
    this.tmpInput = document.createElement('input');
    document.querySelector('body').append(this.tmpInput);
    this.tmpInput.value = document.querySelector('code[style]').innerText;
    this.tmpInput.select();
    document.execCommand('copy');
    this.tmpInput.remove();
  }

  sortTags() {
    if (this.orderByCreated) {
      this.displayedTags.sort(compare);
    } else {
      this.displayedTags.sort(compare).reverse();
    }

    this.orderByCreated = !this.orderByCreated;
  }

  openConfirmTagDeletionDialog(size) {
    // Delete tag on page
    let selectedTags;
    if (this.tagName) {
      selectedTags = [`${this.repository}:${this.tagName}`];
      // Delete multiple tags checkbox
    } else {
      selectedTags = this.selectedTags;
    }
    this.$uibModal.open({
      animation: true,
      templateUrl: 'modalConfirmDeleteItems.html',
      controller: 'DeleteTagController',
      controllerAs: 'vm',
      size,
      resolve: {
        items() {
          return selectedTags;
        },
        information() {
          return `A tag is basically a reference to an image.
                  If no references to an image exist, the image will be
                  scheduled for automatic deletion.
                  That said, if you remove a tag, you remove a reference to an image.
                  Your image data may get lost, if no other tag references it.
                  Are you sure, you want to delete the following tags?`;
        },
      },
    });
  }
}
