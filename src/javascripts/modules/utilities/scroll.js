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
};

export { loadScroll };
