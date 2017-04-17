// external libraries
import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { TweenLite, TweenMax } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class BubbleMapFl {
  // constructor method to setup variables to be used in the vizualization
  constructor(el, dataUrl, shapeUrl, feedUrl) {
    this.el = el;
    this.dataUrl = dataUrl;
    this.shapeUrl = shapeUrl;
    this.newsUrl = feedUrl;
    this.aspectRatio = 0.6663; // rectangular (2/3) map aspectRatio
    this.width = $(this.el).width();
    this.height = Math.ceil(this.aspectRatio * this.width);
    this.mapWidth = this.width;
    this.dataColumn = 'total';
    this.totals = [
      '.bubble-map__stat--local-fl',
      '.bubble-map__stat--travel-fl',
      '.bubble-map__stat--total-fl',
      '.bubble-map__stat--pregnant-fl',
      '.bubble-map__stat--undetermined-fl',
      '.bubble-map__stat--unknown-fl'
    ];
    this.newsFeedWrapper = $('#newsFeedOuter');
    this.articleFound = false;
    this.scrolling;
  }

  render() {
    // initialize the zoom level for the map
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', () => {
        this.svg.attr('transform', d3.event.transform);
        $('.legend').addClass('is-hidden');
      });

    // render the SVG
    this.svg = d3.select(this.el)
        .append('svg')
        .attr('width', '100%')
        .attr('height', this.height)
        .attr('class', 'bubble-map__svg-fl')
        .call(this.zoom)
        .on("wheel.zoom", null) // disable certain click/touch events
        .on("touchmove.zoom", null)
        .on("dblclick.zoom", null)
        .on("touchstart.zoom", null)
        .append('g');

    this.loadData();

    $(window).on('resize', this.resizeBubbleMap.bind(this));
    $(window).trigger('resize');
  }


  resizeBubbleMap() {
    window.requestAnimationFrame(() => {
      // responsive logic to resize map and maintain aspect ratio and height
      // when window is resized
      const chart = $(this.el).find(`g`).first();

      this.width = $(this.el).width();
      this.height = Math.ceil(this.aspectRatio * this.width);

      d3.select('.bubble-map__svg-fl').attr('height', this.height);

      this.resizeBubbles();
    });
  }

  loadData() {
    // load the shapeData, the bubble map data (this.dataUrl), and the newsfeed data
    d3.queue()
      .defer(d3.json, this.shapeUrl)
      .defer(d3.json, this.dataUrl)
      .defer(d3.csv, this.newsUrl)
      .await(this.drawMap.bind(this));
  }

  drawMap(error, shapeData, caseData, newsData) {
    if (error) throw error;

    // set the shapeData, caseData and newsData to lexical this variables
    // so that they can be used outside of the drawMap function
    this.shapeData = shapeData;
    this.caseData = caseData;
    this.newsData = newsData;

    const counties = topojson.feature(this.shapeData, this.shapeData.objects.places).features;

    $('.bubble-map__stat--wrapper--fl').addClass('is-animating');
    this.drawSlider();
    this.drawTooltip();
    this.totals.forEach(i => {
      this.setTotals(i);
    });

    // fit the projection of the map to the size of the shape data
    this.projection = d3.geoEquirectangular()
      .fitSize([this.width, this.height], topojson.feature(this.shapeData, this.shapeData.objects.places));

    this.path = d3.geoPath()
      .projection(this.projection);

    // draw the boundary paths for the counties
    this.svg.append('g')
        .attr('class', 'bubble-map__counties')
      .selectAll('path')
        .data(counties)
      .enter().append('path')
        .attr('class', 'bubble-map__county')
        .attr('d', this.path);

    // change the radii based on the screensize using the Modernizr.mq
    this.max = this.caseData[0].totalTravel;
    let query = Modernizr.mq('(min-width: 640px)');
    if (query) {
      this.radius = d3.scaleSqrt()
          .domain([0, this.max])
          .range([0, 5]);
    } else {
      this.radius = d3.scaleSqrt()
          .domain([0, this.max])
          .range([0, 2]);
    }

    // draw the bubbles on the map the map
    this.svg.append('g')
        .attr('class', 'bubble-map__bubble')
      .selectAll('circle')
        .data(topojson.feature(this.shapeData, this.shapeData.objects.places).features
          .sort((a, b) => {
            return this.caseData[this.caseData.length - 1].counties[b.id][this.dataColumn] - this.caseData[this.caseData.length - 1].counties[a.id][this.dataColumn];
          }))
      .enter().append('circle')
        .attr('transform', (d) => `translate(${this.path.centroid(d)})`)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].counties[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]);
          }
        })
        // set hover state (mouseover / mouseout) for bubbles
        .on('mouseover', (d) => {
          this.mouse = d3.mouse(this.svg.node()).map((d) => parseInt(d));
          this.tooltip
            .classed('is-active', true)
            .style('left', `${(this.mouse[0])}px`)
            .style('top', `${(this.mouse[1])}px`)
            .html(() =>  {
              if (this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn] > 1) {
                return `${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} cases`;
              } else {
                return `${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} case`;
              }
            });

            if (this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn] > 1) {
              $('.bubble-map__tooltip-mobile--fl').html(`${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} cases`);
            } else {
              $('.bubble-map__tooltip-mobile--fl').html(`${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} case`);
            }
        })
        .on('mouseout', (d) => {
          this.tooltip
            .classed('is-active', false);
        });

    // call the resizeBubbles function when the noUiSlider updates,
    // also call the setTotals function to animate the numbers
    this.stepSlider.noUiSlider.on('update', this.resizeBubbles.bind(this));
    this.stepSlider.noUiSlider.on('update', () => {
      this.totals.forEach(i => {
        this.setTotals(i);
      });
      this.setDate();
      this.updateNewsFeed();
    });
    this.switchTabs();
  }

  drawTooltip() {
    this.tooltip = d3.select(this.el)
      .append('div')
      .attr('class', 'bubble-map__tooltip');
  }

  drawSlider () {
    // initialize the noUiSlider
    this.stepSlider = $('#js-slider-fl')[0];
    let slider = noUiSlider.create(this.stepSlider, {
      start: 0,
      step: 1,
      range: {
        'min': [ 0 ],
        'max': [ this.caseData.length - 1 ]
      }
    });

    // initialize the ScrollMagic controller and create a new Scene
    // which will set a pin on the sticky nav onEnter and onLeave
    var controller = new ScrollMagic.Controller();
    var scene = new ScrollMagic.Scene({
        triggerElement: '#section-1',
        duration: $('#section-1').outerHeight() - 20,
        triggerHook: 'onLeave'
      })
    	.setPin('#section-1-sticky', { pushFollowers: false })
      .on('enter', (event) => {
        this.stepSlider.noUiSlider.set(this.caseData.length - 1);
      })
    	.addTo(controller);

    // create click functions for slider controls
    $('.js-play--fl').click(() => {
      this.stepSlider.noUiSlider.set(this.caseData.length - 1);
    });
    $('.js-step-down--fl').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() - 1);
    });
    $('.js-step-up--fl').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() + 1);
    });
    $('.js-reset--fl').click(() => {
      this.stepSlider.noUiSlider.set(0);
    });

    this.setNewsFeed();
  }

  resizeBubbles() {
    // when resizeBubbles is called, data is grabbed from the active tab
    // and used to render the radii of the bubbles based on the position of the slider
    this.dataColumn = $('.tabs__link--fl.is-active').data('case');

    this.svg
      .selectAll('circle')
        .transition()
        .duration(250)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].counties[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]);
          }
        });
    this.max = this.caseData[this.unformatSlider()].totalTravel;
  }

  switchTabs() {
    // when switching between tabs, zoom back out and toggle the is-active classes
    $('.tabs__link--fl').click((e) => {
      e.preventDefault();

      this.zoom.scaleTo(this.svg, 1);
      $('.tabs__link--fl').removeClass('is-active');
      $(e.currentTarget).addClass('is-active');

      this.resizeBubbles();
    });
  }

  setTotals(el) {
    // when set totals is called a counter varible is initialized.
    // depending on which element is passed to setTotals (and what position the silder is currently at),
    // a different counterEnd variable is set
    var counterStart = {var: $(el).text()};
    var counterEnd = null;

    if (el === '.bubble-map__stat--local-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].totalLocal};
    } else if (el === '.bubble-map__stat--travel-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].totalTravel};
    } else if (el === '.bubble-map__stat--total-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].totalCases};
    } else if (el === '.bubble-map__stat--pregnant-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].pregnant};
    } else if (el === '.bubble-map__stat--unknown-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].unknown};
    } else if (el === '.bubble-map__stat--undetermined-fl') {
      counterEnd = {var: this.caseData[this.unformatSlider()].undetermined ? this.caseData[this.unformatSlider()].undetermined : 0};
    }

    // Use the TweenMax library to animate between counterStart and counterEnd
    TweenMax.to(counterStart, 0.3, {var: counterEnd.var, onUpdate: () => {
        $(el).text(Math.ceil(counterStart.var));
      },
      ease:Circ.easeOut
    });
  }

  unformatSlider() {
    // utility function that uses the numeral JS library to get the current position of the slider
    return numeral().unformat(this.stepSlider.noUiSlider.get());
  }

  setDate() {
    // utility function that uses the moment library to set the format of the date properly
    if (moment(this.caseData[this.unformatSlider()].date).format('MMMM').length > 5) {
      $('#js-date-fl').html(moment(this.caseData[this.unformatSlider()].date).format('MMM. D, YYYY'));
    } else {
      $('#js-date-fl').html(moment(this.caseData[this.unformatSlider()].date).format('MMMM D, YYYY'));
    }
  }

  setNewsFeed() {
    // for each article in the newsData append an anchor link with a formatted date
    // to this.newsFeedWrapper
    this.newsData.forEach((article, index) => {
      if (moment(article.datePublished).format('MMMM').length > 5) {
        this.newsFeedWrapper.append(
          `<a href="${article.articleUrl}" target="_blank" class="newsfeed__article">
            ${article.articleHeadline} <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
            <br><span class="newsfeed__date">${moment(article.datePublished).format('MMM. D, YYYY')}</span>
          </a>`
        );
      } else {
        this.newsFeedWrapper.append(
          `<a href="${article.articleUrl}" target="_blank" class="newsfeed__article">
            ${article.articleHeadline} <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
            <br><span class="newsfeed__date">${moment(article.datePublished).format('MMMM D, YYYY')}</span>
          </a>`
        );
      }
    });
  }

  updateNewsFeed() {
    // when updateNewsFeed is called, the slider position is checked,
    // if the date of the article is the same or before the current date,
    // set that to the current active newsfeed article
    let articlePosition = 0;
    let sliderDate = moment(this.caseData[this.unformatSlider()].date, 'YYYY-M-D');
    this.newsData.forEach((article, index) => {
      if (moment(article.datePublished, 'M/D/YYYY').isSameOrBefore(sliderDate)) {
        articlePosition = index;
      }
    });
    $('.newsfeed__article').removeClass('is-active');
    let article = $('.newsfeed__article')[articlePosition];
    $(article).addClass('is-active');
  }
}

const loadBubbleMapFl = () => {
  const $bubbleMap = $('.js-bubble-map-fl');

  // for each element with the js-bubble-map-fl class create extract the data attributes
  $bubbleMap.each((index) => {
    const $this = $bubbleMap.eq(index);
    const id = $this.attr('id');
    const dataUrl = $this.data('url');
    const shapeUrl = $this.data('shape');
    const feedUrl = $this.data('feed');

    // create a new BubbleMapFl class with the URL variables and call the render function
    new BubbleMapFl(`#${id}`, dataUrl, shapeUrl, feedUrl).render();
  });
};

export { loadBubbleMapFl };
