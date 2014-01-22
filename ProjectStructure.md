## General Project Structure

| Location             | Note                 |
| -------------------- | ---------------------|
| dibs-meteor/         | _the Meteor application_  |
| milestone1/          | _files for Milestone 1_  |
| python-backend/      | _Python code for scraping emails_  |



## Dibs-Meteor Application

_Note that js files in lib folders are loaded before other js files_

| Location             | Note                 |
| -------------------- | ---------------------|
| **General**  		   |					  |
| lib/                 | _common code for client/server_  |
| lib/router.js 	   | _Router configuration and route declarations_   |
| lib/permissions.js   | _declare re-usable authentication functions for allow/deny rules_  |
| **Collections**  	   |  						|
| collections/         | _definitions of collections and methods on them (could be models)_ |
| collections/&lt;collection&gt;.js  |  _instantiation of collection, allow/deny rules, and Meteor.methods for that collection_ |
| **Server**  		   |  						|
| server/              | _server-side only code_  |
| server/fixtures.js   | _seed data for colletions_   |
| server/publications.js    | _declare publication rules for collections_  |
| **Client**  		   |  |
| client/main.js       | _subscriptions, basic Meteor.startup code_  |
| client/main.html     | _top-level html_  |
| client/stylesheets   | _all stylesheets here_ |
| client/helpers	   | _helper classes here_ |
| client/helpers/config.js	   | _client configuration settings, ex. accounts.ui config_ |
| client/helpers/handlebars.js	   | _handlebars helper extensions_ |
| client/views/&lt;page&gt;.html   |  _the templates specific to a single page_  |
| client/views/&lt;page&gt;.js     |  _and the JS to hook it up_  |
| client/views/&lt;type&gt;/       |  _if you find you have a lot of views of the same object type_ |
| client/lib                       | _client specific libraries (also loaded first)_ |