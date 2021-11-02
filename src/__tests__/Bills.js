import { screen } from '@testing-library/dom'
import '@testing-library/jest-dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import Router from '../app/Router.js'
import { ROUTES_PATH } from '../constants/routes.js'
import Firestore from '../app/Firestore'
import { localStorageMock } from '../__mocks__/localStorage'

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', () => {
			const data = []
			const loading = false
			const error = null
			Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] } })
			document.body.innerHTML = '<div id="root"></div>'
			Router()
			const button = screen.getByTestId('icon-window')
			expect(button).toHaveClass('active-icon')
		})

		test('Then bills should be ordered from earliest to latest', () => {
			const html = BillsUI({ data: bills })
			document.body.innerHTML = html
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
			const antiChrono = (a, b) => (a < b ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})
	})
	describe('When I am on Bills Page but back-end send an error message', () => {
		test('Then, Error page should be rendered', () => {
			const html = BillsUI({ error: 'some error message' })
			document.body.innerHTML = html
			expect(screen.getAllByText('Erreur')).toBeTruthy()
		})
	})
})
