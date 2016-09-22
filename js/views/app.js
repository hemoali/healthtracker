var app = app || {};

app.AppView = Backbone.View.extend({
	el: '#container',
	events: {
		'click #search_button': 'searchData',
		'click .day_link': 'addNewDay'
	},
	initialize: function (options) {
		this.search_text = this.$('#search_text');
		this.total_calories = this.$('#total_calories');
		this.daysNav = $("#nav");

		this.listenTo(app.SavedItems, 'add', this.addItemToSavedItems);
		this.listenTo(app.SavedItems, 'destroy', this.removeItemFromSavedItems);
		this.listenTo(app.SearchItems, 'add', this.addItemToSearchItems);

		_.bindAll(this, "addItemFromSearchItemsToSavedItems");
		options.vent.bind("addItemFromSearchItemsToSavedItems", this.addItemFromSearchItemsToSavedItems);

		// Check for last day added by the user
		if (!(this.lastDay = localStorage.getItem('lastDay'))) {
			localStorage.setItem('lastDay', this.lastDay = 1);
		}
		app.activeDay = this.lastDay;
		//Render days
		this.renderDays();
		app.SavedItems.fetch();
		this.reFetchSavedItems();
	},
	reFetchSavedItems() {
		app.SavedItems.each(function (model, index) {
			model.trigger("changeVisibility");
		});
		this.refreshTotalCalories();
	},
	renderDays: function () {
		this.daysNav.html('');
		for (var i = 1; i <= this.lastDay; i++) {
			this.daysNav.append('<a class="day_link ' + ((i == this.lastDay) ? 'active' : '') + '" data-day="' + i + '" href="#">Day ' + i + '</a>');
		}
		this.daysNav.append('<a class="day_link" id="add_day" href="#">+Day</a>');
		var self = this;
		$(".day_link").click(function () {
			$.proxy(self.setActiveDay($(this).attr('data-day'), this), self);
		});
		$("#add_day").click($.proxy(this.addNewDay, this));
	},
	addNewDay: function () {
		var currentLastDay = localStorage.getItem('lastDay');
		localStorage.setItem('lastDay', ++currentLastDay);
		this.lastDay = app.activeDay = currentLastDay;
		this.renderDays();
	},
	setActiveDay: function (day, elem) {
		app.activeDay = day;

		app.SavedItems.fetch({
			data: $.param({
				'day': app.activeDay
			})
		});
		$('.active').removeClass('active');
		$(elem).addClass('active');

		this.reFetchSavedItems();
		this.refreshTotalCalories();
	},
	addItemToSavedItems: function (item) {
		var view = new app.SavedItemView({
			model: item,
			vent: app.vent
		});
		$('#saved_items_list').append(view.render().el);
		this.refreshTotalCalories();
	},
	removeItemFromSavedItems: function () {
		this.refreshTotalCalories();
	},
	addItemToSearchItems: function (item) {
		var view = new app.SearchItemView({
			model: item,
			vent: app.vent
		});
		$('#search_results_list').append(view.render().el);
	},
	addItemFromSearchItemsToSavedItems: function (item) {
		app.SavedItems.create(item.attributes);
	},
	searchData: function () {
		var search_text = this.search_text.val().trim();
		if (search_text.length > 0) {
			this.loadDataFromAPI(search_text);
		} else {
			alert("Please enter search text");
		}
	},
	loadDataFromAPI: function (search_text) {
		_.invoke(app.SearchItems.toArray(), 'destroy');
		$.getJSON("https://api.nutritionix.com/v1_1/search/" + search_text + "?fields=item_name,brand_name,item_id,nf_calories&appId=cbc8cc2e&appKey=b0e81dc2410863002692d2f1685220e5", function (result) {
			$.each(result.hits, function (i, field) {
				app.SearchItems.add(new app.Item({
					name: field.fields.item_name,
					brandName: field.fields.brand_name,
					cal: field.fields.nf_calories,
					local: false,
					day: app.activeDay
				}));
			});
		}).done(function () {
			if (app.SearchItems.length < 1) {
				alert('Cannot find items for your search value');
			}
		}).fail(function () {
			alert("Something went wrong, please check your internet connection");
		});
	},
	refreshTotalCalories: function () {
		var tot_cal = 0;
		_(app.SavedItems.models).each(function (item) {
			if (item.attributes.day == app.activeDay)
				tot_cal += item.attributes.cal;
		});
		this.total_calories.text(Math.round(tot_cal * 100) / 100);
	}
});
