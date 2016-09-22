var app = app || {};
app.Item = Backbone.Model.extend({
	defaults: {
		name: 'Item',
		cal: '1000',
		brandName: 'Brand',
		day: '1'
	}
});
