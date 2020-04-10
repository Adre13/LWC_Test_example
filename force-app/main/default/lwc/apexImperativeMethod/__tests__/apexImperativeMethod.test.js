import { createElement } from 'lwc';
import ApexImperativeMethod from 'c/apexImperativeMethod';
import getContactList from '@salesforce/apex/ContactController.getContactList';

// Mocking imperative Apex method call
jest.mock(
    '@salesforce/apex/ContactController.getContactList',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

// Sample data for imperative Apex call
const APEX_CONTACTS_SUCCESS = [
    {
        Id: '0031700000pJRRSAA4',
        Name: 'Amy Taylor',
        Title: 'VP of Engineering',
        Phone: '4152568563',
        Email: 'amy@demo.net',
        Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/amy_taylor.jpg'
    },
    {
        Id: '0031700000pJRRTAA4',
        Name: 'Michael Jones',
        Title: 'VP of Sales',
        Phone: '4158526633',
        Email: 'michael@demo.net',
        Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/michael_jones.jpg'
    }
];

// Sample error for imperative Apex call
const APEX_CONTACTS_ERROR = {
    body: { message: 'An internal server error has occurred' },
    ok: false,
    status: 400,
    statusText: 'Bad Request'
};

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/

// "c-apex-imperative-method" - is a description.
// Salesforce reccomends having a top level describe block with a description matching the component name.
describe('c-apex-imperative-method', () => {
    // Reset the DOM at the end of the test
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    function flushPromises() {
        // eslint-disable-next-line no-undef
        return new Promise((resolve) => setImmediate(resolve));
    }

    /*
    "it" is an alias for "test".
    An "it" block describes a single test.
    */
    it('renders two contacts returned from imperative Apex call', () => {
        // Assign mock value for resolved Apex promise
        getContactList.mockResolvedValue(APEX_CONTACTS_SUCCESS);

        // "createElement" - method to create an instance of the component to test
        const element = createElement('c-apex-imperative-method', {
            is: ApexImperativeMethod
        });
        /*
        Add the component to the test's version of document.
        The "appendChild()" call inserts the component into the DOM and
        the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
        */
        document.body.appendChild(element);

        // Select button for executing Apex call
        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        /* 
        Return an immediate flushed promise (after the Apex call) to then
        wait for any asynchronous DOM updates. Jest will automatically wait
        for the Promise chain to complete before ending the test and fail
        the test if the promise ends in the rejected state.
        */
         return flushPromises().then(() => {
            // Select div for validating conditionally changed text content
            const detailEls = element.shadowRoot.querySelectorAll(
                'p:not([class])'
            );
            // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
            expect(detailEls.length).toBe(APEX_CONTACTS_SUCCESS.length);
            expect(detailEls[0].textContent).toBe(
                APEX_CONTACTS_SUCCESS[0].Name
            );
            expect(detailEls[1].textContent).toBe(
                APEX_CONTACTS_SUCCESS[1].Name
            );
        });
    });

    it('renders the error panel when the Apex method returns an error', () => {
        // Assign mock value for rejected Apex promise
        getContactList.mockRejectedValue(APEX_CONTACTS_ERROR);

        const element = createElement('c-apex-imperative-method', {
            is: ApexImperativeMethod
        });
        document.body.appendChild(element);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        return flushPromises().then(() => {
            const errorPanelEl = element.shadowRoot.querySelector(
                'c-error-panel'
            );
            expect(errorPanelEl).not.toBeNull();
        });
    });
});
