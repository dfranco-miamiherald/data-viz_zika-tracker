import $ from 'jquery';

const loadShare = () => {
  var $shareLinks = $('.js-share');
  var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes';
  var width = 550;
  var height = 420;
  var winWidth = $(window).width();
  var text;
  var winLeft = Math.round((winWidth / 2) - (width / 2));
  var winTop = 0;

  function openPopup(e) {
    e.preventDefault();

    text = $(this).data('share') ? $(this).data('share') : '';

    window.open(this.href + encodeURIComponent(text), 'intent', windowOptions + ',width=' + width +
    ',height=' + height + ',left=' + winLeft + ',top=' + winTop);
  }

  $shareLinks.click(openPopup);
};

export { loadShare };
