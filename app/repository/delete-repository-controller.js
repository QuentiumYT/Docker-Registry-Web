/* @ngInject */
export default class DeleteRepositoryController {
  constructor($uibModalInstance, $window, Repository, Manifest, items, information) {
    const vm = this;
    vm.items = items;
    vm.information = information;
    this.$uibModalInstance = $uibModalInstance;
    this.$window = $window;
    this.Repository = Repository;
    this.Manifest = Manifest;
  }

  // Callback that triggers deletion of tags and reloading of page
  ok() {
    // WARNING API does not allow deleting repo anymore
    // angular.forEach(this.items, (value) => {
    //   const repoUser = value.split('/')[0];
    //   const repoName = value.split('/')[1];

    //   this.Repository.delete({
    //     repoUser,
    //     repoName,
    //   }).$promise.then(() => {
    //     this.$window.location.href = `/repositories`;
    //   });
    // });

    this.$uibModalInstance.close();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}
