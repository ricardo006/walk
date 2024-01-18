sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sInvoicePath = "/" + window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath);
            var sInvoiceId = oEvent.getParameter("arguments").invoiceId;
            var bCompletedStatus = oEvent.getParameter("arguments").completedStatus;

            // Agora você pode usar sInvoicePath, sInvoiceId e bCompletedStatus conforme necessário
            // para vincular os dados corretos ao modelo da visão (invoice) ou ao contexto de ligação da visão
            // e exibir os detalhes na página.

            // Exemplo: Vincule os dados ao modelo da visão
            var oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");

            var oInvoiceModel = new JSONModel("https://jsonplaceholder.typicode.com/todos" + sInvoiceId);
            this.getView().setModel(oInvoiceModel, "invoice");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("master");
        },

        onRatingChange: function (oEvent) {
            // Lógica de manipulação de alteração de classificação, se necessário
        }
    });
});
