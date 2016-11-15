import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { TweenLite } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';

class BubbleMap {
  constructor(el, dataUrl) {
    this.el = el;
    this.dataUrl = dataUrl;
    this.aspectRatio = 0.6667;
    this.margin = {top: 0, right: 0, bottom: 0, left: 0};
    this.width = $(this.el).width() - this.margin.left - this.margin.right;
    this.height = Math.ceil(this.aspectRatio * (this.width - this.margin.top - this.margin.bottom));
    this.mapWidth = this.width;
    this.shapeUrl = 'data/florida-counties.json';
    // this.shapeUrl = 'http://pubsys.miamiherald.com/static/media/projects/2016/zika-interactive-v2/site/data/florida-counties.json';
    this.dataColumn = 'total'
    this.totals = ['.bubble-map__stat--local', '.bubble-map__stat--travel', '.bubble-map__stat--total', '.bubble-map__stat--pregnant', '.bubble-map__stat--non-resident', '.bubble-map__stat--unknown']
  }

  render() {
    this.svg = d3.select(this.el).append('svg')
        .attr('width', '100%')
        .attr('class', 'bubble-map__svg')
        .append('g');

    this.filter = this.svg.append('defs')
        .append('filter')
        .attr('id', 'drop-shadow')
        .attr('height', '130%');

    this.filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 5)
        .attr('result', 'blur');

    this.filter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 5)
        .attr('dy', 5)
        .attr('result', 'offsetBlur');

    this.feMerge = this.filter.append('feMerge');

    this.feMerge.append('feMergeNode')
        .attr('in', 'offsetBlur')
    this.feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

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
      d3.select('.bubble-map__svg').attr('height', this.height);
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
    const counties = topojson.feature(this.shapeData, this.shapeData.objects['florida-counties']).features

    $('.bubble-map__stat--wrapper').addClass('is-animating');
    this.drawSlider();
    this.drawTooltip();
    this.totals.forEach(i => {
      this.setTotals(i);
    });

    this.projection = d3.geoEquirectangular()
      .fitSize([this.width, this.height], topojson.feature(this.shapeData, this.shapeData.objects['florida-counties']));

    this.path = d3.geoPath()
      .projection(this.projection);

    this.svg.append('g')
        .attr('class', 'bubble-map__counties')
        .style('filter', 'url(#drop-shadow)')
      .selectAll('path')
        .data(counties)
      .enter().append('path')
        .attr('class', 'bubble-map__county')
        .attr('d', this.path);

    this.max = this.caseData[0].totalTravel;
    this.radius = d3.scaleSqrt()
        .domain([0, this.max])
        .range([0, 5]);

    this.svg.append('g')
        .attr('class', 'bubble-map__bubble')
      .selectAll('circle')
        .data(topojson.feature(this.shapeData, this.shapeData.objects['florida-counties']).features
          .sort((a, b) => {
            if (this.caseData[this.caseData.length - 1].counties[b.id] && this.caseData[this.caseData.length - 1].counties[a.id]) {
              return this.caseData[this.caseData.length - 1].counties[b.id][this.dataColumn] - this.caseData[this.caseData.length - 1].counties[a.id][this.dataColumn]
            }
          }))
      .enter().append('circle')
        .attr('transform', (d) => `translate(${this.path.centroid(d)})`)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].counties[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]);
          }
        })
        .on('mouseover', (d) => {
          this.mouse = d3.mouse(this.svg.node()).map((d) => parseInt(d))
          this.tooltip
            .classed('is-active', true)
            .style('left', `${this.mouse[0]}px`)
            .style('top', `${this.mouse[1]}px`)
            .html(() => {
              if (this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn] > 1) {
                return `${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} cases`
              } else {
                return `${d.properties.county}: ${this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]} case`
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
    })
    this.switchTabs();
  }

  drawTooltip() {
    this.tooltip = d3.select(this.el)
      .append('div')
      .attr('class', 'bubble-map__tooltip');
  }

  drawSlider () {
    this.stepSlider = $('#js-slider')[0];
    noUiSlider.create(this.stepSlider, {
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
  }

  resizeBubbles() {
    this.dataColumn = $('.tabs__link.is-active').data('case');

    this.svg
      .selectAll('circle')
        .transition()
        .duration(750)
        .attr('r', (d) => {
          if (this.caseData[this.unformatSlider()].counties[d.id]) {
            return this.radius(this.caseData[this.unformatSlider()].counties[d.id][this.dataColumn]);
          }
        });
    this.max = this.caseData[this.unformatSlider()].totalTravel
  }

  switchTabs() {
    $('.tabs__link').click(() => {
      $('.tabs__link').removeClass('is-active');
      $(event.currentTarget).addClass('is-active');

      this.resizeBubbles();
    })
  }

  setTotals(el) {
    var counterStart = {var: $(el).text()};
    if (el === '.bubble-map__stat--local') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].totalLocal};
    } else if (el === '.bubble-map__stat--travel') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].totalTravel};
    } else if (el === '.bubble-map__stat--total') {
      var counterEnd = {var: +this.caseData[this.unformatSlider()].totalLocal + +this.caseData[this.unformatSlider()].totalTravel};
    } else if (el === '.bubble-map__stat--pregnant') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].pregnant};
    } else if (el === '.bubble-map__stat--non-resident') {
      var counterEnd = {var: this.caseData[this.unformatSlider()]['non-resident']};
    } else if (el === '.bubble-map__stat--unknown') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].undetermined ? this.caseData[this.unformatSlider()].undetermined : 0};
    }

    TweenMax.to(counterStart, 1.5, {var: counterEnd.var, onUpdate: () => {
        $(el).html(Math.ceil(counterStart.var));
      },
      ease:Circ.easeOut
    });
  }

  unformatSlider() {
    return numeral().unformat(this.stepSlider.noUiSlider.get());
  }

  setDate() {
    $('#js-date').html(moment(this.caseData[this.unformatSlider()].date).format('MMM Do YYYY'));
  }

}

const loadBubbleMap = () => {
  const $bubbleMap = $('.js-bubble-map');

  $bubbleMap.each((index) => {
    const $this = $bubbleMap.eq(index);
    const id = $this.attr('id');
    const url = $this.data('url');

    new BubbleMap(`#${id}`, url).render();
  });
}

export { loadBubbleMap };
