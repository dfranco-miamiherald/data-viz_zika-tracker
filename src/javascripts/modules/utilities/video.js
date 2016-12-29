import $ from 'jquery';

const loadVideos = () => {
  let $video = $('#vid');
  $video.on('canplaythrough', function() {
     this.play();
  });
};

export { loadVideos };
