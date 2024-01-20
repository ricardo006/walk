sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], (Controller, History, MessageToast, JSONModel) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Detail", {
		onInit() {
			const oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);
		},

		onObjectMatched: function (oEvent) {
			var oModel = this.getView().getModel("invoiceData");
			var sInvoiceId = oEvent.getParameter("arguments").invoiceId;

			// Encontrar o objeto no modelo com base no ID
			var oInvoice = oModel.getObject("/" + sInvoiceId);

			// Verificar se o objeto foi encontrado
			if (oInvoice) {
				// Vincular o elemento encontrado
				this.getView().bindElement({
					path: "/" + sInvoiceId,
					model: "invoice"
				});
			} else {
				// Se o objeto não foi encontrado, você pode lidar com isso, talvez exibindo uma mensagem ou navegando de volta para a visão geral
				MessageToast.show("Detalhes não encontrados para o ID: " + sInvoiceId);
				this.onNavBack();
			}
		},

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		},

		onRatingChange(oEvent) {
			const fValue = oEvent.getParameter("value");
			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			MessageToast.show(oResourceBundle.getText("ratingConfirmation", [fValue]));
		}
	});
});