# Health Tracker
Backbone Health Tracking Web Application which will help you to keep tracking of the total calories you've gained during the day. The application also gives you a very huge vareity of items through amazing online API.
### How to install?
- Clone [this](https://github.com/hemoali/healthtracker.git) repo.
- Open `index.html` in your prefered browser.

### How it works?
- When the application starts you will see the `Day 1` tab highlighted (which means that any modification you do now will affect this day's data only).
- You can search for new items using the search box.
- You can then add the items from the search menu to the right `Items` panel (which shows the items of the current selected day) by clicking the plus icon.
- You also can delete the data from the `Items` list by clicking the trash icon.
- You can add new days by clicking `+Day` navbar button, then you can navigate between the days just by clicking them.
- Finally, you can see the total calories for each day at the bottom of the items list.

### Where does the info. come from?
The health information are being fetched using the [Nutritionix](https://developer.nutritionix.com/docs/v1_1) API.

### Where does the info. stored?
The info is being stored in the localStorage.