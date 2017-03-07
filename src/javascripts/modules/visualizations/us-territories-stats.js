import $ from 'jquery';
import * as d3 from 'd3';
import { TweenMax } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';

class USTerritoriesStats {
  constructor() {
    this.dataUrl = 'http://pubsys.miamiherald.com/static/media/projects/2016/zika-interactive-v2/data/usZika_tmp.json';
    this.totals = [
      '.territories__stat--donor-as',
      '.territories__stat--total-as',
      '.territories__stat--donor-pr',
      '.territories__stat--total-pr',
      '.territories__stat--donor-usvi',
      '.territories__stat--total-usvi',
      '.territories__stat--donor-totals',
      '.territories__stat--total-totals'
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
    this.switchTabs();
  }

  setTotals(el) {
    this.dataColumn = $('.tabs__link--us-territories-mil.is-active').data('number');

    var counterStart = {var: $(el).text()};
    var counterEnd = null;

    if (this.dataColumn === 'total') {
      if (el === '.territories__stat--donor-as') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].donor};
      } else if (el === '.territories__stat--total-as') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].total};
      } else if (el === '.territories__stat--donor-pr') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].donor};
      } else if (el === '.territories__stat--total-pr') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].total};
      } else if (el === '.territories__stat--donor-usvi') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['U.S. Virgin Islands'].donor};
      } else if (el === '.territories__stat--total-usvi') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['U.S. Virgin Islands'].total};
      } else if (el === '.territories__stat--donor-totals') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territoriesTotalDonor};
      } else if (el === '.territories__stat--total-totals') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territoriesTotal};
      }
    } else if (this.dataColumn === 'perMil') {
      if (el === '.territories__stat--donor-as') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].perMillionDonor};
      } else if (el === '.territories__stat--total-as') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['American Samoa'].perMillionTotal};
      } else if (el === '.territories__stat--donor-pr') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].perMillionDonor};
      } else if (el === '.territories__stat--total-pr') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['Puerto Rico'].perMillionTotal};
      } else if (el === '.territories__stat--donor-usvi') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['U.S. Virgin Islands'].perMillionDonor};
      } else if (el === '.territories__stat--total-usvi') {
        counterEnd = {var: this.caseData[this.unformatSlider()].territories['U.S. Virgin Islands'].perMillionTotal};
      } else if (el === '.territories__stat--donor-totals') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionTerritoriesTotalDonor};
      } else if (el === '.territories__stat--total-totals') {
        counterEnd = {var: this.caseData[this.unformatSlider()].perMillionTerritoriesTotal};
      }
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

  switchTabs() {
    $('.tabs__link--us-territories-mil').click(() => {
      event.preventDefault();

      $('.tabs__link--us-territories-mil').removeClass('is-active');
      $(event.currentTarget).addClass('is-active');

      this.totals.forEach(i => {
        this.setTotals(i);
      });
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
};

export { loadUSTerritoriesStats };
