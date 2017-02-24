import $ from 'jquery';

const loadVideos = () => {
  let $video = $('#vid');
  $video.on('canplaythrough', function() {
     this.play();
  });

  // Override the main container padding
  $('.container[role="main"], .container[role="main"] .col-sm-12').css({
    'padding-left': '0px'
    'padding-right': '0px'
  });
};

export { loadVideos };
