import { createElement } from 'lwc';
import ApexWireMethodWithParams from 'c/apexWireMethodWithParams';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import findContacts from '@salesforce/apex/ContactController.findContacts';

// Mock with realistic Contact record
const mockFindContacts = require('./data/findContacts.json');

// Mock with an empty list of records
const mockFindContactsNoRecords = require('./data/findContactsNoRecords.json');

// Register as Apex wire adapter.
const findContactsAdapter = registerApexTestWireAdapter(findContacts);

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/ 

// "c-apex-wire-method-with-params" - is a description.
//Salesforce recommends having a top level describe block with a description matching the component name.
describe('c-apex-wire-method-with-params', () => {
    beforeAll(() => {
        // We use fake timers as setTimeout is used in the component's JavaScript file.
        jest.useFakeTimers();
    });

    // Reset the DOM at the end of the test
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        //Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    // The block of positive tests
    describe('findContacts @wire data', () => {
        /*
        "it" is an alias for "test".
        An "it" block describes a single test.
        */

        // Test that the component uses user input as parameters to call apex.
        it('gets called with data from user input', () => {
            const USER_INPUT = 'Amy';
            const WIRE_PARAMETER = { searchKey: USER_INPUT };

            // "createElement" - method to create an instance of the component to test
            const element = createElement('c-apex-wire-method-with-params', {
                is: ApexWireMethodWithParams
            });
            /*
            Add the component to the test's version of document.
            The "appendChild()" call inserts the component into the DOM and
            the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
            */
            document.body.appendChild(element);

            // Select input field for simulating user input
            const inputEl = element.shadowRoot.querySelector('lightning-input');
            inputEl.value = USER_INPUT;
            inputEl.dispatchEvent(new CustomEvent('change'));

            // Run all fake timers.
            jest.runAllTimers();

            // Return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the promise rejects.
            return Promise.resolve().then(() => {
                // Validate parameters of wire adapter.
                // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
                expect(findContactsAdapter.getLastConfig()).toEqual(
                    WIRE_PARAMETER
                );
            });
        });


        it('renders data of one record getted from apex', () => {
            const USER_INPUT = 'Amy';

            const element = createElement('c-apex-wire-method-with-params', {
                is: ApexWireMethodWithParams
            });
            document.body.appendChild(element);

            const inputEl = element.shadowRoot.querySelector('lightning-input');
            inputEl.value = USER_INPUT;
            inputEl.dispatchEvent(new CustomEvent('change'));

            jest.runAllTimers();

            //Emulate apex answer.
            findContactsAdapter.emit(mockFindContacts);

            return Promise.resolve().then(() => {
                const detailEls = element.shadowRoot.querySelectorAll('p');
                expect(detailEls.length).toBe(mockFindContacts.length);
                expect(detailEls[0].textContent).toBe(mockFindContacts[0].Name);
            });
        });

        it('renders no items when no record is available', () => {
            const USER_INPUT = 'does not exist';

            const element = createElement('c-apex-wire-method-with-params', {
                is: ApexWireMethodWithParams
            });
            document.body.appendChild(element);

            const inputEl = element.shadowRoot.querySelector('lightning-input');
            inputEl.value = USER_INPUT;
            inputEl.dispatchEvent(new CustomEvent('change'));

            jest.runAllTimers();

            findContactsAdapter.emit(mockFindContactsNoRecords);

            return Promise.resolve().then(() => {
                const detailEls = element.shadowRoot.querySelectorAll('p');
                expect(detailEls.length).toBe(mockFindContactsNoRecords.length);
            });
        });
    });
    // The bloc of negative and error tests
    describe('findContacts @wire error', () => {
        it('shows error panel element', () => {
            const element = createElement('c-apex-wire-method-with-params', {
                is: ApexWireMethodWithParams
            });
            document.body.appendChild(element);

            // Generate error
            findContactsAdapter.error();

            return Promise.resolve().then(() => {
                const errorPanelEl = element.shadowRoot.querySelector(
                    'c-error-panel'
                );
                expect(errorPanelEl).not.toBeNull();
            });
        });
    });
});
