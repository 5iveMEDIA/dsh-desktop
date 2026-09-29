// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { mountWindowsTitlebarLayout } from '../src/preload/windows-titlebar'

afterEach(() => {
  vi.unstubAllGlobals()
  document.head.replaceChildren()
  document.body.replaceChildren()
  document.documentElement.removeAttribute('data-windows-titlebar')
})

it('drops the sidebar patch padding once Harness reserves the Windows caption row', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => undefined }))
  vi.stubGlobal('ResizeObserver', class { observe(): void {} unobserve(): void {} })
  // The dsh-client-ui-sidebar patch adds this padding for non-macOS captions.
  const patch = document.createElement('style')
  patch.textContent = 'html:not([data-platform=darwin]) [data-dsh-sidebar-root][data-dsh-sidebar-wide="true"]{padding-top:32px}'
  document.head.append(patch)
  const sidebar = document.createElement('div')
  sidebar.setAttribute('data-dsh-sidebar-root', '')
  sidebar.setAttribute('data-dsh-sidebar-wide', 'true')
  document.body.append(sidebar)
  expect(getComputedStyle(sidebar).paddingTop).toBe('32px')

  mountWindowsTitlebarLayout({ document, ipcRenderer: { invoke: async () => undefined } })

  expect(document.documentElement.hasAttribute('data-windows-titlebar')).toBe(true)
  expect(getComputedStyle(sidebar).paddingTop).toBe('0px')
})
