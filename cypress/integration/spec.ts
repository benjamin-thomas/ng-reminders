// See: ./api/postgrest/manage/dev/create_test_user
const email = 'testuser@example.com';
const password = '123';


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

    cy.get('[type="email"]').type(email);
    cy.get('[type="password"]').type(password);
    cy.get('button').click();

    cy.url().and('include', '/reminders/list');

    cy.get('[data-cy=add-reminder]').click();
    cy.focused().type('First reminder');
    cy.get('[data-cy=save-reminder]').click();


    cy.get('[data-cy=add-reminder]').click();
    cy.focused().type('Second reminder');
    cy.get('[data-cy=save-reminder]').click();

    cy.get('tbody tr').and('have.length', 2);
  });

});
