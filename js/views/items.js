"use strict";
var app = app || {};
app.ItemView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#item-template').html()),
    events: {
        'click .destroy': 'clear'
    },
    initialize: function() {
        this.listenTo(this.model, 'destroy', this.remove);
        // When this event gets triggered the view gets shown if the model day == the current active day
        // and will be hidden otherwise
        this.model.on('changeVisibility', this.changeVisibility, this);
    },
    render: function(local) {
        // Setting the local (which comes from the child) to change the right button (add/delete)
        var attr = this.model.attributes;
        attr.local = local;
        this.$el.html(this.template(attr));
    },
    clear: function() {
        this.model.destroy();
    },
    /**
     * This function shows/hides the view depending on the model day (if == app.activeDay)? show the view: hide the view;
     */
    changeVisibility: function() {
        // Hide or show the element if the condition is satisifie
        if (this.model.attributes.day == app.activeDay) {
            this.el.hidden = false;
        } else {
            this.el.hidden = true;
        }
    }
});
// This view for the left side list (searching list)
app.SearchItemView = app.ItemView.extend({
    initialize: function(options) {
        app.ItemView.prototype.initialize.call(this);
        this.vent = options.vent;
    },
    events: {
        'click .add': 'add'
    },
    add: function() {
        // When add button clicked, trigger the event to add this model to the saved items list
        this.vent.trigger("addItemFromSearchItemsToSavedItems", this.model);
    },
    render: function() {
        // Call parent render with false parameter: means it's not local (show the add button)
        app.ItemView.prototype.render.call(this, false);
        return this;
    }
});
app.SavedItemView = app.ItemView.extend({
    render: function() {
        // Call parent render with true parameter: means it's local (show the delete button)
        app.ItemView.prototype.render.call(this, true);
        return this;
    }
});