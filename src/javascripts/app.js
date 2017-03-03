import $ from 'jquery';

// VISUALIZATIONS
import { loadBubbleMapFl } from './modules/visualizations/fl-bubble-map';
loadBubbleMapFl();

import { loadBubbleMapUS } from './modules/visualizations/us-bubble-map';
loadBubbleMapUS();

import { loadUSTerritoriesStats } from './modules/visualizations/us-territories-stats';
loadUSTerritoriesStats();

// UTILITIES
import { loadVideos } from './modules/utilities/video';
loadVideos();

import { loadSticky } from './modules/utilities/sticky';
loadSticky();

import { loadShare } from './modules/utilities/share';
loadShare();
