/* @ngInject */
export default class RepositoryDetailController {
  constructor($route, $location, $uibModal, AppMode) {
    this.$route = $route;
    this.$location = $location;
    this.$uibModal = $uibModal;

    this.repositoryUser = $route.current.params.repositoryUser;
    this.repositoryName = $route.current.params.repositoryName;
    if (this.repositoryUser === null || this.repositoryUser === undefined) {
      this.repository = this.repositoryName;
    } else {
      this.repository = `${this.repositoryUser}/${this.repositoryName}`;
    }

    this.appMode = AppMode.query();
  }

  // Method used to disable next & previous links
  getNextHref() {
    if (this.tagsMaxPage > this.tagsCurrentPage) {
      const nextPageNumber = this.tagsCurrentPage + 1;
      return `/repository/${this.repository}?tagsPerPage=${this.tagsPerPage}&tagsCurrentPage=${nextPageNumber}`;
    }
    return '#';
  }

  getFirstHref() {
    if (this.tagsCurrentPage > 1) {
      return `/repository/${this.repository}?tagsPerPage=${this.tagsPerPage}`;
    }
    return '#';
  }

  openConfirmRepoDeletionDialog(size) {
    // Delete repository on page
    const repository = [this.repository];
    this.$uibModal.open({
      animation: true,
      templateUrl: 'modalConfirmDeleteItems.html',
      controller: 'DeleteRepositoryController',
      controllerAs: 'vm',
      size,
      resolve: {
        items() {
          return repository;
        },
        information() {
          return `A repository is a collection of tags.
                  A tag is basically a reference to an image.
                  If no references to an image exist, the image will be scheduled for automatic deletion.
                  That said, if you remove a tag, you remove a reference to an image.
                  Your image data may get lost, if no other tag references it.
                  If you delete a repository, you delete all tags associated with it.
                  Are you sure, you want to delete the following repositories?`;
        },
      },
    });
  }
}
