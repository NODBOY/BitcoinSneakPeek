// Bitcoin Sneak Peek: Instantly see the balance of a 
// Bitcoin address mentioned on any web page.
// Extension available on the store at https://chrome.Google.com/webstore/detail/bitcoin-sneak-peek/nmoioahfkdpfpjngcljhcphglbdppdmj
//
// Copyright (c) 2014 Steven Van Vaerenbergh
//
// URL: HTTPS://github.com/steven2358/BitcoinSneakPeek
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php

(function() {
    /*
     * Walk through the DOM tree and process all text nodes.
     * From HTTP://stackoverflow.com/a/5904945/1221212
     */
    function walk(node) {
        var child, next;
        try {
            switch (node.nodeType) {
                case 1: // Element
                case 9: // Document
                case 11: // Document fragment
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        walk(child);
                        child = next;
                    }
                    break;
                case 3: // Text node
                    if (node.parentElement.tagName.toLowerCase() != "script") {
                        processTextNode(node);
                    }
                    break;
            }
        } catch (err) {
            console.log("Error BitcoinSneakPeek: " + err);
        }
    }

    /*
     * Check if DOM text node is a link.
     * From HTTP://stackoverflow.com/a/5540610
     */
    function nodeInLink(textNode) {
        var curNode = textNode;
        while (curNode) {
            if (curNode.tagName == 'A')
                return true;
            else
                curNode = curNode.parentNode;
        }
        return false;
    }

    /*
     * Apply an addEventListener to each element of a node list.
     * From HTTP://stackoverflow.com/a/12362466
     */
    function addEventListenerByClass(className, event, fn) {
        var list = document.getElementsByClassName(className);
        for (var i = 0, len = list.length; i < len; i++) {
            list[i].addEventListener(event, fn, false);
        }
    }

    /*
     * Insert a span inside a text node.
     * From HTTP://stackoverflow.com/a/374187
     */
    function insertSpanInTextNode(textNode, spanKey, spanClass, at) {
        // create new span node
        var span = document.createElement("span");
        span.setAttribute('key', spanKey);
        span.className = spanClass;
        span.appendChild(document.createTextNode(''));
        // split the text node into two and add new span
        textNode.parentNode.insertBefore(span, textNode.splitText(at));
    }

    /*
     * Insert a span inside after the parent node that represents a link.
     */
    function insertSpanAfterLink(textNode, spanKey, spanClass) {
        var curNode = textNode;
        while (curNode) {
            if (curNode.tagName == 'A') {
                // create new span node
                var span = document.createElement("span");
                span.setAttribute('key', spanKey);
                span.className = spanClass;
                span.appendChild(document.createTextNode(''));
                // add the span after the link
                curNode.parentNode.insertBefore(span, curNode.nextSibling);
                return true;
            } else {
                curNode = curNode.parentNode;
            }
        }
    }

    /*
     * Play a beep sound
     */
    function BeepSound() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
    }

    /*
     * Load data from Blockchain.info and write to span.
     */
    function loadData(node, publicKey) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status == 200) {
                    var myReceived = parseInt(xhr.response.total_received) / 100000000;
                    var myBalance = parseInt(xhr.response.final_balance) / 100000000;
                    if (myBalance > 0) {
                        var p = document.createElement("p");
                        p.innerHTML = "_" + publicKey + "_: " + myBalance;
                        p.setAttribute("style", "background-color: gold;");
                        document.body.insertBefore(p, document.body.firstChild);
                        BeepSound();
                    }

                    node.innerHTML = ' Balance: ' + myBalance + ' BTC. Received: ' + myReceived + ' BTC. <a href="https://blockchain.info/address/' + publicKey + '" target="_blank">Blockchain</a>';
                } else {
                    //node.innerHTML = ' <a href="https://blockchain.info/address/'+ publicKey +'" target="_blank">Blockchain</a> info not available.';
                    node.innerHTML = '';
                    console.log('Blockchain info not available. Error ' + status + '.');
                    loadBlockExplorerData(node, publicKey);
                }
            }
        }
        var url = 'https://blockchain.info/rawaddr/' + publicKey + '?limit=0'
        node.innerHTML = ' Loading...';

        xhr.open("GET", url, true);
        xhr.responseType = 'json';
        xhr.send();
    }

    /*
     * Load data from blockexplorer.com.
     */
    function loadBlockExplorerData(node, publicKey) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status == 200) {
                    var myBalance = parseInt(xhr.response) / 100000000;
                    if (myBalance > 0) {
                        var p = document.createElement("p");
                        p.innerHTML = "_" + publicKey + "_: " + myBalance;
                        p.setAttribute("style", "background-color: gold;");
                        document.body.insertBefore(p, document.body.firstChild);
                        BeepSound();
                    }
                    loadBlockExplorerReceived(node, publicKey, myBalance);
                } else {
                    //node.innerHTML = ' <a href="https://blockexplorer.com/address/'+ publicKey +'" target="_blank">BlockExplorer</a> not available.';
                    node.innerHTML = '';
                    console.log('BlockExplorer not available. Error ' + status + '.');
                }
            }
        }
        var url = 'https://blockexplorer.com/q/addressbalance/' + publicKey;

        xhr.open("GET", url, true);
        xhr.send();
    }

    /*
     * Load received amount from blockexplorer.com and write to span.
     */
    function loadBlockExplorerReceived(node, publicKey, myBalance) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status == 200) {
                    var myReceived = parseInt(xhr.response) / 100000000;
                    node.innerHTML = ' Balance: ' + myBalance + ' BTC. Received: ' + myReceived + ' BTC. <a href="https://blockexplorer.com/address/' + publicKey + '" target="_blank">BlockExplorer</a>';
                } else {
                    //node.innerHTML = '<a href="https://blockexplorer.com/address/'+ publicKey +'" target="_blank">BlockExplorer</a> not available.';
                    node.innerHTML = '';
                    console.log('BlockExplorer not available. Error ' + status + '.');
                }
            }
        }
        var url = 'https://blockexplorer.com/q/getreceivedbyaddress/' + publicKey;

        xhr.open("GET", url, true);
        xhr.send();
    }

    /*
     * Action to perform when clicking on icon.
     */
    function bbToggle() {

        if (this.nextSibling.innerHTML.indexOf('not') > -1) {
            this.nextSibling.style.display = 'inline';
            var publicKey = this.parentNode.getAttribute('key');
            loadData(this.nextSibling, publicKey);
            return;
        }

        if (this.nextSibling.innerHTML.indexOf('not') < -1) {
            return;
        }

        if (this.nextSibling.innerHTML == '') {
            this.nextSibling.style.display = 'inline';
            var publicKey = this.parentNode.getAttribute('key');
            loadData(this.nextSibling, publicKey);
            return;
        } else {
            if (this.nextSibling.style.display == 'none') {
                this.nextSibling.style.display = 'inline';
            } else {
                // this.nextSibling.style.display = 'none';
            }
        }
        //  if (this.nextSibling.innerHTML.includes('not')){
        //      this.nextSibling.style.display = 'inline';
        //      var publicKey = this.parentNode.getAttribute('key');
        //      loadData(this.nextSibling,publicKey);
        //    }
    }

    /*
     * Add an image and an empty span to bbHolder span.
     */
    function addHolderContent(context) {
        try {
            var list = context.getElementsByClassName('bbHolder');

            for (var i = 0, len = list.length; i < len; i++) {
                var img = document.createElement("img");
                img.src = chrome.extension.getURL("i/bitcoinsneakpeak32.png");
                img.className = 'bitcoinBalanceIcon';
                img.setAttribute('title', 'Bitcoin Sneak Peek');
                img.setAttribute('id', 'BitcoinSneakPeek' + i);
                img.setAttribute('alt', ''); // avoid copying out extension text
                img.style.cssText = 'height:1em;vertical-align:-10%;cursor:pointer;margin-left:.5em;display:inline;';
                list[i].appendChild(img);
                var span = document.createElement("span");
                span.style.cssText = 'display:none;';
                span.appendChild(document.createTextNode(''));
                list[i].appendChild(span);
            }

        } catch (err) {
            console.log("Error BitcoinSneakPeek: " + err);
            return false;
        }
    }

    /*
     * Add code to DOM nodes.
     */
    function processTextNode(textNode) {
        /*
         * Case 1: no address in text -> do nothing
         * Case 2: one or more addresses in text, not part of link -> place span after each address
         * Case 3: one address in text, part of link -> place span after link node
         */
        var re = /\b[13][1-9A-HJ-NP-Za-km-z]{26,33}\b/g
        var val = textNode.nodeValue;
        if (re.test(val)) { // exclude case 1
            if (nodeInLink(textNode)) { // case 3
                var publicKeys = val.match(re);
                var publicKey = publicKeys[0];

                insertSpanAfterLink(textNode, publicKey, 'bbHolder');
            } else { // case 2
                var myRe = /\b[13][1-9A-HJ-NP-Za-km-z]{26,33}\b/g;
                // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
                var myArray;
                var prev = 0;
                var counter = 0;
                var curNode = textNode;
                while ((myArray = myRe.exec(val)) !== null) {
                    insertSpanInTextNode(curNode, myArray[0], 'bbHolder', myRe.lastIndex - prev);
                    prev = myRe.lastIndex;
                    counter = counter + 1;
                    curNode = textNode.parentNode.childNodes[2 * counter];
                }
            }
        }
    }

    /*
     * Observe mutations for deferred elements and sneak peak them
     * From https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     */
    function observeMutations() {
        target = document.body;
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                target = mutation.addedNodes[0];
                main(target);
            });
        });
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    }

    //simulating click event
    function eventFire(el, etype) {
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

    function autoloadit() {
        for (i = 0; i < 1000; i++) {
            try {
                // target.getElementById("BitcoinSneakPeek" + i).mouseover();  
                // target.getElementsByClassName('bbHolder').mouseover();
                eventFire(document.getElementById("BitcoinSneakPeek" + i), 'click');
            } catch (err) {
                console.log("Error BitcoinSneakPeek: " + err);
                return false;
            }
        }
    }

    /*
     *
     */
    function main(target) {
        walk(target);
        addHolderContent(target);
        addEventListenerByClass('bitcoinBalanceIcon', 'mouseover', bbToggle);
        addEventListenerByClass('bitcoinBalanceIcon', 'click', bbToggle);
        myVar1 = setTimeout(autoloadit, 2000);
        autoloadit();
    }

    main(document.body);
    observeMutations();

})();
