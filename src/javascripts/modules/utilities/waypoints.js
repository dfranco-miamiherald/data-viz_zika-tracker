import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import { loadBubbleMapUS } from '../visualizations/us-bubble-map';


const loadWaypoints = () => {
  let controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({ triggerElement: '#section-2', reverse: false})
    .on('start', () => {
      loadBubbleMapUS();
    })
    .addTo(controller)
    .addIndicators();
};

export { loadWaypoints };
