sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], (Controller, History, MessageToast, JSONModel) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Detail", {
		onInit() {
			// Criação de um modelo JSON vazio e define na visão com o nome "invoice"
			var oInvoiceModel = new JSONModel();
			this.getView().setModel(oInvoiceModel, "invoice");

			// Obtém a instância do roteador e anexa o manipulador ao evento "patternMatched"
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);
		},

		onObjectMatched: function (oEvent) {
			// Obtém o ID da fatura da rota
			var sInvoiceId = oEvent.getParameter("arguments").invoiceId;

			// Obtém os dados armazenados localmente
			var sLocalStorageData = window.localStorage.getItem("invoiceData");
			var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

			// Busca o objeto correspondente ao ID no Local Storage usando map
			var aKeys = Object.keys(oLocalStorageData);
			var oInvoice = aKeys.map(function (key) {
				return oLocalStorageData[key];
			}).find(function (invoice) {
				return invoice.id === parseInt(sInvoiceId);
			});

			// Verifica se o objeto com o ID esperado está presente no Local Storage
			if (oInvoice) {
				// Define os dados do objeto no modelo "invoice"
				this.getView().getModel("invoice").setData(oInvoice);

				// Adiciona logs para verificar os dados
				console.log("ID esperado:", sInvoiceId);
				console.log("Chaves reais no Local Storage:", Object.keys(oLocalStorageData));
				console.log("Dados do objeto no Local Storage:", oInvoice);
				console.log("Dados do modelo 'invoice':", this.getView().getModel("invoice").getData());
			} else {
				// Se o objeto não foi encontrado, exibe uma mensagem ou navega de volta para a visão geral
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