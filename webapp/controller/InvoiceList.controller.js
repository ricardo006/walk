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

				if (window.localStorage) {
					// Converte o array de objetos para uma string JSON
					var sDataString = JSON.stringify(aSortedData);

					// Salva os dados no Local Storage
					window.localStorage.setItem("invoiceData", sDataString);
				}

				// Adiciona um log para verificar os dados após a ordenação
				console.log("Dados ordenados pelo ID:", aSortedData);
			}.bind(this));

			this.getView().setModel(oInvoiceModel, "invoice");
			this.restoreStatusLocally();
		},


		restoreStatusLocally: function () {
			// Verifica se o Local Storage está disponível no navegador
			if (window.localStorage) {
				// Obtém os dados armazenados localmente
				var sLocalStorageData = window.localStorage.getItem("invoiceStatus");

				// Converte os dados de string JSON para objeto JavaScript
				var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				// Atualiza o modelo com os dados armazenados localmente
				var oModel = this.getView().getModel("invoice");

				// Obtém os dados do modelo
				var aData = oModel.getProperty("/");

				// Itera sobre as propriedades do objeto Local Storage
				for (var sPath in oLocalStorageData) {
					if (oLocalStorageData.hasOwnProperty(sPath)) {
						// Encontra o item correspondente no modelo
						var oItem = aData.find(function (item) {
							return oModel.getCanonicalPath(oModel.createBindingContext("/" + item.id, null, { isRelative: false })) === sPath;
						});

						// Atualiza o status do item no modelo
						if (oItem) {
							oItem.completed = oLocalStorageData[sPath];
						}
					}
				}

				// Atualiza o modelo com os dados modificados
				oModel.setProperty("/", aData);
			}
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

		onShowDetails: function (oEvent) {
			const oItem = oEvent.getSource();
			const oBindingContext = oItem.getBindingContext("invoice");

			if (oBindingContext) {
				const sId = oBindingContext.getProperty("id");

				// Obtém os dados armazenados localmente
				const sLocalStorageData = window.localStorage.getItem("invoiceStatus");
				const oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				// Verifica se há um status armazenado localmente para o item
				const sPath = oBindingContext.getPath();
				const bCompleted = oLocalStorageData[sPath] !== undefined ? oLocalStorageData[sPath] : oBindingContext.getProperty("completed");

				// Agora você pode passar o status para a rota
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("detail", {
					invoicePath: window.encodeURIComponent(sPath.substr(1)),
					invoiceId: sId,
					completedStatus: bCompleted
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

			// Salva o status localmente (usando o Local Storage)
			this.saveStatusLocally(sPath, !bCompleted);

			// Exibe mensagem de sucesso
			MessageToast.show("Status alterado com sucesso!");

			// Atualiza a view para refletir as alterações
			this.refreshView();
		},

		refreshView: function () {
			var oModel = this.getView().getModel("invoice");
			oModel.refresh();
		},

	});
});
