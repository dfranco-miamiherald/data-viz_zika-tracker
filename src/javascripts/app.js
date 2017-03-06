import $ from 'jquery';
// VISUALIZATIONS
import { loadBubbleMapFl } from './modules/visualizations/fl-bubble-map';
import { loadBubbleMapUS } from './modules/visualizations/us-bubble-map';
import { loadUSTerritoriesStats } from './modules/visualizations/us-territories-stats';
// UTILITIES
import { loadVideos } from './modules/utilities/video';
import { loadSticky } from './modules/utilities/sticky';
import { loadShare } from './modules/utilities/share';
import { loadScroll } from './modules/utilities/scroll';

$(window).on('load', () => {
  loadBubbleMapFl();
  loadBubbleMapUS();
  loadUSTerritoriesStats();
  loadVideos();
  loadSticky();
  loadShare();
  loadScroll();
});
