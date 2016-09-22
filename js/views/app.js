var app = app || {};

app.AppView = Backbone.View.extend({
	el: '#container',
	events: {
		// Search button excutes searchData function
		'click #search_button': 'searchData'
	},
	initialize: function (options) {
		// Cache views
		this.search_text = this.$('#search_text');
		this.total_calories = this.$('#total_calories');
		this.daysNav = $("#nav");


		this.listenTo(app.SavedItems, 'add', this.addItemToSavedItems);
		this.listenTo(app.SavedItems, 'destroy', this.removeItemFromSavedItems);
		this.listenTo(app.SearchItems, 'add', this.addItemToSearchItems);

		// Bind this event to the proper function using the shared options.vent
		_.bindAll(this, "addItemFromSearchItemsToSavedItems");
		options.vent.bind("addItemFromSearchItemsToSavedItems", this.addItemFromSearchItemsToSavedItems);

		// Check for last day added by the user
		if (!(this.lastDay = localStorage.getItem('lastDay'))) {
			localStorage.setItem('lastDay', this.lastDay = 1);
		}
		// Set the active day to the last day when initializing
		app.activeDay = this.lastDay;
		//Render days nav bar
		this.renderDays();
		//Fetch the saved items collection
		app.SavedItems.fetch();
		//filter the saved items to show only the current day items
		this.filterSavedItems();
	},
	filterSavedItems() {
		// loop through the items and remove call change visibility to display the tasks of the current selected day only
		app.SavedItems.each(function (model, index) {
			model.trigger("changeVisibility");
		});
		// Refresh the calories total to calcualte the shown elements only
		this.refreshTotalCalories();
	},
	renderDays: function () {
		this.daysNav.html(''); // Remove the html of the nav bar
		//Add the days tabs
		for (var i = 1; i <= this.lastDay; i++) {
			this.daysNav.append('<a class="day_link ' + ((i == this.lastDay) ? 'active' : '') + '" data-day="' + i + '" href="#">Day ' + i + '</a>');
		}
		// Add the last add_day tab
		this.daysNav.append('<a class="day_link" id="add_day" href="#">+Day</a>');
		// set click event to set the active day for the days
		var self = this;
		$(".day_link").click(function () {
			$.proxy(self.setActiveDay($(this).attr('data-day'), this), self);
		});
		//Set click event for adding new day
		$("#add_day").click($.proxy(this.addNewDay, this));
	},
	addNewDay: function () {
		// Add the new day and increaste the lastDay
		var currentLastDay = localStorage.getItem('lastDay');
		localStorage.setItem('lastDay', ++currentLastDay);
		this.lastDay = app.activeDay = currentLastDay;
		// Re-render days
		this.renderDays();
	},
	setActiveDay: function (day, elem) {
		// Set the app active day
		app.activeDay = day;
		// Change style of selected element only
		$('.active').removeClass('active');
		$(elem).addClass('active');

		//Refilter the items and calculate the total calories
		this.filterSavedItems();
	},
	addItemToSavedItems: function (item) {
		// Create the new view
		var view = new app.SavedItemView({
			model: item
		});
		// Append the view to the list
		$('#saved_items_list').append(view.render().el);
		this.filterSavedItems();
	},
	removeItemFromSavedItems: function () {
		this.filterSavedItems();
	},
	addItemToSearchItems: function (item) {
		var view = new app.SearchItemView({
			model: item,
			vent: app.vent // shared vent to trigger the event of adding the items from search items to saved items
		});
		// Append the view to the search results list
		$('#search_results_list').append(view.render().el);
	},
	addItemFromSearchItemsToSavedItems: function (item) {
		item.attributes.day = app.activeDay;
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
		$('#search_results_loadingview').removeAttr('hidden');
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
			$('#search_results_loadingview').attr('hidden', 'hidden');
		}).fail(function () {
			alert("Something went wrong, please check your internet connection");
			$('#search_results_loadingview').removeAttr('hidden', 'hidden');
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
