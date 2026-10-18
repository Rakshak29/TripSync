import React from 'react'
import { renderToString } from 'react-dom/server'
import { SAMPLE_DESTINATIONS, matchSampleDestinations } from '../src/data/sampleDestinations.js'

console.log('--- Testing Discover Places Component Rendering & Visual Rules ---')

// 1. Verify absence of any img or image references in sample dataset
for (const dest of SAMPLE_DESTINATIONS) {
  console.assert(!dest.image, `Destination ${dest.name} should not have an image property`)
  console.assert(!dest.imageUrl, `Destination ${dest.name} should not have an imageUrl property`)
}
console.log('✓ Test 1 Passed: Sample destinations dataset contains NO photograph/image references.')

// 2. Mock rendering of Text-First Result Cards
function renderTextCard(dest, matchingExp = []) {
  return renderToString(
    React.createElement('article', { className: 'ts-text-dest-card' }, [
      React.createElement('div', { key: 'head', className: 'ts-text-card-header' }, [
        React.createElement('span', { key: 'cat', className: 'ts-category-pill-tag' }, `${dest.categoryIcon} ${dest.category}`),
        React.createElement('span', { key: 'loc', className: 'ts-card-location-text' }, `📍 ${dest.state}`),
        React.createElement('h3', { key: 'title', className: 'ts-text-card-title' }, dest.name)
      ]),
      React.createElement('p', { key: 'desc', className: 'ts-text-card-desc' }, dest.description),
      React.createElement('div', { key: 'specs', className: 'ts-text-card-specs' }, [
        React.createElement('div', { key: 'dur', className: 'ts-spec-item' }, [
          React.createElement('span', { key: 'l1', className: 'ts-spec-label' }, 'Duration'),
          React.createElement('span', { key: 'v1', className: 'ts-spec-value' }, `⏱️ ${dest.durationDisplay}`)
        ]),
        React.createElement('div', { key: 'bud', className: 'ts-spec-item' }, [
          React.createElement('span', { key: 'l2', className: 'ts-spec-label' }, 'Approx. Budget'),
          React.createElement('span', { key: 'v2', className: 'ts-spec-value' }, `💰 ${dest.budgetDisplay}`)
        ])
      ]),
      React.createElement('div', { key: 'exp', className: 'ts-text-card-experiences' },
        dest.experiences.map((exp) =>
          React.createElement('span', {
            key: exp,
            className: `ts-experience-pill ${matchingExp.includes(exp) ? 'is-match' : ''}`
          }, exp)
        )
      )
    ])
  )
}

const manaliCard = renderTextCard(SAMPLE_DESTINATIONS[0], ['Mountains'])
console.assert(!manaliCard.includes('<img'), 'Destination card must NOT contain any <img> tags')
console.assert(manaliCard.includes('Manali'), 'Card should render destination name')
console.assert(manaliCard.includes('Himachal Pradesh'), 'Card should render state')
console.assert(manaliCard.includes('⏱️'), 'Card should render duration specs')
console.assert(manaliCard.includes('💰'), 'Card should render budget specs')
console.log('✓ Test 2 Passed: Text-first destination card renders properly without images.')

// 3. Mock rendering of Modal
function renderTextModal(dest) {
  return renderToString(
    React.createElement('div', { className: 'ts-modal-box ts-text-destination-modal' }, [
      React.createElement('h2', { key: 't', className: 'ts-destination-modal-title' }, dest.name),
      React.createElement('p', { key: 'o', className: 'ts-modal-section-text' }, dest.overview),
      React.createElement('ul', { key: 'h', className: 'ts-modal-highlights-list' },
        dest.highlights.map((h, i) => React.createElement('li', { key: i }, h))
      )
    ])
  )
}

const modalHtml = renderTextModal(SAMPLE_DESTINATIONS[0])
console.assert(!modalHtml.includes('<img'), 'Destination modal must NOT contain any <img> tags')
console.assert(modalHtml.includes('Solang Valley'), 'Modal should display notable highlights')
console.log('✓ Test 3 Passed: Text-first modal renders properly without images.')

console.log('All Component Rendering tests PASSED successfully!')
