import $ from 'jquery';
import TweenLite from 'gsap';
import 'imports?define=>false!gsap/src/uncompressed/plugins/ScrollToPlugin';


const loadAnchors = () => {
  const $scrollToAnchors = $('.js-scrollTo');

  $scrollToAnchors.each((i) => {
    const $this = $scrollToAnchors.eq(i);
    const id = $this.attr('href');

    $this.click((e) => {
      e.preventDefault();

      TweenLite.to(window, 0.5, {scrollTo: id});
    });
  });
}

export { loadAnchors }
