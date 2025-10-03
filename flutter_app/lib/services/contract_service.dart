import 'package:flutter/material.dart';
import 'package:web3dart/web3dart.dart';
import 'wallet_service.dart';

class ContractService extends ChangeNotifier {
  final WalletService _walletService;
  
  // Contract addresses (cần thay bằng địa chỉ thực tế sau khi deploy)
  static const String pioLockAddress = '0x0000000000000000000000000000000000000000';
  static const String pioMintAddress = '0x0000000000000000000000000000000000000000';
  static const String pioTokenAddress = '0x0000000000000000000000000000000000000000';
  
  // Contract ABIs (simplified)
  static const String pioLockABI = '''
  [
    {
      "inputs": [{"name": "amount", "type": "uint256"}, {"name": "destination", "type": "address"}],
      "name": "lock",
      "outputs": [{"name": "lockId", "type": "bytes32"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "lockId", "type": "bytes32"}],
      "name": "approveLock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "lockId", "type": "bytes32"}],
      "name": "rollback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "name": "lockId", "type": "bytes32"},
        {"indexed": true, "name": "sender", "type": "address"},
        {"indexed": true, "name": "destination", "type": "address"},
        {"indexed": false, "name": "amount", "type": "uint256"}
      ],
      "name": "Locked",
      "type": "event"
    }
  ]
  ''';

  static const String pioMintABI = '''
  [
    {
      "inputs": [{"name": "lockId", "type": "bytes32"}, {"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "approveMint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  ''';

  static const String erc20ABI = '''
  [
    {
      "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "approve",
      "outputs": [{"name": "success", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
      "name": "allowance",
      "outputs": [{"name": "amount", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  ''';

  ContractService(this._walletService);

  Future<String> lockPIO(BigInt amount, String destinationAddress) async {
    if (!_walletService.isConnected) {
      throw Exception('Wallet not connected');
    }

    final client = _walletService.client!;
    final credentials = EthPrivateKey.fromHex(_walletService.privateKey!);
    
    // DeployedContract instances
    final lockContract = DeployedContract(
      ContractAbi.fromJson(pioLockABI, 'PIOLock'),
      EthereumAddress.fromHex(pioLockAddress),
    );
    
    final tokenContract = DeployedContract(
      ContractAbi.fromJson(erc20ABI, 'PIO'),
      EthereumAddress.fromHex(pioTokenAddress),
    );

    try {
      // First, approve PIO tokens for the lock contract
      final approveFunction = tokenContract.function('approve');
      final approveTx = Transaction.callContract(
        contract: tokenContract,
        function: approveFunction,
        parameters: [
          EthereumAddress.fromHex(pioLockAddress),
          amount,
        ],
      );
      
      final approveHash = await client.sendTransaction(
        credentials,
        approveTx,
        chainId: _walletService.network == 'Pione Zero' ? 5080 : 5,
      );
      
      // Wait for approval transaction to be mined
      await client.waitForTransactionReceipt(approveHash);
      
      // Then, lock the tokens
      final lockFunction = lockContract.function('lock');
      final lockTx = Transaction.callContract(
        contract: lockContract,
        function: lockFunction,
        parameters: [
          amount,
          EthereumAddress.fromHex(destinationAddress),
        ],
      );
      
      final lockHash = await client.sendTransaction(
        credentials,
        lockTx,
        chainId: _walletService.network == 'Pione Zero' ? 5080 : 5,
      );
      
      return lockHash;
    } catch (e) {
      throw Exception('Failed to lock PIO: $e');
    }
  }

  Future<String> approveLock(String lockId) async {
    if (!_walletService.isConnected) {
      throw Exception('Wallet not connected');
    }

    final client = _walletService.client!;
    final credentials = EthPrivateKey.fromHex(_walletService.privateKey!);
    
    final lockContract = DeployedContract(
      ContractAbi.fromJson(pioLockABI, 'PIOLock'),
      EthereumAddress.fromHex(pioLockAddress),
    );

    try {
      final approveFunction = lockContract.function('approveLock');
      final tx = Transaction.callContract(
        contract: lockContract,
        function: approveFunction,
        parameters: [hexToBytes(lockId)],
      );
      
      final hash = await client.sendTransaction(
        credentials,
        tx,
        chainId: _walletService.network == 'Pione Zero' ? 5080 : 5,
      );
      
      return hash;
    } catch (e) {
      throw Exception('Failed to approve lock: $e');
    }
  }

  Future<String> rollbackLock(String lockId) async {
    if (!_walletService.isConnected) {
      throw Exception('Wallet not connected');
    }

    final client = _walletService.client!;
    final credentials = EthPrivateKey.fromHex(_walletService.privateKey!);
    
    final lockContract = DeployedContract(
      ContractAbi.fromJson(pioLockABI, 'PIOLock'),
      EthereumAddress.fromHex(pioLockAddress),
    );

    try {
      final rollbackFunction = lockContract.function('rollback');
      final tx = Transaction.callContract(
        contract: lockContract,
        function: rollbackFunction,
        parameters: [hexToBytes(lockId)],
      );
      
      final hash = await client.sendTransaction(
        credentials,
        tx,
        chainId: _walletService.network == 'Pione Zero' ? 5080 : 5,
      );
      
      return hash;
    } catch (e) {
      throw Exception('Failed to rollback lock: $e');
    }
  }

  Future<BigInt> getPIOBalance() async {
    if (!_walletService.isConnected) {
      throw Exception('Wallet not connected');
    }

    final client = _walletService.client!;
    final tokenContract = DeployedContract(
      ContractAbi.fromJson(erc20ABI, 'PIO'),
      EthereumAddress.fromHex(pioTokenAddress),
    );

    try {
      final balanceFunction = tokenContract.function('balanceOf');
      final result = await client.call(
        contract: tokenContract,
        function: balanceFunction,
        params: [_walletService.address!],
      );
      
      return result.first as BigInt;
    } catch (e) {
      throw Exception('Failed to get PIO balance: $e');
    }
  }

  Future<BigInt> getWPIOBalance() async {
    if (!_walletService.isConnected) {
      throw Exception('Wallet not connected');
    }

    final client = _walletService.client!;
    final mintContract = DeployedContract(
      ContractAbi.fromJson(pioMintABI, 'PIOMint'),
      EthereumAddress.fromHex(pioMintAddress),
    );

    try {
      final balanceFunction = mintContract.function('balanceOf');
      final result = await client.call(
        contract: mintContract,
        function: balanceFunction,
        params: [_walletService.address!],
      );
      
      return result.first as BigInt;
    } catch (e) {
      throw Exception('Failed to get wPIO balance: $e');
    }
  }
}
