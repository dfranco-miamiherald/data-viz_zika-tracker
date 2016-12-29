import $ from 'jquery';

class Section {
  constructor(el) {
    this.el = el;
  }

  render() {
    this.setHeight();
    $(window).resize(this.setHeight.bind(this));
  }

  setHeight() {
    let windowHeight = $(window).innerHeight();
    $(this.el).css('min-height', windowHeight);
  }
}

const setSectionHeights = () => {
  const $panel = $('.js-panel');

  $panel.each((index) => {
    const $this = $panel.eq(index);
    const id = $this.attr('id');

    new Section(`#${id}`).render();
  });
};

export { setSectionHeights };
