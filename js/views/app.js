var app = app || {};

app.AppView = Backbone.View.extend({
	el: '#container',
	events: {
		'click #search_button': 'searchData'
	},
	initialize: function () {
		this.search_text = $('#search_text');
		this.listenTo(app.SavedItems, 'add', this.addItemToSavedItems);

		app.SavedItems.fetch();
	},
	addItemToSavedItems: function (item) {
		var view = new app.ItemView({
			model: item
		});
		$('#saved_items_list').append(view.render().el);
	},
	searchData: function(){
		var search_text = this.search_text.val().trim();
		alert(search_text);
		// ToDo: Fetch APIItems using the entered text
		
	}
});
