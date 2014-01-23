Team Dibs: Milestone 2 
====

<strong>Members: Julian Contreras, Danielle Man, Andrew Mikofalvy</strong>


1. Changes Since Milestone 1
----
Although Dibs still uses the reuse email list to create posts that provide immediate listings, we now view Dibs as a standalone platform that acts as a sort of visual Craigslist. The implementation is the same, but the pitch has changed, slightly.

2. Current Features
----
- A navigable map interface 
- Clickable map markers that display information
- Clickable 'news feed' style list of ReUse posts that focus on the associated map marker
- Realtime updates: Syncs across all current users browsers whenever someone posts on Dibs or an email comes in through reuse.
- The ability to post from Dibs
- Parses reuse item location from body of reuse email
- Retrieves location from signature if location is not found
- Uses a custom auto-correct algorithm to detect an MIT location even if location is misspelled
- Can detect informal sayings of locations like "stud" for the student center
- Uses a database of mit buildings/general locations gathered from MIT facilities and the google maps python geocode API
- The algorithm runs on an on-demand refresh rate, so posts during the day appear fast and throttles down during the night when posts are less frequent
- Optimized map rendering using meteor isolate tags

3.Features for the Future (near future)
----
 - We still would like to add post management to Dibs. Currently it offers as much as the reuse mailing list, but we are close to adding additional features like retracting a post. We just need to add a button/interface to complete such action. 

4.Features Beyond the MVP
----
 - We still plan on adding keyword functionality that allows users to autoclaim or highlight posts of interest (we already have a framework setup for storing users keywords)
 - We are adding pop up instructions on how to use the site.

5.Back-end Technology
----
- Meteor.js
- Parse
- Custom Python Email parsing
- Gmail python lib https://github.com/charlierguo/gmail
- Parse python lib https://github.com/dgrtwo/ParsePy
- Mongo (part of meteor)

6.Front-end Technology
----
- Meteor.js
- jQuery
- Font awesome
- Fancybox
- Bootsrap
- Handlebars (part of Meteor)
- Node (part of meteor)

7.Target Browser
----
Google Chrome

8.Risks
----
We are worried about users creating fake accounts and posting inappropriate messages. We are developing a report users features to help alleviate this risk.
Additionally, we are contemplating email verification.
