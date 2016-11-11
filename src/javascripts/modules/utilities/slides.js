import $ from 'jquery';
import TweenMax from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class SlideAnimation {
  constructor() {
    this.slideContainerEl = '#slideContainer';
    this.pinContainerEl = '#pinContainer';
    this.duration = '1000%';

    this.controller = new ScrollMagic.Controller();
    this.wipeAnimation = new TimelineMax()
        .to(this.slideContainerEl, 0.5, {z: -150})
        .to(this.slideContainerEl, 1,   {x: "-25%"})
        .to(this.slideContainerEl, 0.5, {z: 0})
        .to(this.slideContainerEl, 0.5, {z: -150, delay: 1})
        .to(this.slideContainerEl, 1,   {x: "-50%"})
        .to(this.slideContainerEl, 0.5, {z: 0})
        .to(this.slideContainerEl, 0.5, {z: -150, delay: 1})
        .to(this.slideContainerEl, 1,   {x: "-75%"})
        .to(this.slideContainerEl, 0.5, {z: 0});
  }

  render() {
    new ScrollMagic.Scene({
        triggerElement: this.pinContainerEl,
        triggerHook: 'onLeave',
        duration: this.duration
      })
      .setPin(this.pinContainerEl)
      .setTween(this.wipeAnimation)
      .addIndicators() // remove for production
      .addTo(this.controller);
  }
}

const loadSlides = () => {
  new SlideAnimation().render();
}

export { loadSlides };
