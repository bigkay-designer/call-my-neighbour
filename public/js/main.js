let log = console.log;
let burgerBar = $('.burger-menu');
let navTags = $('.nav-links');

$(burgerBar).on('click', e => {
    log(navTags)
    $(navTags).toggle();
});
