import $ from 'jquery';
import TweenMax from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class Slides {
  constructor(el) {
    this.el = el;
    this.slides = ['#panel-1', '#panel-2', '#panel-3', '#panel-4'];
    this.controller = new ScrollMagic.Controller();
    this.wipeAnimation = new TimelineMax()
        .fromTo(this.slides[1], 1, { y: '100%' }, { y: '0%', ease: Linear.easeNone })
        .fromTo(this.slides[2], 1, { y: '100%' }, { y: '0%', ease: Linear.easeNone })
        .fromTo(this.slides[3], 1, { y: '100%' }, { y: '0%', ease: Linear.easeNone })

    $(this.el).height($(window).height());
    this.setContainerHeight();
    $(window).resize(this.setContainerHeight.bind(this));
  }

  setContainerHeight() {
    window.requestAnimationFrame(() => {
      $(this.el).height($(window).height());
      $(this.el).width($(window).width());
      this.slides.forEach((i) => {
        $(i).height($(this.el).height());
        $(i).width($(this.el).width());
      });
    });
  }

  render() {
    new ScrollMagic.Scene({
        triggerElement: this.el,
        triggerHook: 'onLeave',
        duration: '300%'
    })
    .setPin(this.el)
    .setTween(this.wipeAnimation)
    .addIndicators()
    .addTo(this.controller);
  }
}

const loadSlides = () => {
  const $pinContainer = $('#pinContainer');
  const id = $pinContainer.attr('id');

  new Slides(`#${id}`).render();
}

export { loadSlides }
