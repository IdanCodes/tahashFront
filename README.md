# Tahash
The website is running at <https://comp.ilcubers.com>

## What is this project?
Tahash (תח״ש - תחרות שבועית) is a website for the weekly competition for the Israeli cubing community, [ILCubers](https://www.ilcubers.com).
Anyone with a [WCA](https://www.worldcubeassociation.org/) account is able to sign in and compete. New scrambles are generated automatically every week and results are posted on the website.

### Motivation
For more than 5 years, every week a member of the community had to manually generate new scrambles for each event, verify and format results submitted via Google Forms, which would often take a few hours.
In addition, using the old system was a very bad experience for the user, running on a free tier Wix website.

In the beggining of 2025 I knew this system could be improved a lot and even automated, which is why I started working on this project.

On 24/12/2025, after a year of work the website was finally ready and the first version was published.

A huge thanks to [Omri Kehila](https://github.com/omroux) and [Sol Trivish](https://github.com/solhtml) for help with deployment and design.

### Version History
The website started as a simple JS website with [ExpressJS](https://www.expressjs.com/) in around February 2025.
When the project expanded, I knew I had to make the code base more expandable so I converted everything to TypeScript and moved to React, which took a few weeks but helped a lot in the long run.
Since then I took a break for a few months, the server moved to a more stable VPS and now I continue maintaining and developing the system further.

## Technical Details
The website itself is written in TypeScript with React and deployed with Vite, database is MongoDB and authentication is through the [WCA OAuth API](https://www.worldcubeassociation.org/help/api). API is written in TypeScript using ExpressJS.

