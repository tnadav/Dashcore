Dashcore
========

Why creating yet another JavaScript library?
--------------------------------------------

*	First of all, Dashcore is not a regular Javascript library, it's a library specialized
	to be used for creating a dashboard widget. Regular Javascript on the web environment
	is only assisting the web page to create better experience. On Dashboard, widgets are
	small applications, and Javascript has a big rule in term of functionality.

*	Second, some components are unique to dashboard, such as Preferences, Instance preferences
    and i18n.

*	Third, other libraries have to deal with supporting other browser, which adds an additional 
    overhead, this library doesn't because it doesn't need to.

*	Forth, when developing a library a lot of files is a problem because this makes a lot
    of HTTP requstes. This library use as much files as it can, in order make it as modular as
    it can.

*	Finally, I just wanted to write  a JavaScript library so I wrote all this reasons to
	convince myself that I should write it :).

Currently, only the core exists but it's still not yet a final realize.

Sorry for my poor english, as you can see English isn't my native language, and it will
affect my comments. I hope that you will enjoy using Dashcore.