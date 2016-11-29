import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { TweenLite } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';

class BubbleMapUS {
  constructor(el, dataUrl, shapeUrl) {
    this.el = el;
    this.dataUrl = dataUrl;
    this.aspectRatio = 0.6667;
    this.margin = {top: 0, right: 0, bottom: 0, left: 0};
    this.width = $(this.el).width() - this.margin.left - this.margin.right;
    this.height = Math.ceil(this.aspectRatio * (this.width - this.margin.top - this.margin.bottom));
    this.mapWidth = this.width;
    this.shapeUrl = shapeUrl;
    this.dataColumn = 'total';
    this.totals = [
      '.bubble-map__stat--local-us',
      '.bubble-map__stat--travel-us',
      '.bubble-map__stat--total-us'
    ];
  }

  render() {
    this.svg = d3.select(this.el).append('svg')
        .attr('width', '100%')
        .attr('height', this.height)
        .attr('class', 'bubble-map__svg-us')
        .append('g');

    this.loadData();
    this.resizeBubbleMap();
    $(window).on('resize', this.resizeBubbleMap.bind(this));
  }


  resizeBubbleMap() {
    window.requestAnimationFrame(() => {
      const chart = $(this.el).find(`g`).first();

      this.width = $(this.el).width() - this.margin.left - this.margin.right;
      this.height = Math.ceil(this.aspectRatio * (this.width - this.margin.top - this.margin.bottom));

      TweenLite.set(chart, { scale: this.width / this.mapWidth });
      d3.select('.bubble-map__svg-us').attr('height', this.height);
    });
  }

  loadData() {
    d3.queue()
      .defer(d3.json, this.shapeUrl)
      .defer(d3.json, this.dataUrl)
      .await(this.drawMap.bind(this));
  }

  drawMap(error, shapeData, caseData) {
    if (error) throw error;

    this.shapeData = shapeData;
    this.caseData = caseData;
    const states = topojson.feature(this.shapeData, this.shapeData.objects['states']).features

    $('.bubble-map__stat--wrapper--us').addClass('is-animating');
    this.drawSlider();
    this.drawTooltip();
    this.totals.forEach(i => {
      this.setTotals(i);
    });

    this.projection = d3.geoAlbersUsa()
      .fitSize([this.width, this.height], topojson.feature(this.shapeData, this.shapeData.objects['states']));

    this.path = d3.geoPath()
      .projection(this.projection);

    this.svg.append('g')
        .attr('class', 'bubble-map__states')
      .selectAll('path')
        .data(states)
      .enter().append('path')
        .attr('class', 'bubble-map__state')
        .attr('d', this.path);

    this.max = this.caseData[0].stateTotalTravel;
    this.radius = d3.scaleSqrt()
        .domain([0, this.max])
        .range([0, 3.5]);

    this.svg.append('g')
        .attr('class', 'bubble-map__bubble')
      .selectAll('circle')
        .data(topojson.feature(this.shapeData, this.shapeData.objects['states']).features
          .sort((a, b) => {
            if (this.caseData[this.caseData.length - 1].states[b.id] && this.caseData[this.caseData.length - 1].states[a.id]) {
              return this.caseData[this.caseData.length - 1].states[b.id][this.dataColumn] - this.caseData[this.caseData.length - 1].states[a.id][this.dataColumn]
            }
          }))
      .enter().append('circle')
        .attr('transform', (d) => `translate(${this.path.centroid(d)})`)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].states[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]);
          }
        })
        .on('mouseover', (d) => {
          this.mouse = d3.mouse(this.svg.node()).map((d) => parseInt(d))
          this.tooltip
            .classed('is-active', true)
            .style('left', `${this.mouse[0]}px`)
            .style('top', `${this.mouse[1]}px`)
            .html(() => {
              if (this.caseData[this.unformatSlider()].states[d.id][this.dataColumn] > 1) {
                return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} cases`
              } else {
                return `${d.properties.name}: ${this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]} case`
              }
            });
        })
        .on('mouseout', (d) => {
          this.tooltip
            .classed('is-active', false);
        });


    this.stepSlider.noUiSlider.on('update', this.resizeBubbles.bind(this))
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
    this.stepSlider = $('#js-slider-us')[0];
    let slider = noUiSlider .create(this.stepSlider, {
      animate: true,
      animationDuration: 3000,
      start: 0,
      step: 1,
      range: {
        'min': [ 0 ],
        'max': [ this.caseData.length - 1 ]
      }
    });

    $(() => this.stepSlider.noUiSlider.set(this.caseData.length - 1));

    $('.js-play--us').click(() => {
      this.stepSlider.noUiSlider.set(this.caseData.length - 1);
    });
    $('.js-step-down--us').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() - 1);
    });
    $('.js-step-up--us').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() + 1);
    });
  }

  resizeBubbles() {
    this.dataColumn = $('.tabs__link--us.is-active').data('case');

    this.svg
      .selectAll('circle')
        .transition()
        .duration(750)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].states[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].states[d.id][this.dataColumn]);
          }
        });

    this.max = this.caseData[this.unformatSlider()].stateTotalTravel;
  }

  switchTabs() {
    $('.tabs__link--us').click(() => {
      event.preventDefault();

      $('.tabs__link--us').removeClass('is-active');
      $(event.currentTarget).addClass('is-active');

      this.resizeBubbles();
    })
  }

  setTotals(el) {
    var counterStart = {var: $(el).text()};
    if (el === '.bubble-map__stat--local-us') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].stateTotalLocal};
    } else if (el === '.bubble-map__stat--travel-us') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].stateTotalTravel};
    } else if (el === '.bubble-map__stat--total-us') {
      var counterEnd = {var: +this.caseData[this.unformatSlider()].stateTotalLocal + +this.caseData[this.unformatSlider()].stateTotalTravel};
    }

    TweenMax.to(counterStart, 0.3, {var: counterEnd.var, onUpdate: () => {
        $(el).html(Math.ceil(counterStart.var));
      },
      ease:Circ.easeOut
    });
  }

  unformatSlider() {
    return numeral().unformat(this.stepSlider.noUiSlider.get());
  }

  setDate() {
    $('#js-date-us').html(moment(this.caseData[this.unformatSlider()].date).format('MMM. D, YYYY'));
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
}

export { loadBubbleMapUS };
