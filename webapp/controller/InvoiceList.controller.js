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
			// URL da API
			var apiURL = "https://jsonplaceholder.typicode.com/todos";

			// Função para fazer uma solicitação recursiva para obter todos os registros paginados
			var fetchAllData = function (url, allData) {
				return new Promise(function (resolve, reject) {
					var oInvoiceModel = new JSONModel(url);

					oInvoiceModel.attachRequestCompleted(function () {
						var newData = oInvoiceModel.getProperty("/");

						// Concatena os novos dados aos dados existentes
						allData = allData.concat(newData);

						// Verifica se há mais páginas (registros)
						var nextPage = oInvoiceModel.getProperty("/_meta/nextLink");
						if (nextPage) {
							// Se houver mais páginas, faz uma nova solicitação recursiva
							fetchAllData(nextPage, allData).then(resolve).catch(reject);
						} else {
							// Se não houver mais páginas, resolve a promessa com todos os dados
							resolve(allData);
						}
					});

					// Rejeita a promessa se houver um erro na solicitação
					oInvoiceModel.attachRequestFailed(function (oError) {
						reject(oError);
					});
				});
			};

			// Inicia a solicitação inicial
			fetchAllData(apiURL, []).then(function (allData) {
				// Ordena os dados pelo ID
				var aSortedData = allData.sort(function (a, b) {
					return a.id - b.id;
				});

				// Salva os dados no Local Storage
				window.localStorage.setItem("invoiceData", JSON.stringify(aSortedData));

				// Configura o modelo "invoiceData" com os dados da API
				var oInvoiceDataModel = new JSONModel(aSortedData);
				this.getView().setModel(oInvoiceDataModel, "invoiceData");

				// Adiciona um log para verificar os dados após a ordenação
				console.log("Dados ordenados pelo ID:", aSortedData);
			}.bind(this)).catch(function (error) {
				// Lidar com erros, como exibir uma mensagem de erro
				console.error("Erro ao carregar dados da API:", error);
			});
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
			const oBindingContext = oItem.getBindingContext("invoiceData");

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
				const sLocalStorageData = window.localStorage.getItem("invoiceData");
				const oLocalStorageData = sLocalStorageData ? JSON.parse(sLocalStorageData) : {};

				// Verificando se há um status localmente para o item
				const sPath = oBindingContext.getPath();
				const bCompleted = oLocalStorageData[sPath] !== undefined ? oLocalStorageData[sPath] : oBindingContext.getProperty("completed");

				// Passando o status para a rota
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

			// Altera o status no modelo
			oModel.setProperty(sPath + "/completed", !bCompleted);

			// Atualiza o localStorage com o dado alterado
			this.updateLocalStorage(sId, { completed: !bCompleted });

			// Exibe a mensagem de sucesso
			MessageToast.show("Status do registo #" + sId + " alterado para " + (!bCompleted === true ? 'Completo!' : 'Incompleto!'));
		},

		updateLocalStorage: function (sId, oData) {
			// Recupera os dados existentes do localStorage
			var sLocalStorageData = localStorage.getItem("invoiceData");

			// Converte os dados do localStorage para um objeto JavaScript
			var oLocalStorageData = JSON.parse(sLocalStorageData);

			// Itera sobre os dados existentes para encontrar o objeto com o ID correspondente
			for (var i = 0; i < oLocalStorageData.length; i++) {
				if (oLocalStorageData[i].id === sId) {
					// Atualiza o status no objeto local
					oLocalStorageData[i].completed = oData.completed;

					// Atualiza o localStorage com os dados alterados
					localStorage.setItem("invoiceData", JSON.stringify(oLocalStorageData));

					// Log após a alteração no objeto local
					console.log("Elemento Após a Alteração no Local Storage:", oLocalStorageData[i]);

					break;
				}
			}
		},
	});
});
