var app = app || {};
app.vent = _.extend({}, Backbone.Events);
$(function () {
	
	// Kick things off by creating the **App**.
	new app.AppView({vent:app.vent});

});
