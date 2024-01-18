sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageToast, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
		onInit() {
			const oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

			// Assume que você tem um modelo chamado "invoice" já configurado
			const oInvoiceModel = new JSONModel("https://jsonplaceholder.typicode.com/todos");

			oInvoiceModel.attachRequestCompleted(function () {
				// Obtém os dados do modelo
				const aData = oInvoiceModel.getProperty("/");

				// Ordena os dados pelo campo "id" usando map
				const aSortedData = aData.map(function (item) {
					return item;
				}).sort(function (a, b) {
					return a.id - b.id;
				});

				// Atualiza o modelo com os dados já ordenados
				oInvoiceModel.setProperty("/", aSortedData);

				// Adiciona um log para verificar os dados após a ordenação
				console.log("Dados ordenados pelo ID:", aSortedData);
			});

			this.getView().setModel(oInvoiceModel, "invoice");
		},

		sortDataById: function () {
			var oModel = this.getView().getModel("invoice");
			var aData = oModel.getProperty("/");

			// Ordena os dados pelo campo "id" em ordem crescente
			aData.sort(function (a, b) {
				return a.id - b.id;
			});

			// Atualiza o modelo com os dados ordenados
			oModel.setProperty("/", aData);

			// Adiciona um log para verificar os dados após a ordenação
			console.log("Dados ordenados pelo ID:", aData);
		},

		onFilterInvoices(oEvent) {
			// build filter array
			const aFilter = [];
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("title", FilterOperator.Contains, sQuery));
			}

			// filter binding
			const oList = this.byId("invoiceList");
			const oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		onPress(oEvent) {
			const oItem = oEvent.getSource();
			const oBindingContext = oItem.getBindingContext("invoice");

			if (oBindingContext) {
				const sId = oBindingContext.getProperty("id");
				const oRouter = this.getOwnerComponent().getRouter();

				oRouter.navTo("detail", {
					invoicePath: window.encodeURIComponent(oBindingContext.getPath().substr(1)),
					invoiceId: sId
				});
			} else {
				console.error("O contexto de ligação ('binding context') não está disponível.");
			}
		},

		onShowDetails(oEvent) {
			const oItem = oEvent.getSource();
			const oBindingContext = oItem.getBindingContext("invoice");

			if (oBindingContext) {
				const sId = oBindingContext.getProperty("id");

				// Agora você tem o ID, e pode passá-lo para a rota
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("detail", {
					invoicePath: window.encodeURIComponent(oBindingContext.getPath().substr(1)),
					invoiceId: sId
				});
			} else {
				console.error("O contexto de ligação ('binding context') não está disponível.");
			}
		},

		onToggleCompleted: function (oEvent) {
			var oCheckBox = oEvent.getSource();
			var oModel = this.getView().getModel("invoice");
			var oContext = oCheckBox.getBindingContext("invoice");
			var sPath = oContext.getPath();
			var bCompleted = oModel.getProperty(sPath + "/completed");

			// Altera o status em memória
			oModel.setProperty(sPath + "/completed", !bCompleted);

			// Mensagem de sucesso
			var sStatusMessage = bCompleted ? "incompleto" : "completo";
			console.log("Status alterado:", sStatusMessage);

			// Exibe mensagem de sucesso
			MessageToast.show("Status alterado para " + sStatusMessage + " com sucesso!");
		}
	});
});
