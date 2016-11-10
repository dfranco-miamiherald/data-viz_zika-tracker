import $ from 'jquery';
import TimelineMax from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

class Slide {
  constructor() {
    // init
    this.controller = new ScrollMagic.Controller();

    this.slideContainerEl = '#slideContainer';
    this.pinContainerEl = '#pinContainer';

    // define movement of panels
    this.wipeAnimation = new TimelineMax()
			// animate to second panel
			.to(this.slideContainerEl, 0.5, {z: -150})		// move back in 3D space
			.to(this.slideContainerEl, 1,   {x: '-25%'})	// move in to first panel
			.to(this.slideContainerEl, 0.5, {z: 0})				// move back to origin in 3D space
			// animate to third panel
			.to(this.slideContainerEl, 0.5, {z: -150, delay: 1})
			.to(this.slideContainerEl, 1,   {x: '-50%'})
			.to(this.slideContainerEl, 0.5, {z: 0})
			// animate to forth panel
			.to(this.slideContainerEl, 0.5, {z: -150, delay: 1})
			.to(this.slideContainerEl, 1,   {x: '-75%'})
			.to(this.slideContainerEl, 0.5, {z: 0});
  }

  render() {
    // create scene to pin and link animation
		new ScrollMagic.Scene({
				triggerElement: this.pinContainerEl,
				triggerHook: 'onLeave',
				duration: '500%'
			})
			.setPin(this.pinContainerEl)
			.setTween(wipeAnimation)
			.addIndicators() // add indicators (requires plugin)
			.addTo(controller);
  }
}

const loadSlides = () => {
  $(document).ready(() => {
    new Slide.render();
  });
}

export { loadSlides };
