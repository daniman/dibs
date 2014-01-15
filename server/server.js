Meteor.startup(function () {
	//setup for Parse API
	Parse.initialize("KxXRF1qcFjHqA2AKnyPvg5Ys2VzMWR2ViAKNtX8V", "sXds7BqaSnQTpfszRNgQ0UO5h17fkGdIZwWgNi0A");
	var TestObject = Parse.Object.extend("TestObject");
	var testObject = new TestObject();
	testObject.save({foo: "bar"}).then(function(object) {
	  alert("yay! it worked");
	});
});