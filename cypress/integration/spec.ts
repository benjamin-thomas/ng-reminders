// See: ./api/postgrest/manage/dev/create_test_user

const email = 'testuser@example.com';
const password = '123';
const DATETIME_LOCAL = Cypress.moment.HTML5_FMT.DATETIME_LOCAL;

function createReminder(descr: string, due?: string) {
  cy.get('[data-cy=add-reminder]').click();
  cy.focused().type(descr);

  if (due) {
    cy.get('[data-cy="due"]').type(due);
  }

  cy.get('[data-cy=save-reminder]').click();
}

function login() {

  cy.get('[type="email"]').type(email);
  cy.get('[type="password"]').type(password);
  cy.get('button').click();
}

describe('Authentication', () => {

  beforeEach(() => {
    cy.exec('./api/postgrest/manage/dev/create_test_user');
  });

  it('requires selecting a backend first', () => {
    cy.visit('/');
    cy.contains('Select a backend!');
    cy.get('select').select('PostgREST');
    cy.get('button').click();

    // intelliJ shows weird error with `should` alias
    cy.url().and('include', '/login');
    login();

    cy.url().and('include', '/reminders/list');
    const tomorrow = Cypress.moment().add(1, 'day');

    createReminder('First reminder', tomorrow.format(DATETIME_LOCAL));
    createReminder('Second reminder');

    cy.get('tbody tr').and('have.length', 0);

    cy.get('[data-cy="check-due"]').click(); // checked -> unchecked
    cy.get('tbody tr').and('have.length', 2);

    const firstRow = 'tbody tr:nth-child(1)';
    cy.get(firstRow).click()
      .and('have.class', 'selected');

    cy.get('.selected [data-cy="check-done"]').click();
    cy.get('[data-cy="delete-all-done"]').click();

    cy.get('tbody tr').and('have.length', 1);

    cy.get('[data-cy="due"]').should(td => {
      const dateTxt = td.data().cyDate;
      expect(new Date(dateTxt).toISOString())
        .to.equal(tomorrow.seconds(0).milliseconds(0).toISOString());
    });
  });

});
