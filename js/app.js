// focus on first form field when the page loads
$(document).ready(() => {
    $('#name').focus();
})

// only display other-title input if 'Other' job role is selected
const titles = $('#title');
const otherTitle = $('#other-title');
otherTitle.hide();
titles.change((e) => {
    if (e.target.value === 'other') {
        otherTitle.show();
        otherTitle.focus();
    } else {
        otherTitle.hide();
    }
})

const tshirtColorLabel = $("label[for='color']");
const tshirtColorSelect = $('#color');
// function to show or hide tshirt color elements
function colorElementDisplay(bool) {
    if (bool) {
        tshirtColorLabel.show();
        tshirtColorSelect.show();
    } else {
        tshirtColorLabel.hide();
        tshirtColorSelect.hide();
    }
}

// initially hide t-shirt color label and input
colorElementDisplay(false);

const designs = $('#design');
const colors = $('#color option');
// displays appropriate colors based on regex input
function colorOptionDisplay(regex) {
    const matchedColors = [];
    colorElementDisplay(true);
    const selected = $('#color option[selected="selected"]');
    selected.removeAttr('selected');
    colors.each((i) => {
        const color = $(colors[i]);
        color.detach();
        if (regex.test(color.text())) {
            color.appendTo('#color');
            matchedColors.push(color);
        }
    })
    // set first option as default
    matchedColors[0].attr('selected', 'selected');
}

// show appropriate colors when a design is selected
designs.change((e) => {
    if (e.target.value === 'js puns') {
        colorElementDisplay(true);
        colorOptionDisplay(/.*JS Puns.*/);
    } else if (e.target.value === 'heart js') {
        colorElementDisplay(true);
        colorOptionDisplay(/.*I ♥ JS.*/);
    } else {
        colorElementDisplay(false);
    }
})

/****************
** VALIDATIONS **
****************/

// highlight given field in red
function error(field, bool) {
    if (bool) {
        field.addClass('error');
    } else {
        field.removeClass('error');
    }
}

// name
const nameLabel = $('label[for="name"]');
const nameError = $('<span> Please enter a name.</span>');
$('#name').blur((e) => {
    const regex = /\w+/;
    if (!regex.test(e.target.value)) {
        error($(e.target), true);
        nameLabel.append(nameError);
    } else {
        error($(e.target), false);
        nameError.remove();
    }
})
$('#name').focus(() => {
    nameError.remove();
})