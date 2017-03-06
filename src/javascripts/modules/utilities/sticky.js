import $ from 'jquery';
import { TweenLite, TweenMax } from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

const loadSticky = () => {
  var controller = new ScrollMagic.Controller();

  var scene = new ScrollMagic.Scene({
      triggerElement: '#section-1',
      duration: $('#section-1').outerHeight(),
      triggerHook: 'onLeave'
    })
  	.setPin('#section-1-sticky', { pushFollowers: false })
  	// .addIndicators({name: '1'}) // add indicators (requires plugin)
  	.addTo(controller);

    var scene = new ScrollMagic.Scene({
        triggerElement: '#section-2',
        duration: $('#section-2').outerHeight(),
        triggerHook: 'onLeave'
      })
    	.setPin('#section-2-sticky', { pushFollowers: false })
    	// .addIndicators({name: '2'}) // add indicators (requires plugin)
    	.addTo(controller);

    var scene = new ScrollMagic.Scene({
        triggerElement: '#section-3',
        duration: $('#section-3').outerHeight() - 40,
        triggerHook: 'onLeave'
      })
    	.setPin('#section-3-sticky', { pushFollowers: false })
    	// .addIndicators({name: '3'}) // add indicators (requires plugin)
    	.addTo(controller);
};

export { loadSticky };
