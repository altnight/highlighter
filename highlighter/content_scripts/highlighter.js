(function () {

  // initialize
  const DEFAULT_COLOR = 'black'
  let items = []
  updatePage()

  async function updatePage() {
    const settings = await loadFromStorage()

    if (!settings['highlighter']) {
      items = []
    } else {
      items = settings['highlighter']
    }

    updateStyle()
  }

  function updateStyle() {
    const target = location.origin
    let item = items.find(item => {
      if (new RegExp(item.origin).test(target)) {
        return true
      }
    })

    if (item) {
      setStyle(getColor(item), getHeight(item))
    } else {
      clearStyle()
    }
  }

  function setStyle(color, height) {
    let div = document.getElementById('highlighter-content')
    if (!div) {
      div = document.createElement('div')
      div.id = 'highlighter-content'
      document.body.appendChild(div)
    }
    div.className = 'active'
    div.style.backgroundColor = color
    div.style.height = height
  }
  function clearStyle() {
    let div = document.getElementById('highlighter-content')
    if (!div) {
      return
    }
    div.className = 'inactive'
  }

  async function loadFromStorage() {
    return browser.storage.local.get('highlighter')
  }

  browser.runtime.onMessage.addListener(message => {
    if (message.command === "itemUpdated") {
      updatePage()
    }
  })

})()
