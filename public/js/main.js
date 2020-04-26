let log = console.log;
let burgerBar = $('.burger-menu');
let navTags = $('.small-sc-nav-links');
let showCaseContent = $('.main-landing .show-case .zindex')
let close = $('.close')
log(close)
$(burgerBar).on('click', e => {
    log(navTags)
    $(navTags).slideToggle(200);

});

$(close).on('click', e => {
    $(navTags).slideUp(150)
})
