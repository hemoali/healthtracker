var app = app || {};
app.ItemView = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#item-template').html()),
	events: {
		'click .destroy': 'clear',
		'click .add': 'add'
	},
	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},
	render: function () {
		this.$el.html(this.template(this.model.attributes));

		return this;
	},
	clear: function () {
		this.model.destroy();
	},
	add: function () {
		alert("Add");
	}
});
