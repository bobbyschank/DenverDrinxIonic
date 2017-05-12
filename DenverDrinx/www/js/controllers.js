angular.module('controllers', [])

.controller('MapCtrl', MapCtrl)
.controller('BarsCtrl', BarsCtrl)
.controller('BarDetailCtrl', BarDetailCtrl)
.controller('UberCtrl', UberCtrl)

.controller('AccountCtrl', AccountCtrl); //to be scapped

MapCtrl.$inject = ['$cordovaGeolocation', 'Bars', '$http'];
function MapCtrl($cordovaGeolocation, Bars, $http) {
  var self = this;
  self.bars = Bars.all();
  var options = {timeout: 10000, enableHighAccuracy: true};
  //get position of user
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //create a map based on user position
    self.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    google.maps.event.addListenerOnce(self.map, 'idle', function(){
    //this marker is the user's location
      var marker = new google.maps.Marker({
        map: self.map,
        position: latLng,
        icon: "../img/meMarker.png"
        
      });  

      //for each bar, http request google and drop a marker on the map
      self.bars.forEach(function(bar){
        var APIkey = '&key=AIzaSyAjuUQ2aRpUh5usOm0MYAex-9MgiBEA9Jg';
        $http
          .get('https://maps.googleapis.com/maps/api/geocode/json?address=' + bar.address + APIkey)
          .then(function(location){
            //marker specific to each bar
            var marker = new google.maps.Marker({
                map: self.map,
                animation: google.maps.Animation.DROP,
                position: location.data.results[0].geometry.location,
                icon: '../img/drinkTEST.png'
            });  
          });   
      });     
    });
  }, function(error){
    console.log("Could not get location");
  });
}//end MapCtrl

BarsCtrl.$inject = ['Bars', '$http', '$cordovaGeolocation'];
function BarsCtrl(Bars, $http, $cordovaGeolocation) {
  var self = this;
  self.bars = Bars.all();

//create timer of each bar
  self.bars.forEach(function(bar){
    bar.timeLeft = function(){
      var currentTime = new Date();
      var timer = 0;

      for (i = 0; i < this.day.length; i++){
        //if happy hour is today
        if (this.day[i] === currentTime.getDay()) {
          //get current time
          var currentHour = currentTime.getHours();
          var currentMinutes = currentTime.getMinutes();
         
          //happy hour has not started yet
          if (currentHour <= this.hours[i][0]){

            timer += (this.hours[i][0] - currentHour) * 60;
            timer += (this.minutes[i][0] - currentMinutes);
            if (timer > 0){
              return this.name + ' starts in :' + timer + ' minutes';
            } 
            //or is happy hour is in progress?
            if (timer <= 0){
              timer = 0;
              timer += (this.hours[i][1] - currentHour) * 60;
              timer += (this.minutes[i][1] - currentMinutes);
              return this.name + ' has minutes left: ' + timer;
            }
          }
          //happy hour is in progress
          if (currentHour >= this.hours[i][0]){
            timer = 0;
            timer += (this.hours[i][1] - currentHour) * 60;
            timer += (this.minutes[i][1] - currentMinutes);
            //still time left!
            if (timer > 0){
              return this.name + ' has minutes left: ' + timer;
            }   
            //or has it ended?
            if (timer <= 0) {
              return this.name + ' is over';
            }
          }
        }
      }
    };
  }); //end timer

}

function BarDetailCtrl($stateParams, Bars) {
  var self = this;
  self.bar = Bars.get($stateParams.barId);
}

function UberCtrl(){
  console.log('uber controller working as expected');
}


function AccountCtrl() {

}

