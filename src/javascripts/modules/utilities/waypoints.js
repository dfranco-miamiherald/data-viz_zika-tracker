import $ from 'jquery';
import ScrollMagic from 'scrollmagic';
import { TweenLite } from 'gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import { loadBubbleMapUS } from '../visualizations/us-bubble-map';


const loadWaypoints = () => {
  let controller = new ScrollMagic.Controller();

  let tween = TweenLite.to('#section-2', 0.5, {autoAlpha: 1, display: 'block'});

  new ScrollMagic.Scene({ triggerElement: '#section-2', reverse: false})
    .on('start', () => {
      loadBubbleMapUS();
    })
    .setTween(tween)
    .addTo(controller)
    .addIndicators();
}

export { loadWaypoints }
