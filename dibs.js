if (Meteor.isClient) {

  $(document).ready(function(){

    $("#logo").hide();

    $("#signUp").click(function() {
      console.log("click!");
      $("#tint").fadeOut();
      $(this).fadeOut();
      $("#welcome").fadeOut();
      $(".hide").fadeOut();

      setTimeout(function() {
        $("#logo").fadeIn()}, 500);

      
    });

  });

  Template.maps.rendered = function() {
    var mapOptions = {
          center: new google.maps.LatLng(42.357, -71.09),
          zoom: 15,
          disableDefaultUI: true
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
      }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}