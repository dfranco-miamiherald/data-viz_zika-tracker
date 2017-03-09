import $ from 'jquery';
import 'imports?define=>false!jquery.scrollto/jquery.scrollTo';

const loadScroll = () => {
  // headline fade and unfade
  $(document).scroll(function () {
    var y = $(this).scrollTop();
    var fadeHeight = $('#section-0').offset().top;
      if (y > fadeHeight + 50) {
  			$('#headline-container').addClass('headline-wrapper__hidden').removeClass('headline-wrapper__show');
  		} else {
  			$('#headline-container').addClass('headline-wrapper__show').removeClass('headline-wrapper__hidden');
  		}
  });

  $('#intro-scroll-down').click(() => {
    $.scrollTo($('#section-1-intro'),
      {
        duration: 800
      }
    );
  });
};

export { loadScroll };
