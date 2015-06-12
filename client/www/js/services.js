/**
 * Mobile UI services
 *
 * Defines services to build the Model representing the BMM list.
 * Connects to each BMM trying to establish a socket.io connection.
 * If there is no socket.io connection possible, a reduced feature set is given.
 * (just Thumbnails, no real time status updates, no video for now, no system setup in any way)
 *
 * TODO: (thomas) add socket.io & fallback
 * copyright @2015, Thomas Pawlik
 */
angular.module('mobileui.services', [])

.factory('BMMFactory', function() {
  var bmms = [];
  if(window.localStorage.getItem("bmms") !== null) {
    bmms = JSON.parse(window.localStorage.getItem("bmms"));
  } else {
    // Some fake testing data
    bmms = [{
      id: 0,
      ip: "192.168.3.102",
      port: "",
      title: 'Test BMM 0',
      description: "This a furious test of Ionic for our Mobile UI",
      thumbnail: 'http://192.168.3.102/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
      status: true
    }, {
      id: 1,
      ip: "127.0.0.1",
      port: "",
      title: 'Test BMM 1',
      description: "This a furious test of Ionic for our Mobile UI",
      thumbnail: 'http://192.168.3.103/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
      status: false
    },{
      id: 2,
      ip: "192.168.3.104",
      port: "",
      title: 'Test BMM 2',
      description: "This a furious test of Ionic for our Mobile UI",
      thumbnail: 'http://192.168.3.104/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
      status: true
    }, {
      id: 3,
      ip: "192.168.3.109",
      port: "",
      title: 'Test BMM 3',
      description: "This a furious test of Ionic for our Mobile UI",
      thumbnail: 'http://192.168.3.109/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
      status: true
    }, {
      id: 4,
      ip: "192.168.3.111",
      port: "",
      title: 'Test BMM 4',
      description: "This a furious test of Ionic for our Mobile UI",
      thumbnail: 'http://192.168.3.111/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=70&reloadimage',
      status: true
    }];

    window.localStorage.setItem("bmms", JSON.stringify(bmms));
  }

  return {
    all: function() {
      return bmms;
    },
    remove: function(bmm) {
      bmms.splice(bmms.indexOf(bmm), 1);
      window.localStorage.setItem("bmms", JSON.stringify(bmms));
    },
    get: function(bmmId) {
      for (var i = 0; i < bmms.length; i++) {
        if (bmms[i].id === parseInt(bmmId)) {
          return bmms[i];
        }
      }
      return null;
    },
    add: function (bmm) {
      bmms.push(bmm);
      window.localStorage.setItem("bmms", JSON.stringify(bmms));
    }
  };
});
