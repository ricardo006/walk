sap.ui.define([
	"sap/ui/core/util/MockServer"
], (MockServer) => {
	"use strict";

	return {

		init() {
			// Crie o servidor de mock
			const oMockServer = new MockServer({
				rootUri: "https://jsonplaceholder.typicode.com/todos"
			});

			// Configure o servidor de mock com um atraso opcional
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			// Simule com base nos metadados e dados da API
			const sPath = sap.ui.require.toUrl("ui5/walkthrough/localService");
			oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");

			// Adicione um interceptor para logar as solicitações
			oMockServer.attachBefore("GET", (oEvent) => {
				const sUrl = oEvent.getParameter("url");
				console.log("Mock Server Request:", sUrl);

				// Intercepte solicitações GET e forneça a lista completa de registros
				if (sUrl.indexOf("$filter") === -1) {
					const oResponse = {
						status: 200,
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							value: oMockServer.getEntitySetData("YourEntitySetName")
						})
					};
					oEvent.getParameter("requestHandle").respond(oResponse);
				}
			});

			// Inicie o servidor de mock
			oMockServer.start();
		}
	};
});
