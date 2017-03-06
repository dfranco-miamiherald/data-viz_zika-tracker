import $ from 'jquery';

const loadScroll = () => {
  // headline fade and unfade
  $(document).scroll(function () {
    var y = $(this).scrollTop();
    var fadeHeight = $('#section-0').offset().top;
      if (y > fadeHeight + 150) {
  				$('#headline-container').addClass('text-wrapper__hidden').removeClass('text-wrapper__show');
  		} else {
  				$('#headline-container').addClass('text-wrapper__show').removeClass('text-wrapper__hidden');
  		}
  });

  $(function() {
    $('a[href*=#]:not([href=#])').click(function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top
          }, 500);
          return false;
        }
      }
    });
  });
};

export { loadScroll };
