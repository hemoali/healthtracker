var app = app || {};
var SavedItemsList = Backbone.Collection.extend({
	model: app.Item,
	localStorage: new Backbone.LocalStorage('health-tracker-items'),
});

app.SavedItems = new SavedItemsList();
