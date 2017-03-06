import $ from 'jquery';
import { TweenLite, TweenMax } from 'gsap';
import ScrollMagic from 'scrollmagic';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'imports?define=>false!scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';

const loadSticky = () => {
  // var stickyHeaders = (function() {
  //
  //   var $window = $(window),
  //       $stickies;
  //
  //   var load = function(stickies) {
  //
  //     if (typeof stickies === "object" && stickies.length > 0) {
  //       $stickies = stickies.each(function() {
  //         var $thisSticky = $(this).wrap('<div class="followWrap" />');
  //         $thisSticky
  //             .data('originalPosition', $thisSticky.offset().top)
  //             .data('originalHeight', $thisSticky.outerHeight())
  //               .parent()
  //               .height($thisSticky.outerHeight());
  //       });
  //
  //       $window.off("scroll.stickies").on("scroll.stickies", function() {
  //   		  _whenScrolling();
  //       });
  //     }
  //   };
  //
  //   var _whenScrolling = function() {
  //
  //     $stickies.each(function(i) {
  //
  //       var $thisSticky = $(this),
  //           $stickyPosition = $thisSticky.data('originalPosition');
  //
  //       if ($stickyPosition <= $window.scrollTop()) {
  //         var $nextSticky = $stickies.eq(i + 1),
  //             $nextStickyPosition = $nextSticky.data('originalPosition') - $thisSticky.data('originalHeight');
  //
  //         $thisSticky.addClass("fixed");
  //       } else {
  //         var $prevSticky = $stickies.eq(i - 1);
  //
  //         $thisSticky.removeClass("fixed");
  //
  //         if ($prevSticky.length > 0 && $window.scrollTop() <= $thisSticky.data('originalPosition') - $thisSticky.data('originalHeight')) {
  //           $prevSticky.removeClass("absolute").removeAttr("style");
  //         }
  //       }
  //     });
  //   };
  //
  //   return {
  //     load: load
  //   };
  // })();
  //
  // $(function() {
  //   stickyHeaders.load($(".followMeBar"));
  // });
  var controller = new ScrollMagic.Controller();

  var scene = new ScrollMagic.Scene({
      triggerElement: '#section-1',
      duration: $('#section-1').outerHeight(),
      triggerHook: 'onLeave'
    })
  	.setPin('#section-1-sticky', { pushFollowers: false })
  	.addIndicators({name: '1'}) // add indicators (requires plugin)
  	.addTo(controller);
};

export { loadSticky };
