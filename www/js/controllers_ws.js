angular.module('starter.controllers', [])
.controller('WalletCtrl', function ($scope, $ionicPopup, UIHelper, Account, Commands, Settings) {
	$scope.$on('accountInfoLoaded', function (event) {
		$scope.account = Account.get();
		$scope.$apply();
	});
	$scope.account = Account.get();
	
	$scope.shareKeys = function () {
	    backupString = btoa(JSON.stringify(Settings.getKeys()));
		body = 'centaurus:backup001' + backupString;
		window.location.href = 'mailto:?subject=My%20Stellar%20Keys&body=' + body;
	};

	$scope.importKeys = function () {
	  $scope.data = {}
	  var myPopup = $ionicPopup.show({
		templateUrl: 'templates/importKeys.html',
		title: 'Enter your wallet backup string',
		subTitle: 'or plain key pair',
		scope: $scope,
		buttons: [
		  { text: 'Cancel' },
		  {
			text: '<b>Import</b>',
			type: 'button-positive',
			onTap: function(e) {
				var cmd = Commands.parse($scope.data.backupCommandString);					
				if(cmd.isCommand){
					return Commands.execute(cmd.rawCommand);
				}
				else if($scope.data.address && $scope.data.secret)
				{
					// TODO: validate address and secret
					return Commands.importAddressAndSecret($scope.data.address, $scope.data.secret);
				}
				else{
					UIHelper.showAlert('not a valid backup string or key pair!');
					e.preventDefault();
				}
			}
		  },
		]
	  });
	};
})

.controller('SendCtrl', function ($scope, UIHelper, Account, Remote, Settings, QR, Commands) {
	var account = Account.get();
	$scope.$on('accountInfoLoaded', function (event) {
		account = Account.get();
		$scope.available = account.balance - account.reserve;
		$scope.account = account;
		$scope.$apply();
	});

	$scope.available = account.balance - account.reserve;
	$scope.account = account;
	$scope.paymentData = {
		destinationAddress : '',
		amount : null,
		currency : 'STR'
	}

	$scope.sendPayment = function () {
		UIHelper.blockScreen("To the moon...", 8);
		var keys = Settings.getKeys();
		var data = {
			command : 'submit',
			tx_json : {
				TransactionType : 'Payment',
				Account : keys.address,
				Destination : $scope.paymentData.destinationAddress,
				Amount : $scope.paymentData.amount * 1000000,
			},
			secret : keys.secret
		};
		Remote.send(data);
	};
	
	$scope.scanCode = function () {
	
		// var text = 'centaurus:backup001eyJhZGRyZXNzIjoiZ0VQTGJvUWpvdXdkUkJvVnppOHZ3TGQyU1dqWmEzeGNUTCIsInNlY3JldCI6InNmbUIzNEFNdUFQcmdiZ2VGSjdpWHhpMTROYUt4UWZjWG9FZXgzcDRUcWVrQWd2aW5oYSIsIm1vZGUiOiJsb2FkZWQifQ==';
		// // var text = 'centaurus:backup001eyJhZGRyZXNzIjoiZzN2Ynl1azJyYnZMTkVkRGVrY3JFaE1xUWl4bVExUThWeiIsInNlY3JldCI6InNmRXBtMzlwdEJjWFc4c21zUnlCRnZKaWVXVGQ0WG05MUc4bkh0cGVrV2Z3UnpvZTFUUCIsIm1vZGUiOiJsb2FkZWQifQ==';
		// var cmd = Commands.parse(text);					
		// if(cmd.isCommand){
			// Commands.execute(cmd.rawCommand);
		// }
		QR.scan(
			function (result) {
				if (!result.cancelled) {
					var cmd = Commands.parse(result.text);					
					if(cmd.isCommand){
						Commands.execute(cmd.rawCommand);
					}
					else{
						$scope.paymentData = {
							destinationAddress : result.text,
							currency : 'STR'
						}
						$scope.$apply();
					}
				}
			},
			function (error) {
				UIHelper.showAlert("Scanning failed: " + error);
			}
		);
	};

	$scope.donate = function () {
		$scope.paymentData = {
			destinationAddress : 'gwhiWKCTvS8Mb5kZeGygeiyQKmFTUJfN1D',
			amount : Math.floor(0.02 * account.balance),
			currency : 'STR'
		}
	};
})

.controller('ReceiveCtrl', function ($scope, Account) {
	$scope.$on('accountInfoLoaded', function (event) {
		$scope.account = Account.get();
		$scope.$apply();
	});
	$scope.account = Account.get();
	new QRCode(document.getElementById("QRCODE"), {
		width : 128,
		height : 128,
		text : Account.get().address
	});
	$scope.share = function () {
		window.location.href = 'mailto:?subject=My%20Stellar%20Address&body=You%20can%20send%20me%20Stellars%20to%20the%20address%20' + $scope.account.address + '.'
	}
})

.controller('AboutCtrl', function ($scope) {	
});