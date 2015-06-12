var net     = require("net");
var http    = require("http");
var easyimg = require("/opt/usr/nodejs/lib/node_modules/easyimage");
var url     = require('url');
var exec    = require('child_process').exec;
var io      = require("/opt/usr/nodejs/lib/node_modules/socket.io").listen(8888);
var fs      = require("fs");

var client;
var allClients = [];

io.sockets.on("connection", function (socket) {
  console.log("connection to " + socket );
  connectToTCP();

  allClients.push(socket);

  getThumbnail();
  socket.on("client-thumbnail", function() {
    console.log("client-thumbnail");
    socket.emit("thumbnail");
  });

  socket.on("client-updateMonitor", function() {
    console.log("client-updateMonitor");
    client.write("monitor 1 \n");
  });

  socket.on("client-getNetConfig", function(data) {
    console.log("client-getNetConfig", data.serverip);
    getNetConfig(data);
  });

  socket.on("client-getNetData", function(data) {
    console.log("client-getNetData", data);
    getNetData(data);
  });

  socket.on("client-sendNetData", function(data) {
    console.log("client-sendNetData", data);
    executeNet(data, "send");
  });
  socket.on("client-startServerNetData", function(data) {
    console.log("client-startServerNetData", data);
    executeNet(data, "start");
  });
  socket.on("client-stopServerNetData", function(data) {
    console.log("client-stopServerNetData", data);
    executeNet(data, "stop");
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    var i = allClients.indexOf(socket);
    allClients.splice(i,1);
  });
});

/**
 * [getThumbnail description]
 * @return {[type]} [description]
 */
// var file_name = url.parse("http://127.0.0.1/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=100").pathname.split('/').pop();
// var wget = 'wget -O preview.jpg -P ' + "/var/www/ui-mobile/node/" + " http://127.0.0.1/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=50";
var getThumbnail = function() {
  // compose the wget command
  var wget = "wget -O /var/www/ui-mobile/node/preview.jpg http://127.0.0.1/preview/shm?shmid=spu.bmm:01:imagemerger-69&q=50";
  // excute wget using child_process' exec function
  var child = exec(wget, function(err, stdout, stderr) {
    if (err) {
      console.log("Error while wget");
    } else {
      // console.log(file_name + ' downloaded to ');
      easyimg.resize({src:'/var/www/ui-mobile/node/preview.jpg', dst:'/var/www/ui-mobile/node/preview.jpg', width:640, height:480}, function(err, stdout, stderr) {
        if (err) {
          console.log("Error while resizing" + err);
        } else {
          console.log('Resized to 640x480');
        }
      });
    }
  });
};

setInterval(getThumbnail, 5000);

/**
 * [connectToTCP description]
 * @return {[type]} [description]
 */
var connectToTCP = function() {
  console.log("connectToTCP")
  // var client = net.connect("4908", "192.168.1.103", function() {
  client = net.connect("4908", "127.0.0.1", function() {
    console.log("Connected");
    client.write("monitor 1 \n");
  });

  client.on("data", function(data) {
    var data = data+"";
    var startIndex = 0, searchStrLen = 14;
    var index, stati = [];
    var send = false;

    while ((index = data.indexOf("SERVICE_STATUS", startIndex)) > -1) {
      // console.log( data.substr(index-14,10) )
      if(data.substr(index-14,10) === "spu.inputs") {
        service = data.substr(index-3,2);
        status = data.substr(index+32, 2);
        test = (data.substr(index-14,10) === "spu.inputs");
        switch(status) {
          case "1\r":
            status = "error";
            break;
          case "-1":
            status = "off";
            break;
          case "0\r":
            status = "on";
            break;
          default:
            status = "undefined";
            break;
        }
        // console.log(index, service, status)
        stati.push({"service":service, "status":status, "test":"test"});
      }

      startIndex = index + searchStrLen;
    }

    if(stati.length !== 0) {
      // console.log("stati: ", stati);
      // fs.writeFile("test"+service, JSON.stringify({stati:stati}), function(err) {
      //   if(err) {
      //     console.log(err);
      //   } else {
      //     console.log("The file was saved!");
      //   }
      // });
      io.sockets.emit("service_stati", {stati:stati});
    }


    if(data.indexOf("MonitorListUpdate") > -1) {
      client.write("monitor 1 \n");
    }
  });

  client.on("close", function() {
    console.log("Connection closed");
  });
};


