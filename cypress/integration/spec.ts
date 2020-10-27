it('requires selecting a backend first', () => {
  cy.visit('/');
  cy.contains('Select a backend!');
});
