# Miami Herald Zika Tracker

## About

Visualizing the and tracking Zika cases in the state of Florida, the US and it's territories

## Installation

Based off of [Gulp Starter](https://github.com/vigetlabs/gulp-starter).

Extra additions include:
- [Bourbon](http://bourbon.io/) and [Bourbon Neat](http://neat.bourbon.io/)
- [D3](https://d3js.org/) and [Topojson](https://github.com/mbostock/topojson)
- [jQuery](https://jquery.com/)
- [Greensock](https://greensock.com/gsap)
- [ScrollMagic](http://scrollmagic.io/)
- [pym.js](http://blog.apps.npr.org/pym.js/)

```
git clone https://github.com/MiamiHerald/data-viz_zika-tracker.git zika-tracker
cd zika-tracker
npm install
```

### A note about Node

After installing, you'll need to use [nvm (Node Version Manager)](https://github.com/creationix/nvm) to switch to Node `v5.12.0` or earlier as there is an issue with Node 6. See [#302](https://github.com/vigetlabs/gulp-starter/issues/302).

To remove git and add your own repo run `rm -rf .git && git init`

### Serving

`npm start`

Your browser should open with [http://localhost:3000](http://localhost:3000), browsersync should be active and you should be ready to go :rocket:.

## How to upload index.html to content studio

* Go to `public` after running `npm run production`

* Copy the contents of `index.html` from `<!-- START COPY -->` through `<!-- STOP COPY -->`

* Paste the contents in Content Studio inside `<!-- PASTE BELOW -->` through `<!-- PASTE ABOVE -->`

### Help

email: cwilliams at miamiherald dot com :thumbsup:
