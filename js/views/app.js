var app = app || {};

app.AppView = Backbone.View.extend({
	el: '#container',
	events: {
		'click #search_button': 'searchData'
	},
	initialize: function (options) {
		this.search_text = $('#search_text');
		this.listenTo(app.SavedItems, 'add', this.addItemToSavedItems);
		this.listenTo(app.SearchItems, 'add', this.addItemToSearchItems);

		_.bindAll(this, "addItemFromSearchItemsToSavedItems");
		options.vent.bind("addItemFromSearchItemsToSavedItems", this.addItemFromSearchItemsToSavedItems);

		app.SavedItems.fetch();
	},
	addItemToSavedItems: function (item) {
		var view = new app.SavedItemView({
			model: item,
			vent: app.vent
		});
		$('#saved_items_list').append(view.render().el);
	},
	addItemToSearchItems: function (item) {
		var view = new app.SearchItemView({
			model: item,
			vent: app.vent
		});
		$('#search_results_list').append(view.render().el);
	},
	searchData: function () {
		var search_text = this.search_text.val().trim();
		if (search_text.length > 0) {
			this.loadDataFromAPI(search_text);
		} else {
			alert("Please enter search text");
		}
	},
	addItemFromSearchItemsToSavedItems: function (item) {
		app.SavedItems.create(item.attributes);
	},
	loadDataFromAPI: function (search_text) {
		_.invoke(app.SearchItems.toArray(), 'destroy');
		$.getJSON("https://api.nutritionix.com/v1_1/search/" + search_text + "?fields=item_name,brand_name,item_id,nf_calories&appId=cbc8cc2e&appKey=b0e81dc2410863002692d2f1685220e5", function (result) {
			$.each(result.hits, function (i, field) {
				app.SearchItems.add(new app.Item({
					name: field.fields.item_name,
					brand: field.fields.brand_name,
					cal: field.fields.nf_calories,
					local: false
				}));
			});
		}).done(function () {
			if (app.SearchItems.length < 1) {
				alert('Cannot find items for your search value');
			}
		}).fail(function () {
			alert("Something went wrong, please check your internet connection");
		});
	}
});