/**
 * [getNetConfig description]
 * @param  {[type]} server [description]
 * @return {[type]}        [description]
 */
var getNetConfig = function(server) {
  // var wget = "wget -O /var/www/ui-mobile/node/"+server.serverid+".json http://"+server.serverip+"/cgi/generic-request.cgi --post-data='tool=list-ajax&serviceType=net'";
  var wget = "wget -O /var/www/ui-mobile/node/"+server.serverid+".json http://"+server.serverip+"/monitoring/query --post-data='servicefilter=net%3A*'";
  var child = exec(wget, function(err, stdout, stderr) {
    if (err) {
      console.log("Error while wget");
    } else {
      fs.readFile( "/var/www/ui-mobile/node/"+server.serverid+".json", 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }
        data = JSON.parse(data);
        console.log(data)
        var nics = [];
        // data.forEach(function(item) {

        for( var item in data ) {
          var nic = item.replace("net:", "");
          // console.log(data[item][7]["IPv4"])
          var ip = data[item][7]["IPv4"];
          if( nic !== "lo" ) {
            nics.push([nic, ip]);
          }
        }
        // });
        server.nics = nics;
        io.sockets.emit("service_list_net", server);
      });
    }
  });
};

/**
 * [getNetData description]
 * @param  {[type]} server [description]
 * @return {[type]}        [description]
 */
var getNetData = function(server) {
  var wget = "wget -O /var/www/ui-mobile/node/"+server.serverid+server.nic+".json http://"+server.serverip+"/cgi/generic-request.cgi --post-data='tool=ajax-config&service=net%3A"+server.nic+"'";
  var child = exec(wget, function(err, stdout, stderr) {
    if (err) {
      console.log("Error while wget");
    } else {
      fs.readFile( "/var/www/ui-mobile/node/"+server.serverid+server.nic+".json", 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }
        nicdata = [];
        nic = server.nic;
        data = JSON.parse(data);
        nicdata.push(nic);
        nicdata.push(data.data);

        io.sockets.emit("service_data_net", nicdata);
      });
    }
  });
};

var executeNet = function(server, type) {
  var wget = "wget http://"+server.serverip+"/cgi/generic-request.cgi --post-data='tool="+type+"-ajax&service=net%3A"+server.nic+"'";
  var child = exec(wget, function(err, stdout, stderr) {
    if (err) {
      console.log("Error while wget");
    } else {
      io.sockets.emit("service_"+type, server.nic);
    }
  });
};

var sendNet = function(server, type) {
  console.log(server.data)
// AUTO_CONFIG:static
// ADDRESS:192.168.40.105
// NETMASK:255.255.255.0
// GATEWAY:
// NAMESERVER:
// MTUSIZE:1500
// service:net:eth1
// tool:update-ajax-without-reset
// PRODUCT_ID=generic&DESCRIPTION=NIC+2+(eth1)&INTERFACE_TYPE=1&BOND_SLAVE_1=&BOND_SLAVE_2=&BOND_MODE=&BOND_MIIMON=&BOND_UPDELAY=&BOND_DOWNDELAY=&AUTO_CONFIG=static&ADDRESS=192.168.40.105&NETMASK=255.255.255.0&GATEWAY=&NAMESERVER=&MTUSIZE=1500&DEFAULT_MULTICAST=&MAX_IGMP_VERSION=2&REV_PATH_FILTER=-1&service=net%3Aeth1&tool=update-ajax-without-reset
  var wget = "wget http://"+server.serverip+"/cgi/generic-request.cgi --post-data='tool="+type+"-ajax&service=net%3A"+server.nic+"'";
  var child = exec(wget, function(err, stdout, stderr) {
    if (err) {
      console.log("Error while wget");
    } else {
      io.sockets.emit("service_"+type, server.nic);
    }
  });
};
