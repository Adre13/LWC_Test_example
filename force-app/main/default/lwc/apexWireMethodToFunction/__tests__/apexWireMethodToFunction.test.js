import { createElement } from 'lwc';
import ApexWireMethodToFunction from 'c/apexWireMethodToFunction';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import getContactList from '@salesforce/apex/ContactController.getContactList';

// Mock with the list of Contact records
const mockGetContactList = require('./data/getContactList.json');

// Mock with an empty list of records
const mockGetContactListNoRecords = require('./data/getContactListNoRecords.json');

//Register as Apex wire adapter
const getContactListAdapter = registerApexTestWireAdapter(getContactList);

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/

// "c-apex-wire-method-to-function" - is a description.
// Salesforce reccomends having a top level describe block with a description matching the component name.
describe('c-apex-wire-method-to-function', () => {
    
    // Reset the DOM at the end of the test
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    // The block of positive tests
    describe('getContactList @wire success', () => {
        /*
        "it" is an alias for "test".
        An "it" block describes a single test.
        */

       // Test that gets six Contacts
        it('renders six records', () => {
            // "createElement" - method to create an instance of the component to test
            const element = createElement('c-apex-wire-method-to-function', {
                is: ApexWireMethodToFunction
            });
            /*
            Add the component to the test's version of document.
            The "appendChild()" call inserts the component into the DOM and
            the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
            */
            document.body.appendChild(element);

            // Emit data from @wire
            getContactListAdapter.emit(mockGetContactList);

            /*
            Return a promise to wait for any asynchronous DOM updates. Jest
            will automatically wait for the Promise chain to complete before
            ending the test and fail the test if the promise rejects.
            */
             return Promise.resolve().then(() => {
                // Select elements for validation
                const detailEls = element.shadowRoot.querySelectorAll('p');
                // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
                expect(detailEls.length).toBe(mockGetContactList.length);
                expect(detailEls[0].textContent).toBe(
                    mockGetContactList[0].Name
                );
            });
        });

        it('renders no items when no records are returned', () => {
            const element = createElement('c-apex-wire-method-to-function', {
                is: ApexWireMethodToFunction
            });
            document.body.appendChild(element);

            getContactListAdapter.emit(mockGetContactListNoRecords);

            return Promise.resolve().then(() => {
                const detailEls = element.shadowRoot.querySelectorAll('p');
                expect(detailEls.length).toBe(
                    mockGetContactListNoRecords.length
                );
            });
        });
    });
    // The bloc of negative and error tests
    describe('getContactList @wire error', () => {
        it('shows error panel element', () => {
            const element = createElement('c-apex-wire-method-to-function', {
                is: ApexWireMethodToFunction
            });
            document.body.appendChild(element);

            // Generate error
            getContactListAdapter.error();

            return Promise.resolve().then(() => {
                const errorPanelEl = element.shadowRoot.querySelector(
                    'c-error-panel'
                );
                expect(errorPanelEl).not.toBeNull();
            });
        });
    });
});
