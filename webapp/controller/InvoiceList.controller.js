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
			if (window.localStorage) {
				// Verifica se há dados armazenados localmente
				var sLocalStorageData = window.localStorage.getItem("invoiceData");

				if (sLocalStorageData) {
					// Se existirem dados, configura o modelo com os dados do Local Storage
					var oLocalStorageData = JSON.parse(sLocalStorageData);
					var oInvoiceDataModel = new JSONModel(oLocalStorageData);
					this.getView().setModel(oInvoiceDataModel, "invoiceData");
				} else {
					// Se não houver dados, faz a consulta à API
					this.loadDataFromAPI();
				}
			}
		},

		loadDataFromAPI: function () {
			var oInvoiceModel = new JSONModel("https://jsonplaceholder.typicode.com/todos");

			oInvoiceModel.attachRequestCompleted(function () {
				var aData = oInvoiceModel.getProperty("/");
				var aSortedData = aData.map(function (item) {
					return item;
				}).sort(function (a, b) {
					return a.id - b.id;
				});

				// Salva os dados no Local Storage
				window.localStorage.setItem("invoiceData", JSON.stringify(aSortedData));

				// Configura o modelo "invoiceData" com os dados da API
				var oInvoiceDataModel = new JSONModel(aSortedData);
				this.getView().setModel(oInvoiceDataModel, "invoiceData");

				// Adiciona um log para verificar os dados após a ordenação
				console.log("Dados ordenados pelo ID:", aSortedData);
			}.bind(this));
		},

		restoreStatusLocally: function () {
			// Verifica se o Local Storage está disponível no navegador
			if (window.localStorage) {
				// Obtém os dados armazenados localmente
				var sLocalStorageData = window.localStorage.getItem("invoiceData");

				// Converte os dados de string JSON para objeto JavaScript
				var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				console.log("Dados armazenados no Local Storage:", oLocalStorageData);

				// Atualiza o modelo com os dados armazenados localmente
				var oModel = this.getView().getModel("invoiceData");

				// Obtém os dados do modelo
				var aData = oModel.getProperty("/");

				// Itera sobre as propriedades do objeto Local Storage
				for (var sPath in oLocalStorageData) {
					if (oLocalStorageData.hasOwnProperty(sPath)) {
						// Encontra o item correspondente no modelo
						var oItem = aData.find(function (item) {
							return item.id.toString() === sPath;
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
			const oBindingContext = oItem.getBindingContext("invoiceData");

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
			var oModel = this.getView().getModel("invoiceData");
			var oContext = oCheckBox.getBindingContext("invoiceData");
			var sPath = oContext.getPath();
			var bCompleted = oModel.getProperty(sPath + "/completed");
			var sId = oModel.getProperty(sPath + "/id");

			console.log("Antes da alteração - ID:", sId, "Completed:", bCompleted);

			// Altera o status em memória apenas para a linha correspondente
			oModel.setProperty(sPath + "/completed", !bCompleted);

			// Itera sobre o modelo local para encontrar o objeto com o ID correspondente
			var aData = oModel.getProperty("/");
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].id === sId) {
					// Log antes da alteração no objeto local
					console.log("Elemento Antes da Alteração:", aData[i]);

					// Altera o status no objeto local
					aData[i].completed = !bCompleted;

					// Log após a alteração no objeto local
					console.log("Elemento Após a Alteração:", aData[i]);

					// Atualiza o localStorage com os dados alterados
					this.updateLocalStorage(sId, aData[i]);

					break;
				}
			}

			// Atualiza o modelo com os dados modificados
			oModel.setProperty("/", aData);

			// Salva o status localmente (usando o Local Storage) apenas para a linha correspondente
			this.saveStatusLocally(sId, !bCompleted);

			console.log("Após a alteração - ID:", sId, "Novo Completed:", !bCompleted);

			// Exibe mensagem de sucesso
			MessageToast.show("Status alterado com sucesso para o ID " + sId);
		},

		updateLocalStorage: function (sId, oData) {
			if (window.localStorage) {
				// Obtém os dados armazenados localmente
				var sLocalStorageData = window.localStorage.getItem("invoiceData");
				var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				// Atualiza o Local Storage com os dados alterados
				oLocalStorageData[sId] = oData;

				// Salva os dados no Local Storage
				window.localStorage.setItem("invoiceData", JSON.stringify(oLocalStorageData));
			}
		},


		saveStatusLocally: function (sId, bCompleted) {
			if (window.localStorage) {
				// Obtém os dados armazenados localmente
				var sLocalStorageData = window.localStorage.getItem("invoiceData");
				var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				// Encontra o objeto no Local Storage pelo ID
				var oOriginalData = oLocalStorageData[sId];

				// Cria um novo objeto com todos os campos originais e atualiza o campo "completed"
				var oUpdatedData = {
					userId: oOriginalData.userId,
					id: oOriginalData.id,
					title: oOriginalData.title,
					completed: bCompleted
				};

				// Atualiza o Local Storage com o novo objeto
				oLocalStorageData[sId] = oUpdatedData;

				// Salva os dados no Local Storage
				window.localStorage.setItem("invoiceData", JSON.stringify(oLocalStorageData));
			}
		},

		refreshView: function () {
			var oModel = this.getView().getModel("invoiceData");

			// Obtém os dados armazenados localmente
			var sLocalStorageData = window.localStorage.getItem("invoiceData");
			var oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

			// Atualiza o modelo com os dados do Local Storage
			oModel.setData(oLocalStorageData);

			// Atualiza a view para refletir as alterações
			oModel.refresh();
		},


	});
});
