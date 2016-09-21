var app = app || {};
var SavedItemsList = Backbone.Collection.extend({
	model: app.Item,
	localStorage: new Backbone.LocalStorage('health-tracker-items'),
});
var SearchItemsList = Backbone.Collection.extend({
	model: app.Item
});

app.SearchItems = new SearchItemsList();
app.SavedItems = new SavedItemsList();
