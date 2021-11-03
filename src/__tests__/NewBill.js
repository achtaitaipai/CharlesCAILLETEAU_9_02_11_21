import { fireEvent, screen } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'

describe('Given I am connected as an employee', () => {
	describe('When I do fill fields in incorrect format and I click on button Send', () => {
		test('Then it should renders New Bill page', () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			const type = screen.getByTestId('expense-type')
			fireEvent.change(type, { target: { value: 'Services en ligne' } })
			expect(type.value).toBe('Services en ligne')

			const date = screen.getByTestId('datepicker')
			fireEvent.change(date, { target: { value: '2021-11-01' } })
			expect(date.value).toBe('2021-11-01')

			const amountInput = screen.getByTestId('amount')
			fireEvent.change(amountInput, { target: { value: '123' } })
			expect(amountInput.value).toBe('123')

			const tva = screen.getByTestId('vat')
			fireEvent.change(tva, { target: { value: '10' } })
			expect(tva.value).toBe('10')

			const pct = screen.getByTestId('pct')
			fireEvent.change(pct, { target: { value: '20' } })
			expect(pct.value).toBe('20')

			const file = screen.getByTestId('file')
			fireEvent.change(file, { target: { value: '' } })
			expect(file.value).toBe('')

			const submitNewBill = screen.getByTestId('form-new-bill')
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			)

			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			const firestore = null
			const newBill = new NewBill({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage,
			})
			const handleSubmit = jest.fn(newBill.handleSubmit)
			submitNewBill.addEventListener('submit', handleSubmit)
			fireEvent.submit(submitNewBill)
			expect(handleSubmit).toHaveBeenCalled()
			expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
		})
	})
})
