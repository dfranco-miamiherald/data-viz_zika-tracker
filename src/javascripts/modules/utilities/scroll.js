import $ from 'jquery';
import 'imports?define=>false!jquery.scrollto/jquery.scrollTo';

const loadScroll = () => {
  // headline fade and unfade
  $(document).scroll(function () {
    var y = $(this).scrollTop();
    var fadeHeight = $('#section-0').offset().top;
      if (y > fadeHeight + 50) {
  			$('#headline-container-zika').addClass('headline-wrapper-zika__hidden').removeClass('headline-wrapper-zika__show');
  		} else {
  			$('#headline-container-zika').addClass('headline-wrapper-zika__show').removeClass('headline-wrapper-zika__hidden');
  		}
  });

  $('#intro-scroll-down').click(() => {
    $.scrollTo($('#section-1-intro'),
      {
        duration: 800
      }
    );
  });

  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />');
};

export { loadScroll };
