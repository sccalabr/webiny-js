import { TestPAT } from "./common";

context("Account PATs Module", () => {
    beforeEach(() => cy.login());

    it("should be able to create, edit, save and delete tokens", () => {
        TestPAT({
            PATComponentRoute: "/account"
        });
    });
});
