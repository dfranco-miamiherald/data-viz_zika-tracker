// external libraries
import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { TweenMax, TweenLite } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class BubbleMapUS {
  // constructor method to setup variables to be used in the vizualization
  constructor(el, dataUrl, shapeUrl) {
    this.el = el;
    this.dataUrl = dataUrl;
    this.aspectRatio = 0.6663; // rectangular (2/3) map aspectRatio
    this.width = $(this.el).width();
    this.height = Math.ceil(this.aspectRatio * this.width);
    this.mapWidth = this.width;
    this.shapeUrl = shapeUrl;
    this.dataColumn = 'total';
    this.totals = [
      '.bubble-map__stat--local-us',
      '.bubble-map__stat--travel-us',
      '.bubble-map__stat--total-us',
      '.bubble-map__stat--donor-us'
    ];
  }

  render() {
    // initialize the zoom level for the map
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', () => {
        this.svg.attr('transform', d3.event.transform);
      });

    // render the SVG
    this.svg = d3.select(this.el).append('svg')
        .attr('width', '100%')
        .attr('height', this.height)
        .attr('class', 'bubble-map__svg-us')
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

      d3.select('.bubble-map__svg-us').attr('height', this.height);

      this.resizeBubbles();
    });
  }

  loadData() {
    // load the shapeData and the bubble map data (this.dataUrl)
    d3.queue()
      .defer(d3.json, this.shapeUrl)
      .defer(d3.json, this.dataUrl)
      .await(this.drawMap.bind(this));
  }

  drawMap(error, shapeData, caseData) {
    if (error) throw error;

    // set the shapeData and caseData to lexical this variables
    // so that they can be used outside of the drawMap function
    this.shapeData = shapeData;
    this.caseData = caseData;
    const states = topojson.feature(this.shapeData, this.shapeData.objects.states).features;

    $('.bubble-map__stat--wrapper--us').addClass('is-animating');
    $('#section-2 .tabs').addClass('is-animating');
    $('#section-2 .slider__outer').addClass('is-animating');
    this.drawSlider();
    this.drawTooltip();
    this.totals.forEach(i => {
      this.setTotals(i);
    });

    // fit the projection of the map to the size of the shape data
    this.projection = d3.geoAlbersUsa()
      .fitSize([this.width, this.height], topojson.feature(this.shapeData, this.shapeData.objects.states));

    this.path = d3.geoPath()
      .projection(this.projection);

    // draw the boundary paths for the counties
    this.svg.append('g')
        .attr('class', 'bubble-map__states')
      .selectAll('path')
        .data(states)
      .enter().append('path')
        .attr('class', 'bubble-map__state')
        .attr('d', this.path);

    this.max = this.caseData[this.caseData.length - 1].statesTotal;

    this.radius = d3.scaleSqrt()
        .domain([0, this.max])
        .range([0, 100]);

    // draw the bubbles on the map the map
    this.svg.append('g')
        .attr('class', 'bubble-map__bubble')
      .selectAll('circle')
        .data(topojson.feature(this.shapeData, this.shapeData.objects.states).features
          .sort((a, b) => {
            if (this.caseData[this.caseData.length - 1].states[b.id] && this.caseData[this.caseData.length - 1].states[a.id]) {
              return this.caseData[this.caseData.length - 1].states[b.id][this.dataColumn] - this.caseData[this.caseData.length - 1].states[a.id][this.dataColumn];
            }
          }))
      .enter().append('circle')
        .attr('transform', (d) => `translate(${this.path.centroid(d)})`)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].states[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]);
          }
        })
        // set hover state (mouseover / mouseout) for bubbles
        .on('mouseover', (d) => {
          this.mouse = d3.mouse(this.svg.node()).map((d) => parseInt(d));
          this.tooltip
            .classed('is-active', true)
            .style('left', `${(this.mouse[0])}px`)
            .style('top', `${(this.mouse[1])}px`)
            .html(() => {
              if (this.dataColumnPerMil === 'perMil') {
                if (this.dataColumn === 'total') {
                  if (this.caseData[this.unformatSlider()].states[d.id].perMillionTotal != 1) {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTotal} cases per million`;
                  } else {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTotal} case per million`;
                  }
                } else if (this.dataColumn === 'local') {
                  if (this.caseData[this.unformatSlider()].states[d.id].perMillionLocal != 1) {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionLocal} cases per million`;
                  } else {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionLocal} case per million`;
                  }
                } else if (this.dataColumn === 'travel') {
                  if (this.caseData[this.unformatSlider()].states[d.id].perMillionTravel != 1) {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTravel} cases per million`;
                  } else {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTravel} case per million`;
                  }
                } else if (this.dataColumn === 'donor') {
                  if (this.caseData[this.unformatSlider()].states[d.id].perMillionDonor != 1) {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionDonor} cases per million`;
                  } else {
                    return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionDonor} case per million`;
                  }
                }
              } else {
                if (this.caseData[this.unformatSlider()].states[d.id][this.dataColumn] != 1) {
                  return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} cases`;
                } else {
                  return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} case`;
                }
              }
            });

            var $usMobileTooltip = $('.bubble-map__tooltip-mobile--us');
            if (this.dataColumnPerMil === 'perMil') {
              if (this.dataColumn === 'total') {
                if (this.caseData[this.unformatSlider()].states[d.id].perMillionTotal != 1) {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTotal} cases per million`);
                } else {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTotal} case per million`);
                }
              } else if (this.dataColumn === 'local') {
                if (this.caseData[this.unformatSlider()].states[d.id].perMillionLocal != 1) {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionLocal} cases per million`);
                } else {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionLocal} case per million`);
                }
              } else if (this.dataColumn === 'travel') {
                if (this.caseData[this.unformatSlider()].states[d.id].perMillionTravel != 1) {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTravel} cases per million`);
                } else {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionTravel} case per million`);
                }
              } else if (this.dataColumn === 'donor') {
                if (this.caseData[this.unformatSlider()].states[d.id].perMillionDonor != 1) {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionDonor} cases per million`);
                } else {
                  $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id].perMillionDonor} case per million`);
                }
              }
            } else {
              if (this.caseData[this.unformatSlider()].states[d.id][this.dataColumn] != 1) {
                $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} cases`);
              } else {
                $usMobileTooltip.html(`${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} case`);
              }
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
        this.setDate();
      });
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
    this.stepSlider = $('#js-slider-us')[0];
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
        triggerElement: '#section-2',
        duration: $('#section-2').outerHeight() - 20,
        triggerHook: 'onLeave'
      })
    	.setPin('#section-2-sticky', { pushFollowers: false })
      .on('enter', (event) => {
        this.stepSlider.noUiSlider.set(this.caseData.length - 1);
      })
    	.addTo(controller);

    // create click functions for slider controls
    $('.js-play--us').click(() => {
      this.stepSlider.noUiSlider.set(this.caseData.length - 1);
    });
    $('.js-step-down--us').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() - 1);
    });
    $('.js-step-up--us').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() + 1);
    });
    $('.js-reset--us').click(() => {
      this.stepSlider.noUiSlider.set(0);
    });
  }

  resizeBubbles() {
    // when resizeBubbles is called, data is grabbed from the active tab
    // and used to render the radii of the bubbles based on the position of the slider
    this.dataColumn = $('.tabs__link--us.is-active').data('case');
    this.dataColumnPerMil = $('.tabs__link--us-mil.is-active').data('number');

    this.svg
      .selectAll('circle')
        .transition()
        .duration(750)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].states[d.id]) {
            if (this.dataColumnPerMil === 'perMil') {
              if (this.dataColumn === 'total') {
                return this.radius(this.caseData[this.unformatSlider()].states[d.id].perMillionTotal);
              } else if (this.dataColumn === 'local') {
                return this.radius(this.caseData[this.unformatSlider()].states[d.id].perMillionLocal);
              } else if (this.dataColumn === 'travel') {
                return this.radius(this.caseData[this.unformatSlider()].states[d.id].perMillionTravel);
              } else if (this.dataColumn === 'donor') {
                return this.radius(this.caseData[this.unformatSlider()].states[d.id].perMillionDonor);
              }
            } else {
              return this.radius(this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]);
            }
          }
        });

    this.max = this.caseData[this.unformatSlider()].stateTotalTravel;
  }

  switchTabs() {
    // when switching between tabs, zoom back out and toggle the is-active classes
    $('.tabs__link--us').click((e) => {
      e.preventDefault();

      this.zoom.scaleTo(this.svg, 1);
      $('.tabs__link--us').removeClass('is-active');
      $(e.currentTarget).addClass('is-active');

      this.resizeBubbles();
    });

    $('.tabs__link--us-mil').click(() => {
      event.preventDefault();

      $('.tabs__link--us-mil').removeClass('is-active');
      $(event.currentTarget).addClass('is-active');

      this.resizeBubbles();

      this.totals.forEach(i => {
        this.setTotals(i);
      });
    });
  }

  setTotals(el) {
    // when set totals is called a counter varible is initialized.
    // depending on which element is passed to setTotals (and what position the silder is currently at AND wheter perMil or total is selected),
    // a different counterEnd variable is set
    this.dataColumnPerMil = $('.tabs__link--us-mil.is-active').data('number');
    var counterStart = {var: $(el).text()};
    var counterEnd = null;

    if (this.dataColumnPerMil === 'total') {
      if (el === '.bubble-map__stat--local-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].statesTotalLocal};
      } else if (el === '.bubble-map__stat--travel-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].statesTotalTravel};
      } else if (el === '.bubble-map__stat--total-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].statesTotal};
      } else if (el === '.bubble-map__stat--donor-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].statesTotalDonor};
      }
    } else if (this.dataColumnPerMil === 'perMil') {
      if (el === '.bubble-map__stat--local-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionStatesTotalLocal};
      } else if (el === '.bubble-map__stat--travel-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionStatesTotalTravel};
      } else if (el === '.bubble-map__stat--total-us') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionStatesTotal};
      } else if (el === '.bubble-map__stat--total-donor') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionStatesTotalDonor};
      }
    }

    // Use the TweenMax library to animate between counterStart and counterEnd
    TweenMax.to(counterStart, 0.3, {var: counterEnd.var, onUpdate: () => {
        $(el).html(Math.ceil(counterStart.var));
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
      $('#js-date-us').html(moment(this.caseData[this.unformatSlider()].date).format('MMM. D, YYYY'));
    } else {
      $('#js-date-us').html(moment(this.caseData[this.unformatSlider()].date).format('MMMM D, YYYY'));
    }
  }

}

const loadBubbleMapUS = () => {
  const $bubbleMap = $('.js-bubble-map-us');

  $bubbleMap.each((index) => {
    const $this = $bubbleMap.eq(index);
    const id = $this.attr('id');
    const dataUrl = $this.data('url');
    const shapeUrl = $this.data('shape');

    new BubbleMapUS(`#${id}`, dataUrl, shapeUrl).render();
  });
};

export { loadBubbleMapUS };
