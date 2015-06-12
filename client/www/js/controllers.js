angular.module('mobileui.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('BMMsCtrl', function($scope, $ionicModal, $ionicPopup, BMMFactory) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var bctl = this;
  $scope.bmms = BMMFactory.all();
  $scope.remove = function(bmm) {
    BMMFactory.remove(bmm);
  };

    $scope.addBMM = function() {
      $scope.popupData = {};
      var bmmPopup = $ionicPopup.show({
        templateUrl: 'templates/bmm-add.html',
        title: 'Add new BMM',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              // TODO get last known ID & check for errors
              var newbmm = {
                id: 0,
                ip: $scope.popupData.newBMMip,
                port: $scope.popupData.newBMMport,
                title: $scope.popupData.newBMMtitle,
                description: $scope.popupData.newBMMdescription,
                thumbnail: 'http://'+$scope.popupData.newBMMip+'/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
                status: true
              };

              // push to scope
              // TODO necessary?
              $scope.bmms.push(newbmm);
              // push to localstorage
              BMMFactory.add(newbmm);
            }
          }
        ]
      });
    };
})

.controller('BMMDetailCtrl', function($scope, $stateParams, BMMFactory) {
  $scope.bmm = BMMFactory.get($stateParams.bmmId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableAutoRefresh: true
  };
});
