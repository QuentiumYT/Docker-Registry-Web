/* @ngInject */
export default class DeleteTagController {
  constructor($uibModalInstance, $window, Manifest, items, information) {
    const vm = this;
    vm.items = items;
    vm.information = information;
    this.$uibModalInstance = $uibModalInstance;
    this.$window = $window;
    this.Manifest = Manifest;
  }

  ok() {
    angular.forEach(this.items, (value) => {
      const repository = value.split(':')[0];
      const tagName = value.split(':')[1];

      this.Manifest.query({
        repository,
        tagName,
      }).$promise.then((data) => {
        this.Manifest.delete({
          repository,
          digest: data.digest,
        }).$promise.then(() => {
          this.$window.location.href = `/repository/${repository}`;
        });
      });
    });
    this.$uibModalInstance.close();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}
