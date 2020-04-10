import { createElement } from 'lwc';
import WireGetPicklistValues from 'c/wireGetPicklistValues';
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

// Mock with the list of realistic values
const mockGetPicklistValues = require('./data/getPicklistValues.json');

// Register as an Lightning Data Service(LDS) wire adapter
const getPicklistValuesAdapter = registerLdsTestWireAdapter(getPicklistValues);

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/

// "c-wire-get-picklist-values" - is a description.
// Salesforce reccomends having a top level describe block with a description matching the component name.
describe('c-wire-get-picklist-values', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // The block of positive tests
    describe('getPicklistValues @wire data', () => {
        /*
        "it" is an alias for "test".
        An "it" block describes a single test.
        */

        it('renders seven lightning-input fields of type checkbox', () => {
            // "createElement" - method to create an instance of the component to test
            const element = createElement('c-wire-get-picklist-values', {
                is: WireGetPicklistValues
            });
            /*
            Add the component to the test's version of document.
            The "appendChild()" call inserts the component into the DOM and
            the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
            */
            document.body.appendChild(element);

            // Emit data from @wire
            getPicklistValuesAdapter.emit(mockGetPicklistValues);

            // Return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the promise rejects.
            return Promise.resolve().then(() => {
                // Select elements for validation
                const checkboxEls = element.shadowRoot.querySelectorAll(
                    'lightning-input'
                );
                // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
                // Check that we received the expected quantity of values
                expect(checkboxEls.length).toBe(
                    mockGetPicklistValues.values.length
                );

                checkboxEls.forEach((checkboxEl) => {
                    expect(checkboxEl.type).toBe('checkbox');
                });
            });
        });
    });
    // THe block of negative and error tests
    describe('getObjectInfo @wire error', () => {
        it('shows error panel element', () => {
            const element = createElement('c-wire-get-picklist-values', {
                is: WireGetPicklistValues
            });
            document.body.appendChild(element);

            // Generate error
            getPicklistValuesAdapter.error();

            return Promise.resolve().then(() => {
                const errorPanelEl = element.shadowRoot.querySelector(
                    'c-error-panel'
                );
                expect(errorPanelEl).not.toBeNull();
            });
        });
    });
});
