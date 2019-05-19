const fuzzyOptions = { extract: ({ title }) => title }
const ARROW_DOWN_KEY_CODE = 'ArrowDown'
const ARROW_UP_KEY_CODE = 'ArrowUp'
const ENTER_KEY_CODE = 'Enter'

const searchInputRef = document.getElementById('searchInput')
const listRef = document.getElementById('resultsTable')
let bookmarks = []
let justLoaded = true
let goToIndex = 0

const openURL = (url) => window.open(url, '_blank').focus()

const setOnClick = (url) => () => openURL(url)

const log = (arg) => chrome.extension.getBackgroundPage().console.log(arg)

const onTextInput = (element) => {
    const searchText = element.target.value
    let results = fuzzy.filter(searchText, bookmarks, fuzzyOptions)
    listRef.innerHTML = ""
    results.forEach((result, i) => {
        const newRow = document.createElement("div")
        newRow.id = result.index
        newRow.className = 'row'
        newRow.innerText = `${ result.original.title }`
        newRow.addEventListener("click", setOnClick(result.original.url))
        newRow.tabIndex = 0
        listRef.appendChild(newRow)
    })
    log(results)
    justLoaded = true
}

const onKeyPress = (key) => {
    const finalIndex = listRef.children.length - 1
    if (key.code == ARROW_DOWN_KEY_CODE) {
        if (!justLoaded) {
            goToIndex = goToIndex === finalIndex ? 0 : goToIndex + 1
        }
        listRef.children.item(goToIndex).focus()
        justLoaded = false
    } else if (key.code == ARROW_UP_KEY_CODE) {
        goToIndex = goToIndex === 0 ? finalIndex : goToIndex - 1
        listRef.children.item(goToIndex).focus()
        justLoaded = false
    } else if (key.code == ENTER_KEY_CODE) {
        const itemId = listRef.children.item(goToIndex).id
        openURL(bookmarks[itemId].url)
    } else {
        goToIndex = 0
        justLoaded = true
        searchInputRef.focus()
    }
}

const populateBookmarks = () => {
    chrome.bookmarks.getTree(
        function (bookmarkTreeNodes) {
            for (var i = 0; i < bookmarkTreeNodes.length; i++) {
                var node = bookmarkTreeNodes[i]
                processBookmarkNode(node)
            }
        }
    );
}

const processBookmarkNode = (bookmarkNode) => {
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

document.addEventListener('keydown', onKeyPress, false)
searchInputRef.addEventListener('keydown', onTextInput, false)
populateBookmarks()
