import $ from 'jquery';

const loadVideos = () => {
  let $video = $('#vid');
  $video.on('canplaythrough', function() {
     this.play();
  });

  // Override the main container padding
  $('.container[role="main"]').css({ 'padding': '0px' });
  $('.container[role="main"] .col-sm-12').css({ 'padding': '0px' });
};

export { loadVideos };
