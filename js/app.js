// focus on first form field when the page loads
$(document).ready(() => {
    $('#name').focus();
})

// highlight a given field in red
function error(field, bool) {
    if (bool) {
        field.addClass('error-highlight');
    } else {
        field.removeClass('error-highlight');
    }
}

// execute error and append functions based on regex tests
function validateActions(target, label, err, regex) {
    label.children().remove();
    if (!regex.test(target.val())) {
        error(target, true);
        label.append($(err));
        return false;
    } else {
        error(target, false);
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

// object to track if all validations are passing
const validations = {
    name: false,
    email: false,
    tshirt: false,
    activities: false,
    ccNum: false,
    ccZip: false,
    cvv: false
}

/****************
***** NAME *****
****************/
const name = $('#name');
const nameLabel = $('label[for="name"]');
const nameError = '<span> Please enter a name.</span>';
const nameRegex = /\w+/;
name.on('input', (e) => {
    validateActions($(e.target), nameLabel, nameError, nameRegex);
})
name.blur((e) => {
    const check = validateActions($(e.target), nameLabel, nameError, nameRegex);
    validations.name = check;
})

/****************
***** EMAIL *****
****************/
const emailInput = $('#mail');
const emailLabel = $('label[for="mail"]');
let emailError;
let emailRegex = /^[^@]+@[^@]+\.[a-z]+$/i;
// pick an email error
function chooseEmailError(target) {
    if (target) {
        return '<span> Please enter a valid email address.</span>';
    } else {
        return '<span> Please enter an email address.</span>';
    }
}

emailInput.on('input', (e) => {
    emailError = chooseEmailError($(e.target).val());
    validateActions($(e.target), emailLabel, emailError, emailRegex);
})
emailInput.blur((e) => {
    emailError = chooseEmailError($(e.target).val());
    const check = validateActions($(e.target), emailLabel, emailError, emailRegex);
    validations.email = check;
})

/****************
*** JOB ROLE ***
****************/
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

/****************
**** T-SHIRT ****
****************/
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
const tshirtError = $('<p class="error">Please select a t-shirt.</p>');
designs.change((e) => {
    if (e.target.value === 'js puns') {
        colorOptionDisplay(/.*JS Puns.*/);
        tshirtError.remove();
    } else if (e.target.value === 'heart js') {
        colorOptionDisplay(/.*I ♥ JS.*/);
        tshirtError.remove();
    } else {
        colorElementDisplay(false);
    }
})

/****************
** ACTIVITIES **
****************/
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
const activitiesError = $('<p class="error">Please select at least one activity.</p>');
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
            activitiesError.remove();
        } else {
            validations.activities = false;
        }
    })
}

/****************
**** PAYMENT ****
****************/
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

// add divs to append error messages to
const cvvDiv = $($('div:contains("CVV:")')[2]);
const ccNumErrorDiv = $('<div class="error"></div>');
cvvDiv.after(ccNumErrorDiv);
const ccZipErrorDiv = $('<div class="error"></div>');
ccNumErrorDiv.after(ccZipErrorDiv);
const cvvErrorDiv = $('<div class="error"></div>');
ccZipErrorDiv.after(cvvErrorDiv);

// CC number validation
const ccNum = $('#cc-num');
const ccNumRegex = /^\d{13,16}$/;
const ccNumError = '<p>Please enter a valid credit card number.</p>';
ccNum.on('input', (e) => {
    validateActions($(e.target), ccNumErrorDiv, ccNumError, ccNumRegex);
})
ccNum.blur((e) => {
    const check = validateActions($(e.target), ccNumErrorDiv, ccNumError, ccNumRegex);
    validations.ccNum = check;
})

// zip code validation
const ccZip = $('#zip');
const ccZipRegex = /^\d{5}$/;
const ccZipError = '<p>Please enter a valid zip code.</p>'
ccZip.on('input', (e) => {
    validateActions($(e.target), ccZipErrorDiv, ccZipError, ccZipRegex);
})
ccZip.blur((e) => {
    const check = validateActions($(e.target), ccZipErrorDiv, ccZipError, ccZipRegex);
    validations.ccZip = check;
})

// CVV validation
const cvv = $('#cvv');
const cvvRegex = /^\d{3}$/;
const cvvError = '<p>Please enter a valid CVV code.</p>'
cvv.on('input', (e) => {
    validateActions($(e.target), cvvErrorDiv, cvvError, cvvRegex);
})
cvv.blur((e) => {
    const check = validateActions($(e.target), cvvErrorDiv, cvvError, cvvRegex);
    validations.cvv = check;
})

/****************
**** SUBMIT ****
****************/
$('button').click((e) => {
    // check input fields by executing their blur events
    name.blur();
    emailInput.blur();
    if (payment.val() === 'credit card') {
        ccNum.blur();
        ccZip.blur();
        cvv.blur();
    } else {
        // setting to true in order to bypass check if payment method is not a CC
        validations.ccNum = true;
        validations.ccZip = true;
        validations.cvv = true;
    }
    const validationsValues = Object.values(validations);
    let failed;
    for (let i = 0; i < validationsValues.length; i++) {
        if (!validationsValues[i]) {
            failed = true;
            break;
        }
    }
    if (failed) {
        if (!validations.tshirt) {
            $('legend:contains("T-Shirt Info")').after(tshirtError);
        }
        if (!validations.activities) {
            $('legend:contains("Register for Activities")').after(activitiesError);
        }
        e.preventDefault();
        alert('Please fix the errors on the page, then resubmit.');
    } else {
        alert('Registration submitted successfully!');
    }
})
