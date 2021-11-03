import { fireEvent, screen } from '@testing-library/dom'
import '@testing-library/jest-dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import Router from '../app/Router.js'
import Firestore from '../app/Firestore'
import { localStorageMock } from '../__mocks__/localStorage'
import Bills from '../containers/Bills'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import firebase from '../__mocks__/firebase'

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
	})
	describe('When I am on Bills Page', () => {
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
	describe('When I am on Bills Page and I click on eye', () => {
		test('then the modal should be show', () => {
			const html = BillsUI({ data: bills })
			document.body.innerHTML = html
			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			const bill = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
			$.fn.modal = jest.fn()
			const eyeButton = screen.getAllByTestId('icon-eye')[0]
			fireEvent.click(eyeButton)
			const modal = screen.getByTestId('modal')
			expect(modal).toHaveStyle('display: block')
		})
	})
	describe('When I am on Bills Page and I click on new bill', () => {
		test('the content of the page should be updtated', () => {
			const html = BillsUI({ data: [] })
			document.body.innerHTML = html
			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			const bills = new Bills({ document, onNavigate })
			const newBillBtn = screen.getByTestId('btn-new-bill')
			fireEvent.click(newBillBtn)
			expect(screen.getAllByText('Type de dépense')).toBeTruthy()
		})
	})
	describe('When I am on Bills Page', () => {
		const html = BillsUI({ data: [] })
		document.body.innerHTML = html
		const onNavigate = pathname => {
			document.body.innerHTML = ROUTES({ pathname })
		}
		test('fetches bills from mock API GET', async () => {
			const getSpy = jest.spyOn(firebase, 'get')
			const bills = await firebase.get()
			expect(getSpy).toHaveBeenCalledTimes(1)
			expect(bills.data.length).toBe(4)
		})
		test('fetches bills from an API and fails with 404 message error', async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
			const html = BillsUI({ error: 'Erreur 404' })
			document.body.innerHTML = html
			const message = await screen.getByText(/Erreur 404/)
			expect(message).toBeTruthy()
		})
		test('fetches messages from an API and fails with 500 message error', async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))
			const html = BillsUI({ error: 'Erreur 500' })
			document.body.innerHTML = html
			const message = await screen.getByText(/Erreur 500/)
			expect(message).toBeTruthy()
		})
	})
})
