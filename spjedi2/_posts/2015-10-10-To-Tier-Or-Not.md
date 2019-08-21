---
layout: post
title: To Tier or Not To Tier SharePoint
categories: blog
sitemap: false
---
In the most simple terms Tier setup as it relates to SharePoint cover how many servers you are going to have in your environment. Many people have different opinions on this topic, but rarely cover the pro's and con's of each one. Our stance at SPJedi is three tier for a company large than 50 people and more than 40GB of data. We will discuss below each options and talk about why each one is used:

## Single Tier
Single tier is a setup in which SQL is installed on the same server as the SharePoint instance. This can cause a lot of issue if not done properly. The main purpose of this setup is to avoid another license for an additional server, but the reality is that it is not very stable. Single Tier should really only be used for testing a setup. We here at SPJedi have three instances like this of all the releases to ensure our packages work properly on 2007/2010/2016. Our main environment is currently 2013 and Office 365. It is very hard to take a single tier setup to a two or three tier environment. Many times this leads to issues with SQL and consistency errors can arise rather quickly. 

## Two Tier

A very common setup and many companies prefer this method. Two tier means you have one server running all of your SharePoint front end and backend processes. Another server is running your SQL server. This setup is not hard to make a three tier confirguration. When moving to a three tier configuration from a two it requires a lot of stopping services and changing of IIS records. It is recommended you reach out to a Subject Matter Expert if you are not familiar with SharePoint. They should not bill more than 5 hours for something like this. TIME WELL WORTH IT. A common issue with this is the site can get bogged down and cause an impact to your users resulting in frustration with another Enterprise System. SPJedi does use this setup for Hybrid models (a topic for another day). When your data is mainly feeding up to the cloud and very few are going to the local site you can get away with this type of setup for larger than 50 users. 

## Three Tier (or more)

Three tier or more is the safest deployment of SharePoint on your local environment. One runs the backend and Central Admin (generally called APP Server) along with your crawler services. Another server to run SQL by itself. The final would be a Web Front End (the main IP address everyone would access). When you have a large amount of users you are able to deploy multiple web front ends and Load Balance them so the server does not get overwhelmed. You can also deploy a Web Server in a different location and link it to the APP Server in your main office to avoid lag for users in other states. Three Tier installation is the more complex process, but done through PowerShell and not using wizards the process is quite easy. Powershell will give you more control over the services starting and IIS records. SPJedi can answer any questions you have at no cost. We want to make sure SharePoint is used and understood. Building a SharePoint community is good for all parties. 

![Tiersetup](/img/TierSetup.jpg)
