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

  // click to scroll to section 1
  $('#intro-scroll-down').click(function (e) {
    e.preventDefault();

    $.scrollTo($('#section-1-intro'),
      {
        duration: 800
      }
    );
  });
};

export { loadScroll };
