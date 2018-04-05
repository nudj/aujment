var observeDOM = (function () {
  var MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener

  return function (obj, callback) {
    if (MutationObserver) {
      // define a new observer
      var obs = new MutationObserver(function (mutations, observer) {
        if (
          mutations[0].addedNodes.length ||
          mutations[0].removedNodes.length
        ) {
          callback()
        }
      })
      // have the observer observe foo for changes in children
      obs.observe(obj, { childList: true, subtree: true })
    } else if (eventListenerSupported) {
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
})()

const camelCase = (words) => {
  return words
    .split(' ')
    .map((word, index) => {
      word = word.toLowerCase()
      if (index) {
        word = word[0].toUpperCase() + word.slice(1)
      }
      return word
    })
    .join('')
}

const limits = {
  thisCycle: {
    pointMin: 10,
    pointMax: 40
  },
  inProgress: {
    issueMin: 0,
    issueMax: 5
  },
  codeReview: {
    issueMin: 0,
    issueMax: 3
  },
  _release: {
    issueMin: 0,
    issueMax: 15
  }
}

const WIPS = {
  ...limits,
  forReview: {
    ...limits._release,
    combinesWith: 'forProduction'
  },
  forProduction: {
    ...limits._release,
    combinesWith: 'forReview'
  }
}

const fgRed = '#E35205'
const bgRed = '#f4d4c8'

// Observe a specific DOM element:
observeDOM(document.getElementById('app'), function () {
  const columnElms = [...document.querySelectorAll('.zhc-pipeline')]
  if (columnElms.length) {
    const {
      list: columnList,
      map: columnMap
    } = columnElms.reduce((columnData, columnElm) => {
      const issueCountElm = columnElm.querySelector('.zhc-pipeline-header__issue-count')
      const storyPointsElm = columnElm.querySelector('.zhc-pipeline-header__story-points')
      const columnTitleElm = columnElm.querySelector('.zhc-pipeline-header__title')
      const issueCount = (issueCountElm && parseInt(issueCountElm.innerText.split(' ')[0], 10)) || 0
      const storyPoints = (storyPointsElm && parseInt(storyPointsElm.innerText.split(' ')[1], 10)) || 0
      const title = (columnTitleElm && columnTitleElm.innerText) || ''
      const camelTitle = camelCase(title)
      const column = {
        columnElm,
        issueCount,
        storyPoints,
        title,
        camelTitle
      }

      columnData.list = (columnData.list || []).concat(column)
      columnData.map = {
        ...columnData.map,
        [camelTitle]: column
      }
      return columnData
    })
    columnList.forEach(column => {
      let error = false
      const wips = WIPS[column.camelTitle]

      if (wips) {
        let issueCount = column.issueCount
        let storyPoints = column.storyPoints

        if (wips.combinesWith) {
          const pairedColumn = columnMap[wips.combinesWith] || {}
          issueCount += pairedColumn.issueCount || 0
          storyPoints += pairedColumn.storyPoints || 0
        }

        if (wips.issueMin && issueCount < wips.issueMin) {
          error = true
        } else if (wips.issueMax && issueCount > wips.issueMax) {
          error = true
        } else if (wips.pointMin && storyPoints < wips.pointMin) {
          error = true
        } else if (wips.pointMax && storyPoints > wips.pointMax) {
          error = true
        } else {
          error = false
        }

        if (error) {
          column.columnElm.style.backgroundColor = fgRed
        } else {
          column.columnElm.backgroundColor = 'transparent'
        }
      }
    })
    const cardElms = [...document.querySelectorAll('.zhc-issue-card')]
    cardElms.forEach(cardElm => {
      const labels = [...cardElm.querySelectorAll('.zhc-label')]
      const isExpedited = labels.some(label => label.textContent === 'EXPEDITED')
      if (isExpedited) {
        cardElm.style.backgroundColor = bgRed
        cardElm.style.borderColor = fgRed
      }
    })
  }
})
