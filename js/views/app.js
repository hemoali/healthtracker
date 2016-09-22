"use strict";
var app = app || {};

app.AppView = Backbone.View.extend({
    el: '#container',
    events: {
        // Search button excutes searchData function
        'click #search_button': 'searchData'
    },
    initialize: function(options) {
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
    /**
     * This function shows only the items of the active day. 
     * The function fires the changeVisibility event, which gets caught by the view of this model, and then the view gets hidden/shown depending on the model day
     */
    filterSavedItems() {
        // loop through the items and remove call change visibility to display the tasks of the current selected day only
        app.SavedItems.each(function(model, index) {
            model.trigger("changeVisibility");
        });
        // Refresh the calories total to calcualte the shown elements only
        this.refreshTotalCalories();
    },
    /**
     * This function renders the top navbar days section
     */
    renderDays: function() {
        this.daysNav.html(''); // Remove the html of the nav bar
        //Add the days tabs
        for (var i = 1; i <= this.lastDay; i++) {
            this.daysNav.append('<a class="day_link ' + ((i == this.lastDay) ? 'active' : '') + '" data-day="' + i + '" href="#">Day ' + i + '</a>');
        }
        // Add the last add_day tab
        this.daysNav.append('<a class="day_link" id="add_day" href="#">+Day</a>');
        // set click event to set the active day for the days
        var self = this;
        $(".day_link").click(function() {
            $.proxy(self.setActiveDay($(this).attr('data-day'), this), self);
        });
        //Set click event for adding new day
        $("#add_day").click($.proxy(this.addNewDay, this));
    },
    /**
     * This function is called when +Day button is pressed, it increases the lastDay parameter and then recalls the renderDays function
     */
    addNewDay: function() {
        // Add the new day and increaste the lastDay
        var currentLastDay = localStorage.getItem('lastDay');
        localStorage.setItem('lastDay', ++currentLastDay);
        this.lastDay = app.activeDay = currentLastDay;
        // Re-render days
        this.renderDays();
    },
    /**
     * This function changes the activeDay (to show this day's items only)
     * @param {number} day  The required active day
     * @param {object} elem The element to be highlighted
     */
    setActiveDay: function(day, elem) {
        // Set the app active day
        app.activeDay = day;
        // Change style of selected element only
        $('.active').removeClass('active');
        $(elem).addClass('active');

        //Refilter the items and calculate the total calories
        this.filterSavedItems();
    },
    /**
     * This function adds the (item parameter)'s view to the saved items list and then refilters the items list
     * @param {object} item The model of the new view
     */
    addItemToSavedItems: function(item) {
        // Create the new view
        var view = new app.SavedItemView({
            model: item
        });
        // Append the view to the list
        $('#saved_items_list').append(view.render().el);
        this.filterSavedItems();
    },
    /**
     * This function gets called when removing model from the saved items collection
     */
    removeItemFromSavedItems: function() {
        this.filterSavedItems();
    },
    /**
     * This function gets called when adding new item to the search items list and the view will be appended to the search results list
     * @param {object} item The object that will be associated to the added view
     */
    addItemToSearchItems: function(item) {
        var view = new app.SearchItemView({
            model: item,
            vent: app.vent // shared vent to trigger the event of adding the items from search items to saved items
        });
        // Append the view to the search results list
        $('#search_results_list').append(view.render().el);
    },
    /**
     * This function gets called when the event of addItemFromSearchItemsToSavedItems gets triggered
     * @param {object} item The model to be added to saveditemslist 
     */
    addItemFromSearchItemsToSavedItems: function(item) {
        // Set the day attribute to the current active day
        item.attributes.day = app.activeDay;
        // Add the item to the Saved Items
        app.SavedItems.create(item.attributes);
    },
    /**
     * This function gets called when search button gets clicked
     */
    searchData: function() {
        var search_text = this.search_text.val().trim();
        if (search_text.length > 0) {
            this.loadDataFromAPI(search_text);
        } else {
            alert("Please enter search text");
        }
    },
    /**
     * This fucntion starts loading the data from the API, passing to it the search_text parameter
     * @param {string} search_text Search value to be passed to API
     */
    loadDataFromAPI: function(search_text) {
        // Remove old list of searched items
        _.invoke(app.SearchItems.toArray(), 'destroy');
        // Show the progress bar of the search list
        $('#search_results_loadingview').removeAttr('hidden');
        $.getJSON("https://api.nutritionix.com/v1_1/search/" + search_text + "?fields=item_name,brand_name,item_id,nf_calories&appId=cbc8cc2e&appKey=b0e81dc2410863002692d2f1685220e5", function(result) {
            $.each(result.hits, function(i, field) {
                // Add items to searchItems collection
                app.SearchItems.add(new app.Item({
                    name: field.fields.item_name,
                    brandName: field.fields.brand_name,
                    cal: field.fields.nf_calories,
                    local: false,
                    day: app.activeDay
                }));
            });
        }).done(function() {
            if (app.SearchItems.length < 1) { // If no search results found for the entered search value
                alert('Cannot find items for your search value');
            }
            // Hide the progress bar of the search list
            $('#search_results_loadingview').attr('hidden', 'hidden');
        }).fail(function() {
            // If there's error connecting to the service
            alert("Something went wrong, please check your internet connection");
            // Hide the progress bar of the search list
            $('#search_results_loadingview').removeAttr('hidden', 'hidden');
        });
    },
    /**
     * This function counts the total calories of the actieDay only
     */
    refreshTotalCalories: function() {
        var tot_cal = 0;
        _(app.SavedItems.models).each(function(item) {
            if (item.attributes.day == app.activeDay)
                tot_cal += item.attributes.cal;
        });
        this.total_calories.text(Math.round(tot_cal * 100) / 100);
    }
});