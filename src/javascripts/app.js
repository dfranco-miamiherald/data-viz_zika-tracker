import $ from 'jquery';
import { loadBubbleMapFl } from './modules/visualizations/fl-bubble-map';
loadBubbleMapFl();
import { loadBubbleMapUS } from './modules/visualizations/us-bubble-map';
loadBubbleMapUS();
import { loadUSTerritoriesStats } from './modules/visualizations/us-territories-stats';
loadUSTerritoriesStats();

// import { loadWaypoints } from './modules/utilities/waypoints';
// loadWaypoints();

// import { setSectionHeights } from './modules/utilities/sections';
// setSectionHeights();

import { loadAnchors } from './modules/utilities/anchors';
loadAnchors();

import { loadVideos } from './modules/utilities/video';
loadVideos();

import { loadSticky } from './modules/utilities/sticky';
loadSticky();
