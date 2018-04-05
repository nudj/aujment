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

const WIPS = {
  'This Cycle': {
    pointMin: 10,
    pointMax: 40
  },
  'In Progress': {
    issueMin: 0,
    issueMax: 5
  },
  'Code Review': {
    issueMin: 0,
    issueMax: 3
  },
  'Release': {
    issueMin: 0,
    issueMax: 15
  }
}

const fgRed = '#E35205'
const bgRed = '#f4d4c8'

// Observe a specific DOM element:
observeDOM(document.getElementById('app'), function () {
  const columns = [...document.querySelectorAll('.zhc-pipeline')]
  if (columns.length) {
    columns
      .map(column => {
        const issueCountElm = column.querySelector(
          '.zhc-pipeline-header__issue-count'
        )
        const storyPointsElm = column.querySelector(
          '.zhc-pipeline-header__story-points'
        )
        const columnTitleElm = column.querySelector(
          '.zhc-pipeline-header__title'
        )

        const data = {}

        if (issueCountElm) {
          data.issueCount = parseInt(issueCountElm.innerText.split(' ')[0], 10)
          data._issueCountElm = issueCountElm
        }

        if (storyPointsElm) {
          data.storyPoints = parseInt(storyPointsElm.innerText.split(' ')[1], 10)
          data._storyPointsElm = storyPointsElm
        }

        if (columnTitleElm) {
          data.title = columnTitleElm.innerText
          data._titleElm = columnTitleElm
        }

        data._column = column

        return data
      })
      .forEach(column => {
        const wips = WIPS[column.title.split(':')[0]]
        let error = false

        if (wips) {
          if (wips.issueMin && column.issueCount < wips.issueMin) {
            error = true
          } else if (wips.issueMax && column.issueCount > wips.issueMax) {
            error = true
          } else if (wips.pointMin && column.storyPoints < wips.pointMin) {
            error = true
          } else if (wips.pointMax && column.storyPoints > wips.pointMax) {
            error = true
          } else {
            error = false
          }

          if (error) {
            column._column.style.backgroundColor = fgRed
          } else {
            column._column.style.backgroundColor = 'transparent'
          }
        }
      })
    const cards = [...document.querySelectorAll('.zhc-issue-card')]
    cards.forEach(card => {
      const labels = [...card.querySelectorAll('.zhc-label')]
      const isExpedited = labels.some(label => label.textContent === 'EXPEDITED')
      if (isExpedited) {
        card.style.backgroundColor = bgRed
        card.style.borderColor = fgRed
      }
    })
  }
})
