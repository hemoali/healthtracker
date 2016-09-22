"use strict";
var app = app || {};
var SavedItemsList = Backbone.Collection.extend({
	model: app.Item,
	localStorage: new Backbone.LocalStorage('health-tracker-items'),
});
var SearchItemsList = Backbone.Collection.extend({
	model: app.Item
});
// Collection to hold items on search
app.SearchItems = new SearchItemsList();
// Collection to fetch data from local storage 
app.SavedItems = new SavedItemsList();
