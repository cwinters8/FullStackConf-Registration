// focus on first form field when the page loads
$(document).ready(() => {
    $('#name').focus();
})

// object to track if all validations are passing
const validations = {
    name: false,
    email: false,
    tshirt: false,
    activities: false,
    payment: false
}

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
        validations.tshirt = true;
    } else {
        tshirtColorLabel.hide();
        tshirtColorSelect.hide();
        validations.tshirt = false;
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
        colorOptionDisplay(/.*JS Puns.*/);
    } else if (e.target.value === 'heart js') {
        colorOptionDisplay(/.*I ♥ JS.*/);
    } else {
        colorElementDisplay(false);
    }
})

// handle payment method elements
const payment = $('#payment');
const creditCard = $('#credit-card');
const paypal = $($('div:contains("PayPal option")')[1]);
const bitcoin = $($('div:contains("Bitcoin option")')[1]);
// remove 'select method' option
$(payment.children()[0]).remove();
// initially hide other payment method sections
paypal.hide();
bitcoin.hide();
// only show selected payment method
payment.change((e) => {
    if (e.target.value === 'credit card') {
        creditCard.show();
        paypal.hide();
        bitcoin.hide();
    } else if (e.target.value === 'paypal') {
        creditCard.hide();
        paypal.show();
        bitcoin.hide();
    } else {
        creditCard.hide();
        paypal.hide();
        bitcoin.show();
    }
})

/****************
** VALIDATIONS **
****************/

// highlight a given field in red
function error(field, bool) {
    if (bool) {
        field.addClass('error');
    } else {
        field.removeClass('error');
    }
}

// execute error and append functions based on regex tests
function validateActions(event, label, err, regex) {
    label.children().remove();
    if (!regex.test(event.target.value)) {
        error($(event.target), true);
        label.append($(err));
        return false;
    } else {
        error($(event.target), false);
        $(err).remove();
        return true;
    }
}

// remove one or more elements from an array if there is a match
function removeFromArray(element, array) {
    while (array.indexOf(element) !== -1) {
        const index = array.indexOf(element);
        array.splice(index, 1);
    }
    return array;
}

// name
const nameLabel = $('label[for="name"]');
const nameError = '<span> Please enter a name.</span>';
const nameRegex = /\w+/;
$('#name').on('input', (e) => {
    validateActions(e, nameLabel, nameError, nameRegex);
})
$('#name').blur((e) => {
    const check = validateActions(e, nameLabel, nameError, nameRegex);
    validations.name = check;
})

// email
const emailInput = $('#mail');
const emailLabel = $('label[for="mail"]');
const emailError = '<span> Please enter a valid email.</span>';
const emailRegex = /^[^@]+@[^@]+\.[a-z]+$/i;
emailInput.on('input', (e) => {
    validateActions(e, emailLabel, emailError, emailRegex);
})
emailInput.blur((e) => {
    const check = validateActions(e, emailLabel, emailError, emailRegex);
    validations.email = check;
})

// activities
const activities = $('.activities input');

// add a cost section to activities fieldset
const activitiesFieldset = $('.activities');
const costDiv = $('<div id="cost">Total Cost: $</div>');
const costSpan = $('<span></span>');
let totalCost = 0;
activitiesFieldset.append(costDiv);
costDiv.append(costSpan);
costSpan.text(totalCost);

// add or subtract from the total cost
function costs(activity, operator) {
    let label = activity.parent();
    const regex = / \$/;
    label = label.text().split(regex);
    let activityCost = label[label.length - 1];
    activityCost = parseInt(activityCost);
    if (operator === 'add') {
        totalCost += activityCost;
    } else {
        totalCost -= activityCost;
    }
    costSpan.text(totalCost);
}

// grey out conflicting activity times, or re-enable if unchecked
function conflict(activity, checked) {
    // const name = activity.attr('name');
    const regex = / — ([^$].+),/;
    const targetText = activity.parent().text();
    let targetTime = targetText.match(regex);
    if (targetTime) {
        targetTime = targetTime[1];
    }
    const labels = $('.activities label');
    // loop through labels and find any matching times
    for (let i = 0; i < labels.length; i++) {
        let text = labels[i].innerText;
        let time = text.match(regex);
        if (time) {
            time = time[1];
            if (time === targetTime && text !== targetText) {
                if (checked) {
                    $($(labels[i]).children()[0]).attr('disabled', 'disabled');
                    $(labels[i]).addClass('conflict');
                } else {
                    $($(labels[i]).children()[0]).removeAttr('disabled');
                    $(labels[i]).removeClass('conflict')
                }
                
            }
        }
    }
}

let checked = [];
// attach a listener to each activity checkbox
for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    // add and remove activities from the checked array
    $(activity).change((e) => {
        if ($(e.target).prop('checked')) {
            checked.push(e.target.name);
            conflict($(e.target), true);
            costs($(e.target), 'add');
        } else {
            conflict($(e.target), false);
            costs($(e.target), 'subtract');
            checked = removeFromArray(e.target.name, checked);
        }
        // change activities value in validations object based on whether any boxes are checked
        if (checked.length > 0) {
            validations.activities = true;
        } else {
            validations.activities = false;
        }
    })
}

// credit card validation

// track if any CC validations are returning false
let invalidPayment = [];
// push or pull from invalidPayment array as needed
function ccPushOrPull(item, bool) {
    if (!bool) {
        invalidPayment.push(item);
    } else {
        invalidPayment = removeFromArray(item, invalidPayment);
    }
}

// add divs to append error messages to
const cvvDiv = $($('div:contains("CVV:")')[2]);
const ccNumErrorDiv = $('<div class="error-div"></div>');
cvvDiv.after(ccNumErrorDiv);
const ccZipErrorDiv = $('<div class="error-div"></div>');
ccNumErrorDiv.after(ccZipErrorDiv);
const cvvErrorDiv = $('<div class="error-div"></div>');
ccZipErrorDiv.after(cvvErrorDiv);

// CC number validation
const ccNum = $('#cc-num');
const ccNumRegex = /^\d{13,16}$/;
const ccNumError = '<p>Please enter a valid credit card number.</p>';
ccNum.on('input', (e) => {
    validateActions(e, ccNumErrorDiv, ccNumError, ccNumRegex);
})
ccNum.blur((e) => {
    const check = validateActions(e, ccNumErrorDiv, ccNumError, ccNumRegex);
    ccPushOrPull('CC Number', check);
})

// zip code validation
const ccZip = $('#zip');
const ccZipRegex = /^\d{5}$/;
const ccZipError = '<p>Please enter a valid zip code.</p>'
ccZip.on('input', (e) => {
    validateActions(e, ccZipErrorDiv, ccZipError, ccZipRegex);
})
ccZip.blur((e) => {
    const check = validateActions(e, ccZipErrorDiv, ccZipError, ccZipRegex);
    ccPushOrPull('CC Zip', check);
})

// CVV validation
const cvv = $('#cvv');
const cvvRegex = /^\d{3}$/;
const cvvError = '<p>Please enter a valid CVV code.</p>'
cvv.on('input', (e) => {
    validateActions(e, cvvErrorDiv, cvvError, cvvRegex);
})
cvv.blur((e) => {
    const check = validateActions(e, cvvErrorDiv, cvvError, cvvRegex);
    ccPushOrPull('CVV', check);
})

// validate all fields on submit and show errors where necessary
// verify a t-shirt is selected
// check which payment method is selected
// for credit card, check if the `invalidPayment` array is empty