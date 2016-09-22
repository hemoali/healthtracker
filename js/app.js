"use strict";
var app = app || {};
// app.vent will be used to hold event, which will add new items from search collection to the saved items collection 
app.vent = _.extend({}, Backbone.Events);
$(function () {
	// Kick things off by creating the **App**.
	new app.AppView({
		vent: app.vent
	});
});
