import $ from 'jquery';
import TweenMax from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class Slides {
  constructor(el) {
    this.el = el;
    this.slides = ['#panel-1', '#panel-2'];
    this.controller = new ScrollMagic.Controller();
    this.mediumScreenUp = Modernizr.mq('(min-width: 640px)');
    this.wipeAnimation = new TimelineMax()
        .fromTo(this.slides[1], 1, { y: '100%' }, { y: '0%', ease: Linear.easeNone })
    $(this.el).height($(window).height());
    this.setContainerHeight();
    $(window).resize(this.setContainerHeight.bind(this));
  }

  setContainerHeight() {
    window.requestAnimationFrame(() => {
      if (this.mediumScreenUp) {
        this.slides.forEach((i) => {
          $(i).width($(this.el).width());
          $(i).height($(this.el).height());
        });
      } else {
        $(this.el).height('100%');
        this.slides.forEach((i) => {
          console.log('bar');
          $(i).width('100%');
          $(i).height('100%');
        });
      }
    });
  }

  render() {
    if (this.mediumScreenUp) {
      new ScrollMagic.Scene({
          triggerElement: this.el,
          triggerHook: 'onLeave',
          duration: '300%'
      })
      .setPin(this.el)
      .setTween(this.wipeAnimation)
      .addIndicators()
      .addTo(this.controller);
    } else {
      this.controller.destroy();
    }
  }
}

const loadSlides = () => {
  const $pinContainer = $('#pinContainer');
  const id = $pinContainer.attr('id');
  let slidesRendered = false;

  new Slides(`#${id}`).render();
}

export { loadSlides }
