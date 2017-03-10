import $ from 'jquery';
import isMobile from 'ismobilejs';

const loadVideos = () => {
  if (isMobile.apple.phone || isMobile.android.phone) {
    $('video *').hide();
    $('video img').show();
  }

  // Override the main container padding
  $('.container[role="main"], .container[role="main"] .col-sm-12').css({
    'padding-left': '0px',
    'padding-right': '0px'
  });
};

export { loadVideos };
