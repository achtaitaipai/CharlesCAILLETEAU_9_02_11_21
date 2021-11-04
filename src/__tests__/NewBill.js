import { screen, fireEvent } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import BillsUI from '../views/BillsUI.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES } from '../constants/routes.js'
import firebase from '../__mocks__/firebase'

describe('Given I am connected as an employee', () => {
	describe('When I do not fill fields and I click on employee button Login In', () => {
		test('Then It should renders Login page', () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			const type = screen.getByTestId('expense-type')
			fireEvent.change(type, { target: { value: '' } })
			expect(type.value).toBe('')

			const date = screen.getByTestId('datepicker')
			fireEvent.change(date, { target: { value: '' } })
			expect(date.value).toBe('')

			const amountInput = screen.getByTestId('amount')
			fireEvent.change(amountInput, { target: { value: '' } })
			expect(amountInput.value).toBe('')

			const tva = screen.getByTestId('vat')
			fireEvent.change(tva, { target: { value: '' } })
			expect(tva.value).toBe('')

			const pct = screen.getByTestId('pct')
			fireEvent.change(pct, { target: { value: '' } })
			expect(pct.value).toBe('')

			const file = screen.getByTestId('file')
			fireEvent.change(file, { target: { value: '' } })
			expect(file.value).toBe('')

			const form = screen.getByTestId('form-new-bill')
			const handleSubmit = jest.fn(e => e.preventDefault())

			form.addEventListener('submit', handleSubmit)
			fireEvent.submit(form)
			expect(screen.getByTestId('form-new-bill')).toBeTruthy()
		})
	})
	describe('When I do fill fields in incorrect format and I click on button Send', () => {
		test('Then it should renders New Bill page', () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			const type = screen.getByTestId('expense-type')
			fireEvent.change(type, { target: { value: '  ' } })

			const date = screen.getByTestId('datepicker')
			fireEvent.change(date, { target: { value: '  ' } })

			const amountInput = screen.getByTestId('amount')
			fireEvent.change(amountInput, { target: { value: '  ' } })

			const tva = screen.getByTestId('vat')
			fireEvent.change(tva, { target: { value: '  ' } })

			const pct = screen.getByTestId('pct')
			fireEvent.change(pct, { target: { value: '  ' } })

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
	describe('When in uploade a file', () => {
		test('Then the file of the input should be modified', async () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

			const onNavigate = pathname => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			const snapshotMock = {
				ref: {
					getDownloadURL: jest.fn().mockResolvedValue('oui'),
				},
			}
			const putMock = { put: jest.fn().mockResolvedValue(snapshotMock) }
			const refMock = jest.fn().mockReturnValue(putMock)
			let firestore = {
				storage: {
					ref: refMock,
				},
			}
			const newBill = new NewBill({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage,
			})

			const inputFile = screen.getByTestId('file')

			const handleFile = jest.fn(e => {
				e.preventDefault()
				newBill.handleSubmit
			})
			inputFile.addEventListener('change', handleFile)

			const file = new File(['test file'], 'testFile.jpg', { type: 'image/jpg' })
			fireEvent.change(inputFile, { target: { files: [file] } })
			expect(inputFile.files[0]).toBe(file)
			expect(handleFile).toHaveBeenCalled()
		})
	})

	describe('When I navigate to Dashboard', () => {
		const bill = {
			id: '47qAXb6fIm2zOKkLzMro',
			vat: '80',
			fileUrl: 'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
			status: 'pending',
			type: 'Hôtel et logement',
			commentary: 'séminaire billed',
			name: 'encore',
			fileName: 'preview-facture-free-201801-pdf-1.jpg',
			date: '2004-04-04',
			amount: 400,
			commentAdmin: 'ok',
			email: 'a@a',
			pct: 20,
		}
		test('post bill from mock API GET', async () => {
			const getSpy = jest.spyOn(firebase, 'post')
			const request = await firebase.post(bill)
			expect(request).toBe('ok')
		})
		test('post bill from an API and fails with 404 message error', async () => {
			firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
			const html = BillsUI({ error: 'Erreur 404' })
			document.body.innerHTML = html
			const message = await screen.getByText(/Erreur 404/)
			expect(message).toBeTruthy()
		})
		test('post bill from an API and fails with 500 message error', async () => {
			firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))
			const html = BillsUI({ error: 'Erreur 500' })
			document.body.innerHTML = html
			const message = await screen.getByText(/Erreur 500/)
			expect(message).toBeTruthy()
		})
	})
})
