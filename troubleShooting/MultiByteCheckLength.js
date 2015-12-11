/*
 * Attach the validation listener to all input/textarea with maxlength property in form.
 */
SUGAR.IBM.calculateMultiByteLength = function()
{
    YUI({base:'include/javascript/yui3/build/'}).use('node', function(Y) {
        var handler = function (ev) {
            var listenDom = ev.target;
            if (typeof listenDom != 'undefined' && listenDom != null) {
                var maxLength = listenDom.get('maxLength');
                if (typeof maxLength == 'undefined' || maxLength == null || maxLength == '' || maxLength <= 0) {
                    return false;
                }
                var showValue = SUGAR.IBM.getCalculateInputValue(listenDom, maxLength);
                if (typeof showValue == 'string' && showValue != '' ) {
                    listenDom.set('value', showValue);
                }
                else if (typeof showValue == 'string' && showValue === '' ) {
                    listenDom.set('value', '');
                }
                if (ev.type === 'blur') {
                    SUGAR.IBM.removeMutilByteNotice(listenDom);
                }
            }
        }
        var formList = Y.all("form");
        if (formList != null && !formList.isEmpty()) {
            formList.each(function(domNode, index, dlist) {
                /*
                 * Avoid the validation listener was already attached on currenet element
                 */
                if (!domNode.hasClass('multibytes-support')) {
                    domNode.addClass('multibytes-support');
                    domNode.delegate(['keyup', 'change'], handler, 'input[maxLength],textarea[maxLength]');
                    domNode.on('blur', handler);
                    Y.use('event-focus', function (e) {
                        domNode.on('blur', handler);
                    });
                }
            });
        }
    });
}

SUGAR.IBM.getCalculateInputValue = function (listenDom,maxLength)
{
    var valueLength = 0;
    var counts = 0;
    var inputValue = listenDom.get('value');
    for (var n = 0; n < inputValue.length; n++) {
        counts = SUGAR.IBM.countInputLength(inputValue,n);
        if (maxLength >= counts) {
            maxLength -= counts;
            valueLength ++;
        }
        else {
            var new_str = inputValue.substr(0,valueLength);
            //send user notified.
            SUGAR.IBM.addMutilByteNotice(listenDom, SUGAR.language.get('app_strings', 'LBL_MULTI_BYTE_LIMIT'));
            break;
        }
    }
    if (typeof new_str != 'undefined') {
        return new_str;
    }
    return false;
}

SUGAR.IBM.countInputLength = function (inputValue,idx)
{
    var sLen = 0;
    var charCode = SUGAR.IBM.FixedChatCodeAt(inputValue, idx);
    if (typeof charCode === "number") {
        if (charCode < 128) {
            sLen = 1;
        }
        else if (charCode < 2048) {
            sLen = 2;
        }
        else if (charCode < 65536) {
            sLen = 3;
        }
        else if (charCode < 2097152) {
            sLen = 4;
        }
        else if (charCode < 67108864) {
            sLen = 5;
        }
        else {
            sLen =  6;
        }
    }
    return sLen;
}

/**
 * Description: Returns the numeric Unicode value of the character at the given index (except for
 *              unicode codepoints > 0x10000). Unicode code points range from 0 to 1,114,111.
 *              The first 128 Unicode code points are a direct match of the ASCII character encoding.
 * Link: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt
 */
SUGAR.IBM.FixedChatCodeAt = function (inputValue,idx)
{
    idx = idx || 0;
    var code = inputValue.charCodeAt(idx);
    var hi, low;
    // High surrogate(could change last hex to 0xDB7F to treat high private surrogates as single characters)
    if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = inputValue.charCodeAt(idx + 1);
        if (!isNaN(low)) {
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
        }
    }
    // Low surrogate
    if (0xDC00 <= code && code <= 0xDFFF) {
        /**
         * We return false to allow loops to skip this iteration since should have already handled
         * high surrogate above in the previous iteration.
         */
        return false;
    }
    return code;
}

SUGAR.IBM.addMutilByteNotice = function (listenDom, errormsg)
{
    YUI({base:'include/javascript/yui3/build/'}).use('node', function (Y) {
        try{
            var nextNode = listenDom.next();
            if ((nextNode != null && !nextNode.hasClass('remind-message')) || nextNode == null) {
                var noticeTextNode =  Y.Node.create('<div></div>');
                noticeTextNode.set('innerHTML', errormsg);
                noticeTextNode.addClass('reminded remind-message');
                listenDom.insert(noticeTextNode, 'after');
            }
        } catch(e) {
            alert('input field is invalid.');
        }
    });
}

SUGAR.IBM.removeMutilByteNotice = function (listenDom)
{
    YUI({base:'include/javascript/yui3/build/'}).use('node', function (Y) {
        try {
            var nextNode = listenDom.next();
            if (nextNode != null && nextNode.hasClass('remind-message')) {
                nextNode.remove();
            }
        } catch(e) {
            alert('input field is invalid.');
        }
    });
}

/*
 * Attach the validation listener to all input/textarea with maxlength property.
 */
YUI({base:'include/javascript/yui3/build/'}).use('node', function(Y) {
    Y.on('domready', function() {
        SUGAR.IBM.calculateMultiByteLength();
    });
});