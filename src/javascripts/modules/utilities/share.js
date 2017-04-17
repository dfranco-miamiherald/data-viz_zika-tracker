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

    // get the text located inside any anchor with the .js-share class
    // if the anchor does not have any text leave it blank
    text = $(this).data('share') ? $(this).data('share') : '';

    // open a new window with the URL from the anchor href,
    // encode the text,
    // size and position with the width, height, winHeight variables.
    window.open(this.href + encodeURIComponent(text), 'intent', windowOptions + ',width=' + width +
    ',height=' + height + ',left=' + winLeft + ',top=' + winTop);
  }

  $shareLinks.click(openPopup);
};

export { loadShare };
