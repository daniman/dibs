if (Meteor.isClient) {

  $(document).ready(function(){

    $("#logo").hide();
    $("#signUpForm").hide();

    $("#toWelcome").click(function() {
      $("#logo").fadeOut();
      $("#signUpForm").fadeOut();

      setTimeout(function() {
        $("#tint").fadeIn(),
        $("#welcome").fadeIn(),
        $("#signUp").fadeIn()
      }, 500);
    });
    
    var initialLocation;
    var mitCampus = new google.maps.LatLng (42.357,-71.09);
    var browserSupportFlag = new Boolean();
  
    $("#signUp").click(function() {
      $("#tint").fadeOut();
      $(this).fadeOut();
      $("#welcome").fadeOut();

      setTimeout(function() {
        $("#logo").fadeIn(), $("#signUpForm").fadeIn()}, 500);
      
    });

  });

  Template.body.rendered = function() {
    var mapOptions = {
          zoom: 15,
          disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    //Attempt W3C Geolocation
    if (navigator.geolocation){
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
      }, function() {
        handleNoGeolocation(browserSupportFlag);
      }); 
    }
    //browser does not support geolocation
    else{
      browserSupportFlag = false;
      handleNoGeolocation(browserSupportFlag);
    }

    function handleNoGeolocation(errorFlag){
      if (errorFlag == true) {
        alert("Geolocation service failed.");
        initialLocation = mitCampus;
      }else{
        alert("Browser does not support Geolocation.");
        initialLocation = mitCampus;
      }
      map.setCenter(initialLocation);
    }
}}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}