var bookmarks = [];

const ARROW_DOWN_KEY_CODE = 'ArrowDown'
const ARROW_UP_KEY_CODE = 'ArrowUp'
const ENTER_KEY_CODE = 'Enter'

let searchInput = document.getElementById('searchInput');
let tableRef = document.getElementById('resultsTable');
let justLoaded = true
let goToIndex = 0

let fuzzyOptions = {
    extract: function (el) { return el.title; }
};

document.addEventListener('keydown', function (key) {
    if (key.code == ARROW_DOWN_KEY_CODE) {
        if (justLoaded) {
            tableRef.rows[goToIndex].focus()
            justLoaded = false
        } else {
            goToIndex += 1
            tableRef.rows[goToIndex].focus()
        }
    } else if (key.code == ARROW_UP_KEY_CODE) {
        if (goToIndex > 0) {
            goToIndex -= 1
            tableRef.rows[goToIndex].focus()
        }
    } else if (key.code == ENTER_KEY_CODE) {
        openURL(bookmarks[tableRef.rows[goToIndex].id].url)
    } else {
        goToIndex = 0 // reset the index for a new search
        justLoaded = true
        searchInput.focus()
    }
}, false);

populateBookmarks()
console.log(bookmarks)

searchInput.onkeydown = function (element) {
    var results = []
    while (tableRef.rows.length > 0) {
        tableRef.deleteRow(0);
    }
    var searchText = element.target.value
    let fuzzyResults = fuzzy.filter(searchText, bookmarks, fuzzyOptions);
    fuzzyResults.map(function (el) {
        results.push(el)
    });
    for (var i = 0; i < results.length; i++) {
        let result = results[i]
        var newRow = tableRef.insertRow(i);
        newRow.id = result.index
        newRow.className = 'row'
        newRow.innerHTML = `${result.original.title}`;
        newRow.addEventListener("click", function () {
            openURL(result.original.url)
        })
        newRow.tabIndex = i
    }
};

function populateBookmarks() {
    chrome.bookmarks.getTree(
        function (bookmarkTreeNodes) {
            for (var i = 0; i < bookmarkTreeNodes.length; i++) {
                var node = bookmarkTreeNodes[i]
                processBookmarkNode(node)
            }
        }
    );
}

function processBookmarkNode(bookmarkNode) {
    if (bookmarkNode.children) {
        processBookmarkNode(bookmarkNode.children)
    } else {
        for (var i = 0; i < bookmarkNode.length; i++) {
            var child = bookmarkNode[i]
            if (child.children) {
                processBookmarkNode(child)
            } else {
                bookmarks.push({
                    "index": child.index,
                    "title": child.title,
                    "url": child.url,
                })
            }
        }
    }
}

function openURL(url) {
    var win = window.open(url, '_blank');
    win.focus();
}
