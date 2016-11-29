import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { TweenLite } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';

class USTerritoriesStats {
  constructor() {
    this.dataUrl = 'http://media.miamiherald.com/static/media/projects/2016/zika-interactive-v2/data/usZika.json'
    this.totals = [
      '.territories__stat--local-as',
      '.territories__stat--travel-as',
      '.territories__stat--total-as',
      '.territories__stat--local-pr',
      '.territories__stat--travel-pr',
      '.territories__stat--total-pr',
      '.territories__stat--local-usvi',
      '.territories__stat--travel-usvi',
      '.territories__stat--total-usvi'
    ];
  }

  render() {
    this.loadData();
  }

  loadData() {
    d3.queue()
      .defer(d3.json, this.dataUrl)
      .await(this.loadStats.bind(this));
  }

  loadStats(error, caseData) {
    if (error) throw error;

    this.caseData = caseData;
    this.drawSlider();
    this.totals.forEach(i => {
      this.setTotals(i);
    });
    this.stepSlider.noUiSlider.on('update', () => {
      this.totals.forEach(i => {
        this.setTotals(i);
        this.setDate();
      });
    });
  }

  setTotals(el) {
    var counterStart = {var: $(el).text()};
    if (el === '.territories__stat--local-as') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].local};
    } else if (el === '.territories__stat--travel-as') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].travel};
    } else if (el === '.territories__stat--total-as') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].total};
    } else if (el === '.territories__stat--local-pr') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].local};
    } else if (el === '.territories__stat--travel-pr') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].travel};
    } else if (el === '.territories__stat--total-pr') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].total};
    } else if (el === '.territories__stat--local-usvi') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['United States Virgin Islands'].local};
    } else if (el === '.territories__stat--travel-usvi') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['United States Virgin Islands'].travel};
    } else if (el === '.territories__stat--total-usvi') {
      var counterEnd = {var: this.caseData[this.unformatSlider()].territories['United States Virgin Islands'].total};
    }

    TweenMax.to(counterStart, 0.3, {var: counterEnd.var, onUpdate: () => {
        $(el).html(Math.ceil(counterStart.var));
      },
      ease:Circ.easeOut
    });
  }

  drawSlider() {
    this.stepSlider = $('#js-slider-us-territories')[0];
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

    $('.js-play--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.caseData.length - 1);
    });
    $('.js-step-down--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() - 1);
    });
    $('.js-step-up--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() + 1);
    });
  }

  setDate() {
    $('#js-date-us-territories').html(moment(this.caseData[this.unformatSlider()].date).format('MMM. D, YYYY'));
  }

  unformatSlider() {
    return numeral().unformat(this.stepSlider.noUiSlider.get());
  }
}

const loadUSTerritoriesStats = () => {
  new USTerritoriesStats().render();
}

export { loadUSTerritoriesStats };
