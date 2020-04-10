import { createElement } from 'lwc';
import ErrorPanel from 'c/errorPanel';

/*
A describe block defines a test suite. 
A test suite contains one or more tests that belong together from a functional point of view.
*/

// "c-error-panel" - is a description.
describe('c-error-panel', () => {
    afterEach(() => {
        // Reset the DOM at the end of the test
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    /*
    "it" is an alias for "test".
    An "it" block describes a single test.
    */

    // "displays a default friendly message" - is a description what we are going to do
    it('displays a default friendly message', () => {
        const MESSAGE = 'Error retrieving data';

        // "createElement" - method to create an instance of the component to test
        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        /*
        Add the component to the test's version of document.
        The "appendChild()" call inserts the component into the DOM and
        the lifecycle hooks "connectedCallback()" and "renderedCallback()" are called
        */
        document.body.appendChild(element);

        // Select elements for validation
        const messageEl = element.shadowRoot.querySelector('p');
        // Expect statement is an assertion of the success condition, what we "expect" and what has "toBe".
        expect(messageEl.textContent).toBe(MESSAGE);
    });

    it('displays a custom friendly message', () => {
        const MESSAGE = 'Errors are bad';

        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        element.friendlyMessage = MESSAGE;
        document.body.appendChild(element);

        const messageEl = element.shadowRoot.querySelector('p');
        expect(messageEl.textContent).toBe(MESSAGE);
    });

    it('displays no error details when no errors are passed as parameters', () => {
        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        document.body.appendChild(element);

        const inputEl = element.shadowRoot.querySelector('lightning-input');
        expect(inputEl).toBeNull();
    });

    it('displays error details when errors are passed as parameters', () => {
        const ERROR_MESSAGES_INPUT = [
            { statusText: 'First bad error' },
            { statusText: 'Second bad error' }
        ];
        const ERROR_MESSAGES_OUTPUT = ['First bad error', 'Second bad error'];

        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        element.errors = ERROR_MESSAGES_INPUT;
        document.body.appendChild(element);

        const inputEl = element.shadowRoot.querySelector('lightning-input');
        inputEl.checked = true;
        inputEl.dispatchEvent(new CustomEvent('change'));

        return Promise.resolve().then(() => {
            const messageTexts = Array.from(
                element.shadowRoot.querySelectorAll('p[class="error-message"]')
            ).map((errorMessage) => (errorMessage = errorMessage.textContent));
            expect(messageTexts).toEqual(ERROR_MESSAGES_OUTPUT);
        });
    });
});
