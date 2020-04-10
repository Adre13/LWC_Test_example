import { createElement } from 'lwc';
import PubsubContactDetails from 'c/pubsubContactDetails';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { getRecord } from 'lightning/uiRecordApi';
import {
    registerLdsTestWireAdapter,
    registerTestWireAdapter
} from '@salesforce/sfdx-lwc-jest';
import { CurrentPageReference } from 'lightning/navigation';

const mockGetRecord = require('./data/getRecord.json');

// Register as a Lightning Data Service(LDS) wire adapter
const getRecordAdapter = registerLdsTestWireAdapter(getRecord);

// Mock out the event firing function to verify it was called with expected parameters.
jest.mock('c/pubsub', () => {
    return {
        registerListener: jest.fn(),
        unregisterAllListeners: jest.fn()
    };
});

// Register as a standard wire adapter because the component under test requires this adapter.
// We don't exercise this wire adapter in the tests.
registerTestWireAdapter(CurrentPageReference);

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/

// "c-pubsub-contact-details" - is a description.
// Salesforce reccomends having a top level describe block with a description matching the component name.
describe('c-pubsub-contact-details', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    /*
    "it" is an alias for "test".
    An "it" block describes a single test.
    */

    it('registers and unregisters the pubsub listener during the component lifecycle', () => {
        // "createElement" - method to create an instance of the component to test
        const element = createElement('c-pubsub-contact-details', {
            is: PubsubContactDetails
        });
        /*
        Add the component to the test's version of document.
        The "appendChild()" call inserts the component into the DOM and
        the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
        */
        document.body.appendChild(element);

        // Validate if pubsub got registered after connected to the DOM
        // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
        expect(registerListener.mock.calls.length).toBe(1);
        expect(registerListener.mock.calls[0][0]).toBe('contactSelected');

        // Validate if pubsub got unregistered after disconnected from the DOM
        document.body.removeChild(element);
        expect(unregisterAllListeners.mock.calls.length).toBe(1);
    });

    //The block with positive test
    describe('getRecord @wire data', () => {
        it('renders contact details with picture', () => {
            const element = createElement('c-pubsub-contact-details', {
                is: PubsubContactDetails
            });
            document.body.appendChild(element);

            // Emit data from @wire
            getRecordAdapter.emit(mockGetRecord);

            // Return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the promise rejects.
            return Promise.resolve().then(() => {
                // Select elements for validation
                const imgEl = element.shadowRoot.querySelector('img');
                expect(imgEl.src).toBe(
                    mockGetRecord.result.fields.Picture__c.value
                );

                const nameEl = element.shadowRoot.querySelector('p');
                expect(nameEl.textContent).toBe(
                    mockGetRecord.result.fields.Name.value
                );

                const phoneEl = element.shadowRoot.querySelector(
                    'lightning-formatted-phone'
                );
                expect(phoneEl.value).toBe(
                    mockGetRecord.result.fields.Phone.value
                );

                const emailEl = element.shadowRoot.querySelector(
                    'lightning-formatted-email'
                );
                expect(emailEl.value).toBe(
                    mockGetRecord.result.fields.Email.value
                );
            });
        });
    });
    // Negative or error test block.
    describe('getRecord @wire error', () => {
        // Test that ShowToastEvent was called
        it('displays a toast message', () => {
            const element = createElement('c-pubsub-contact-details', {
                is: PubsubContactDetails
            });
            document.body.appendChild(element);
            const handler = jest.fn();
            element.addEventListener('lightning__showtoast', handler);

            //Generate error
            getRecordAdapter.error();

            return Promise.resolve().then(() => {
                expect(handler).toHaveBeenCalled();
            });
        });
    });
});
