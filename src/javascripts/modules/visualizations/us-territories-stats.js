// external libraries
import $ from 'jquery';
import * as d3 from 'd3';
import { TweenMax } from 'gsap';
import numeral from 'numeral';
import noUiSlider from 'no-ui-slider';
import moment from 'moment';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class USTerritoriesStats {
  // constructor method to setup variables to be used in the vizualization
  constructor() {
    this.dataUrl = 'http://pubsys.miamiherald.com/static/media/projects/2016/zika-interactive-v2/data/usZika.json';
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
    // territory data (this.dataUrl)
    d3.queue()
      .defer(d3.json, this.dataUrl)
      .await(this.loadStats.bind(this));
  }

  loadStats(error, caseData) {
    if (error) throw error;

    // set the territory data to lexical this variables
    // so that they can be used outside of the loadStats function
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
    // when set totals is called a counter varible is initialized.
    // depending on which element is passed to setTotals (and what position the silder is currently at AND wheter perMil or total is selected),
    // a different counterEnd variable is set
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
    // initialize the noUiSlider
    this.stepSlider = $('#js-slider-us-territories')[0];
    let slider = noUiSlider .create(this.stepSlider, {
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
        triggerElement: '#section-3',
        duration: $('#section-3').outerHeight() - 20,
        triggerHook: 'onLeave'
      })
    	.setPin('#section-3-sticky', { pushFollowers: false })
      .on('enter', (event) => {
        this.stepSlider.noUiSlider.set(this.caseData.length - 1);
      })
    	.addTo(controller);

    // create click functions for slider controls
    $('.js-play--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.caseData.length - 1);
    });
    $('.js-step-down--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() - 1);
    });
    $('.js-step-up--territories').click(() => {
      this.stepSlider.noUiSlider.set(this.unformatSlider() + 1);
    });
    $('.js-reset--territories').click(() => {
      this.stepSlider.noUiSlider.set(0);
    });
  }

  switchTabs() {
    // when switching between tabs, zoom back out and toggle the is-active classes
    $('.tabs__link--us-territories-mil').click(() => {
      event.preventDefault();

      $('.tabs__link--us-territories-mil').removeClass('is-active');
      $(event.currentTarget).addClass('is-active');

      this.totals.forEach(i => {
        this.setTotals(i);
      });
    });
  }

  unformatSlider() {
    // utility function that uses the numeral JS library to get the current position of the slider
    return numeral().unformat(this.stepSlider.noUiSlider.get());
  }

  setDate() {
    // utility function that uses the moment library to set the format of the date properly
    $('#js-date-us-territories').html(moment(this.caseData[this.unformatSlider()].date).format('MMM. D, YYYY'));
  }
}

const loadUSTerritoriesStats = () => {
  // create a new USTerritoriesStats class and call the render function
  new USTerritoriesStats().render();
};

export { loadUSTerritoriesStats };
